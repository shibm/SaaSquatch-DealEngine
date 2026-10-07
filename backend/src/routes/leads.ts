import { Router } from 'express';
import { z } from 'zod';
import { 
  getLeads, 
  getLeadById, 
  getLeadByDomain, 
  upsertLead, 
  updateLeadStatus, 
  deleteLead, 
  getStats 
} from '../db/database.js';
import { scraperService } from '../services/scraper.js';
import { aiScreenerService } from '../services/aiScreener.js';
import { exportLeadsToCsv } from '../services/exportService.js';
import type { FilterParams, LeadStatus, SuccessionRisk, OwnershipType } from '../types/index.js';

export const leadsRouter = Router();

// GET /api/leads - List leads with filters
leadsRouter.get('/', (req, res) => {
  try {
    const filters: FilterParams = {
      query: req.query.query as string | undefined,
      industry: req.query.industry as string | undefined,
      location: req.query.location as string | undefined,
      minEtaScore: req.query.minEtaScore ? parseInt(req.query.minEtaScore as string, 10) : undefined,
      successionRisk: req.query.successionRisk as SuccessionRisk | undefined,
      ownershipType: req.query.ownershipType as OwnershipType | undefined,
      status: req.query.status as LeadStatus | undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
    };

    const result = getLeads(filters);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch leads' });
  }
});

// GET /api/leads/stats - Summary counts and metrics
leadsRouter.get('/stats', (_req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch statistics' });
  }
});

// POST /api/leads/export - Export leads to CSV
leadsRouter.post('/export', (req, res) => {
  try {
    const { leadIds, filters } = req.body || {};
    let leadsToExport: any[] = [];

    if (Array.isArray(leadIds) && leadIds.length > 0) {
      leadsToExport = leadIds
        .map(id => getLeadById(id))
        .filter(l => l !== null);
    } else {
      const result = getLeads({ ...(filters || {}), limit: 1000, page: 1 });
      leadsToExport = result.leads;
    }

    const csvData = exportLeadsToCsv(leadsToExport);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="saasquatch-leads-export.csv"');
    res.send(csvData);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to export CSV' });
  }
});

// GET /api/leads/:id - Get lead by ID
leadsRouter.get('/:id', (req, res) => {
  try {
    const lead = getLeadById(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch lead' });
  }
});

const ScrapeSchema = z.object({
  url: z.string().min(3),
  forceFresh: z.boolean().optional()
});

// POST /api/leads/scrape - Live domain scraping and AI ETA scoring
leadsRouter.post('/scrape', async (req, res) => {
  try {
    const parse = ScrapeSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid URL or domain is required', details: parse.error.issues });
    }

    const { url, forceFresh } = parse.data;

    // 1. Scrape raw data
    const rawData = await scraperService.scrapeWebsite(url, forceFresh);

    // 2. Run AI Screener & Enrichment
    const enrichedLead = aiScreenerService.screenAndEnrichLead(rawData);

    // 3. Persist to DB
    const saved = upsertLead(enrichedLead);

    res.status(201).json({
      message: 'Lead scraped and scored successfully',
      lead: saved
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to scrape domain' });
  }
});

// POST /api/leads/bulk-scrape - Scrape multiple domains
leadsRouter.post('/bulk-scrape', async (req, res) => {
  try {
    const domains = req.body.domains;
    if (!Array.isArray(domains) || domains.length === 0) {
      return res.status(400).json({ error: 'domains array is required' });
    }

    const limited = domains.slice(0, 10); // rate limiting safety
    const results = await Promise.allSettled(
      limited.map(async (domain) => {
        const raw = await scraperService.scrapeWebsite(domain);
        const lead = aiScreenerService.screenAndEnrichLead(raw);
        return upsertLead(lead);
      })
    );

    const saved = results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);

    res.json({
      processedCount: saved.length,
      leads: saved
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Bulk scrape failed' });
  }
});

// PATCH /api/leads/:id/status - Update lead pipeline status
leadsRouter.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'reviewed', 'contacted', 'passed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const success = updateLeadStatus(req.params.id, status);
    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update status' });
  }
});

// DELETE /api/leads/:id - Delete lead
leadsRouter.delete('/:id', (req, res) => {
  try {
    const success = deleteLead(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete lead' });
  }
});

// POST /api/leads/:id/generate-outreach - Customize M&A acquisition letter
leadsRouter.post('/:id/generate-outreach', (req, res) => {
  try {
    const lead = getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const { senderName = 'Acquisition Team', firmName = 'Caprae Capital Partners' } = req.body;
    const dm = lead.contacts.find(c => c.isDecisionMaker) || lead.contacts[0] || { name: 'Owner / Principal' };

    const customizedLetter = `Subject: Confidential Inquiry regarding ${lead.name} - Long-Term Partnership & Acquisition

Dear ${dm.name},

My name is ${senderName} with ${firmName}. We are an active acquisitions platform and search fund investor dedicated to partnering with premier companies in the ${lead.industry} space.

We have spent significant time researching ${lead.name} in ${lead.location}. What particularly stands out to us is the operational resilience and customer trust you have built${lead.foundedYear ? ` since ${lead.foundedYear}` : ''}. 

Unlike traditional institutional private equity firms that operate on rapid cost-cutting horizons, our model represents a 7-year value creation journey. We look to acquire a single legacy business, partner closely with existing management, and deploy non-disruptive AI automation and modern technology to scale what you have created.

If you have considered succession planning, liquidity, or the next stage of growth for ${lead.name}, I would be delighted to schedule a brief, confidential 15-minute introductory call.

Warm regards,

${senderName}
${firmName}
deal-sourcing@capraecapitalpartners.com`;

    res.json({ acquisitionLetter: customizedLetter });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to customize outreach' });
  }
});
