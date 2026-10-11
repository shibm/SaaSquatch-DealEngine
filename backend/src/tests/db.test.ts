import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { 
  initDb, 
  upsertLead, 
  getLeadById, 
  getLeadByDomain, 
  updateLeadStatus, 
  getLeads, 
  getStats,
  setCachedScrape,
  getCachedScrape
} from '../db/database.js';
import type { Lead, ScrapedRawData } from '../types/index.js';

describe('Database Layer Verification', () => {
  before(() => {
    initDb();
  });

  const mockLead: Lead = {
    id: 'test-lead-123',
    name: 'Acme Test Dynamics',
    domain: 'acmetestdynamics.com',
    website: 'https://acmetestdynamics.com',
    description: 'Precision engineering and robotics components.',
    industry: 'Precision Manufacturing',
    location: 'Denver, CO',
    country: 'United States',
    foundedYear: 1998,
    employeeCount: 45,
    estimatedRevenue: '$9.0M',
    estimatedEbitda: '$2.0M',
    ownershipType: 'family_owned',
    successionRisk: 'high',
    etaScore: 92,
    etaScoreBreakdown: {
      recurringRevenueSignal: 22,
      marketStability: 24,
      ownerSuccessionSignal: 24,
      marginProfile: 22
    },
    contacts: [
      {
        name: 'Arthur Pendelton',
        title: 'Founder & CEO',
        email: 'apendelton@acmetestdynamics.com',
        phone: '(303) 555-1234',
        isDecisionMaker: true
      }
    ],
    technologies: ['SolidWorks', 'WordPress'],
    dealThesis: 'Strong lower-middle-market defensibility with 26 years of operation.',
    acquisitionLetter: 'Subject: Confidential Inquiry regarding Acme Test Dynamics',
    status: 'new',
    scrapedAt: new Date().toISOString(),
    lastEnrichedAt: new Date().toISOString()
  };

  test('upsertLead stores and retrieves lead by ID and domain', () => {
    upsertLead(mockLead);

    const byId = getLeadById('test-lead-123');
    assert.ok(byId, 'Lead should be found by ID');
    assert.equal(byId?.name, 'Acme Test Dynamics');
    assert.equal(byId?.etaScore, 92);
    assert.equal(byId?.contacts.length, 1);
    assert.equal(byId?.contacts[0].isDecisionMaker, true);

    const byDomain = getLeadByDomain('acmetestdynamics.com');
    assert.ok(byDomain, 'Lead should be found by domain');
    assert.equal(byDomain?.id, 'test-lead-123');
  });

  test('updateLeadStatus updates lead by ID or by domain', () => {
    const updatedById = updateLeadStatus('test-lead-123', 'contacted');
    assert.equal(updatedById, true, 'Should update status by ID');

    let lead = getLeadById('test-lead-123');
    assert.equal(lead?.status, 'contacted');

    const updatedByDomain = updateLeadStatus('acmetestdynamics.com', 'reviewed');
    assert.equal(updatedByDomain, true, 'Should update status by domain');

    lead = getLeadById('test-lead-123');
    assert.equal(lead?.status, 'reviewed');
  });

  test('getLeads filters properly by criteria', () => {
    const results = getLeads({ query: 'Acme', industry: 'Precision Manufacturing' });
    assert.ok(results.leads.length >= 1, 'Should find at least one matching lead');
    assert.equal(results.leads[0].domain, 'acmetestdynamics.com');

    const highEta = getLeads({ minEtaScore: 90 });
    assert.ok(highEta.leads.every(l => l.etaScore >= 90), 'All results must have score >= 90');
  });

  test('getStats returns aggregate numbers', () => {
    const stats = getStats();
    assert.ok(stats.totalLeads > 0, 'Total leads should be greater than 0');
    assert.ok(typeof stats.avgEtaScore === 'number');
  });

  test('Scrape cache stores and retrieves raw data with expiration check', () => {
    const raw: ScrapedRawData = {
      url: 'https://cachetest.com',
      domain: 'cachetest.com',
      title: 'Cache Test Inc',
      description: 'Testing caching layer',
      headings: ['Home'],
      emails: ['hello@cachetest.com'],
      phones: ['123-456-7890'],
      socials: {},
      technologies: ['React'],
      extractedText: 'Sample text'
    };

    setCachedScrape('cachetest.com', raw, 2);
    const cached = getCachedScrape('cachetest.com');
    assert.ok(cached, 'Cached data must exist');
    assert.equal(cached?.title, 'Cache Test Inc');
    assert.equal(cached?.emails[0], 'hello@cachetest.com');
  });
});
