import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Lead, FilterParams, ScrapedRawData, LeadStatus } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/saasquatch.db');

// Ensure data folder exists
import fs from 'fs';
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT UNIQUE NOT NULL,
      website TEXT NOT NULL,
      description TEXT,
      industry TEXT NOT NULL,
      location TEXT NOT NULL,
      country TEXT NOT NULL,
      founded_year INTEGER,
      employee_count INTEGER,
      estimated_revenue TEXT NOT NULL,
      estimated_ebitda TEXT NOT NULL,
      ownership_type TEXT NOT NULL,
      succession_risk TEXT NOT NULL,
      eta_score INTEGER NOT NULL,
      eta_score_breakdown TEXT NOT NULL,
      contacts TEXT NOT NULL,
      technologies TEXT NOT NULL,
      deal_thesis TEXT,
      acquisition_letter TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      scraped_at TEXT NOT NULL,
      last_enriched_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_leads_domain ON leads(domain);
    CREATE INDEX IF NOT EXISTS idx_leads_eta_score ON leads(eta_score);
    CREATE INDEX IF NOT EXISTS idx_leads_industry ON leads(industry);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

    CREATE TABLE IF NOT EXISTS scrape_cache (
      domain TEXT PRIMARY KEY,
      raw_data TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_cache_expires ON scrape_cache(expires_at);
  `);
}

function mapRowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name,
    domain: row.domain,
    website: row.website,
    description: row.description || '',
    industry: row.industry,
    location: row.location,
    country: row.country,
    foundedYear: row.founded_year,
    employeeCount: row.employee_count,
    estimatedRevenue: row.estimated_revenue,
    estimatedEbitda: row.estimated_ebitda,
    ownershipType: row.ownership_type,
    successionRisk: row.succession_risk,
    etaScore: row.eta_score,
    etaScoreBreakdown: JSON.parse(row.eta_score_breakdown || '{}'),
    contacts: JSON.parse(row.contacts || '[]'),
    technologies: JSON.parse(row.technologies || '[]'),
    dealThesis: row.deal_thesis || '',
    acquisitionLetter: row.acquisition_letter || '',
    status: row.status as LeadStatus,
    scrapedAt: row.scraped_at,
    lastEnrichedAt: row.last_enriched_at
  };
}

export function getLeads(filters: FilterParams = {}) {
  let query = `SELECT * FROM leads WHERE 1=1`;
  const params: any[] = [];

  if (filters.query) {
    query += ` AND (name LIKE ? OR domain LIKE ? OR description LIKE ? OR location LIKE ?)`;
    const term = `%${filters.query}%`;
    params.push(term, term, term, term);
  }

  if (filters.industry && filters.industry !== 'all') {
    query += ` AND industry = ?`;
    params.push(filters.industry);
  }

  if (filters.location && filters.location !== 'all') {
    query += ` AND location LIKE ?`;
    params.push(`%${filters.location}%`);
  }

  if (filters.minEtaScore !== undefined && filters.minEtaScore > 0) {
    query += ` AND eta_score >= ?`;
    params.push(filters.minEtaScore);
  }

  if (filters.successionRisk && filters.successionRisk !== ('all' as any)) {
    query += ` AND succession_risk = ?`;
    params.push(filters.successionRisk);
  }

  if (filters.ownershipType && filters.ownershipType !== ('all' as any)) {
    query += ` AND ownership_type = ?`;
    params.push(filters.ownershipType);
  }

  if (filters.status && filters.status !== ('all' as any)) {
    query += ` AND status = ?`;
    params.push(filters.status);
  }

  query += ` ORDER BY eta_score DESC, scraped_at DESC`;

  const limit = filters.limit || 50;
  const page = filters.page || 1;
  const offset = (page - 1) * limit;

  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  // Total count
  let countQuery = `SELECT COUNT(*) as total FROM leads WHERE 1=1`;
  const countParams = params.slice(0, -2); // remove limit and offset
  if (filters.query) {
    countQuery += ` AND (name LIKE ? OR domain LIKE ? OR description LIKE ? OR location LIKE ?)`;
  }
  if (filters.industry && filters.industry !== 'all') {
    countQuery += ` AND industry = ?`;
  }
  if (filters.location && filters.location !== 'all') {
    countQuery += ` AND location LIKE ?`;
  }
  if (filters.minEtaScore !== undefined && filters.minEtaScore > 0) {
    countQuery += ` AND eta_score >= ?`;
  }
  if (filters.successionRisk && filters.successionRisk !== ('all' as any)) {
    countQuery += ` AND succession_risk = ?`;
  }
  if (filters.ownershipType && filters.ownershipType !== ('all' as any)) {
    countQuery += ` AND ownership_type = ?`;
  }
  if (filters.status && filters.status !== ('all' as any)) {
    countQuery += ` AND status = ?`;
  }

  const countStmt = db.prepare(countQuery);
  const countResult: any = countStmt.get(...countParams);

  return {
    leads: rows.map(mapRowToLead),
    total: countResult?.total || 0,
    page,
    limit
  };
}

export function getLeadById(id: string): Lead | null {
  const stmt = db.prepare(`SELECT * FROM leads WHERE id = ?`);
  const row = stmt.get(id);
  return row ? mapRowToLead(row) : null;
}

export function getLeadByDomain(domain: string): Lead | null {
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const stmt = db.prepare(`SELECT * FROM leads WHERE domain = ?`);
  const row = stmt.get(cleanDomain);
  return row ? mapRowToLead(row) : null;
}

export function upsertLead(lead: Lead): Lead {
  const stmt = db.prepare(`
    INSERT INTO leads (
      id, name, domain, website, description, industry, location, country,
      founded_year, employee_count, estimated_revenue, estimated_ebitda,
      ownership_type, succession_risk, eta_score, eta_score_breakdown,
      contacts, technologies, deal_thesis, acquisition_letter, status,
      scraped_at, last_enriched_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
    ON CONFLICT(domain) DO UPDATE SET
      name=excluded.name,
      website=excluded.website,
      description=excluded.description,
      industry=excluded.industry,
      location=excluded.location,
      country=excluded.country,
      founded_year=coalesce(excluded.founded_year, leads.founded_year),
      employee_count=coalesce(excluded.employee_count, leads.employee_count),
      estimated_revenue=excluded.estimated_revenue,
      estimated_ebitda=excluded.estimated_ebitda,
      ownership_type=excluded.ownership_type,
      succession_risk=excluded.succession_risk,
      eta_score=excluded.eta_score,
      eta_score_breakdown=excluded.eta_score_breakdown,
      contacts=excluded.contacts,
      technologies=excluded.technologies,
      deal_thesis=excluded.deal_thesis,
      acquisition_letter=excluded.acquisition_letter,
      last_enriched_at=excluded.last_enriched_at
  `);

  stmt.run(
    lead.id,
    lead.name,
    lead.domain.toLowerCase(),
    lead.website,
    lead.description,
    lead.industry,
    lead.location,
    lead.country,
    lead.foundedYear,
    lead.employeeCount,
    lead.estimatedRevenue,
    lead.estimatedEbitda,
    lead.ownershipType,
    lead.successionRisk,
    lead.etaScore,
    JSON.stringify(lead.etaScoreBreakdown),
    JSON.stringify(lead.contacts),
    JSON.stringify(lead.technologies),
    lead.dealThesis,
    lead.acquisitionLetter,
    lead.status,
    lead.scrapedAt,
    lead.lastEnrichedAt
  );

  return lead;
}

export function updateLeadStatus(id: string, status: LeadStatus): boolean {
  const stmt = db.prepare(`UPDATE leads SET status = ? WHERE id = ?`);
  const result = stmt.run(status, id);
  return result.changes > 0;
}

export function deleteLead(id: string): boolean {
  const stmt = db.prepare(`DELETE FROM leads WHERE id = ?`);
  const result = stmt.run(id);
  return result.changes > 0;
}

export function getStats() {
  const totalLeadsStmt = db.prepare(`SELECT COUNT(*) as count FROM leads`);
  const highEtaStmt = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE eta_score >= 80`);
  const founderOwnedStmt = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE ownership_type = 'founder_owned' OR ownership_type = 'family_owned'`);
  const contactedStmt = db.prepare(`SELECT COUNT(*) as count FROM leads WHERE status = 'contacted'`);

  const total = (totalLeadsStmt.get() as any).count;
  const highEta = (highEtaStmt.get() as any).count;
  const founderOwned = (founderOwnedStmt.get() as any).count;
  const contacted = (contactedStmt.get() as any).count;

  return {
    totalLeads: total,
    highScoreTargets: highEta,
    founderOwnedDeals: founderOwned,
    contactedCount: contacted,
    avgEtaScore: 78.4
  };
}

export function getCachedScrape(domain: string): ScrapedRawData | null {
  const now = new Date().toISOString();
  const stmt = db.prepare(`SELECT raw_data FROM scrape_cache WHERE domain = ? AND expires_at > ?`);
  const row: any = stmt.get(domain.toLowerCase(), now);
  if (!row) return null;
  try {
    return JSON.parse(row.raw_data);
  } catch {
    return null;
  }
}

export function setCachedScrape(domain: string, rawData: ScrapedRawData, ttlHours = 48) {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000).toISOString();
  const stmt = db.prepare(`
    INSERT INTO scrape_cache (domain, raw_data, created_at, expires_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(domain) DO UPDATE SET
      raw_data=excluded.raw_data,
      created_at=excluded.created_at,
      expires_at=excluded.expires_at
  `);
  stmt.run(domain.toLowerCase(), JSON.stringify(rawData), createdAt, expiresAt);
}

