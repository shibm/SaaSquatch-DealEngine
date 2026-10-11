import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { aiScreenerService } from '../services/aiScreener.js';
import type { ScrapedRawData } from '../types/index.js';

describe('AI & Heuristic ETA Screener Verification', () => {

  test('Correctly screens and evaluates a family-owned legacy precision manufacturer', () => {
    const raw: ScrapedRawData = {
      url: 'https://vanguardcnc.com',
      domain: 'vanguardcnc.com',
      title: 'Vanguard Precision Machining | AS9100 Certified',
      description: 'Family-owned precision CNC aerospace manufacturer operating since 1994.',
      headings: ['Precision Tooling', 'Quality Assurance', 'Contact Our Team'],
      emails: ['info@vanguardcnc.com', 'sales@vanguardcnc.com'],
      phones: ['(312) 555-0199'],
      socials: {
        linkedin: 'https://www.linkedin.com/company/vanguardcnc'
      },
      technologies: ['SolidWorks', 'WordPress'],
      copyrightYear: 1994,
      extractedText: 'We are a family-owned custom machining facility serving aerospace defense accounts with annual contracts.'
    };

    const lead = aiScreenerService.screenAndEnrichLead(raw);

    assert.equal(lead.name, 'Vanguard Precision Machining');
    assert.equal(lead.industry, 'Precision Manufacturing');
    assert.equal(lead.ownershipType, 'family_owned');
    assert.equal(lead.successionRisk, 'high', 'Long operating history and family ownership must trigger high succession readiness');
    assert.ok(lead.etaScore >= 80, 'Legacy profitable manufacturer should have high ETA Score');
    assert.ok(lead.dealThesis.includes('AS9100') || lead.dealThesis.includes('Precision Manufacturing'));
    assert.ok(lead.acquisitionLetter.includes('Caprae Capital Partners'));
    assert.ok(lead.contacts.length >= 1);
    assert.equal(lead.contacts[0].isDecisionMaker, true);
  });

  test('Correctly screens and classifies a Managed IT / Cybersecurity MSP provider', () => {
    const raw: ScrapedRawData = {
      url: 'https://sentinelguardmsp.com',
      domain: 'sentinelguardmsp.com',
      title: 'Sentinel Guard Managed IT & Cybersecurity Support',
      description: '24/7 Managed IT, cloud migration, and endpoint cybersecurity retainers.',
      headings: ['Managed IT Services', 'SOC as a Service'],
      emails: ['support@sentinelguardmsp.com'],
      phones: [],
      socials: {},
      technologies: ['ConnectWise', 'Next.js'],
      extractedText: 'Founded in 2012, Sentinel Guard provides monthly subscription MSP and compliance retainers.'
    };

    const lead = aiScreenerService.screenAndEnrichLead(raw);

    assert.equal(lead.industry, 'Managed IT & Cybersecurity');
    assert.ok(lead.etaScoreBreakdown.recurringRevenueSignal >= 20, 'Retainer/subscription MSP must score high recurring revenue');
    assert.ok(lead.estimatedRevenue.startsWith('$'));
    assert.ok(lead.estimatedEbitda.startsWith('$'));
  });

  test('Generates personalized founder outreach with Caprae 7-year growth thesis', () => {
    const raw: ScrapedRawData = {
      url: 'https://clearwatertreatment.com',
      domain: 'clearwatertreatment.com',
      title: 'Clearwater Water Filtration Systems',
      description: 'Commercial facilities water filtration systems operating since 1999.',
      headings: ['Services', 'About'],
      emails: ['founder@clearwatertreatment.com'],
      phones: ['404-555-8822'],
      socials: {},
      technologies: ['WordPress'],
      copyrightYear: 1999,
      extractedText: 'Commercial water solutions.'
    };

    const lead = aiScreenerService.screenAndEnrichLead(raw);
    assert.ok(lead.acquisitionLetter.includes('Carrying Forward Your Legacy'));
    assert.ok(lead.acquisitionLetter.includes('7-year growth partnership'));
    assert.ok(lead.acquisitionLetter.includes('capraecapitalpartners.com'));
  });
});
