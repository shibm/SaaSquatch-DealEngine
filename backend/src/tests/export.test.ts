import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { exportLeadsToCsv } from '../services/exportService.js';
import type { Lead } from '../types/index.js';

describe('CSV Export Service Verification', () => {
  const sampleLeads: Lead[] = [
    {
      id: 'lead-csv-1',
      name: 'Alpha Robotics Inc',
      domain: 'alpharobotics.com',
      website: 'https://alpharobotics.com',
      description: 'Factory automation and robotics integration.',
      industry: 'Precision Manufacturing',
      location: 'Detroit, MI',
      country: 'United States',
      foundedYear: 2004,
      employeeCount: 38,
      estimatedRevenue: '$7.5M',
      estimatedEbitda: '$1.5M',
      ownershipType: 'founder_owned',
      successionRisk: 'high',
      etaScore: 89,
      etaScoreBreakdown: {
        recurringRevenueSignal: 20,
        marketStability: 23,
        ownerSuccessionSignal: 24,
        marginProfile: 22
      },
      contacts: [
        {
          name: 'James Reynolds',
          title: 'Founder & CEO',
          email: 'jreynolds@alpharobotics.com',
          phone: '(313) 555-4321',
          linkedin: 'https://linkedin.com/in/james-reynolds',
          isDecisionMaker: true
        }
      ],
      technologies: ['React', 'Stripe'],
      dealThesis: 'Prime acquisition target with strong margins.',
      acquisitionLetter: 'Outreach text...',
      status: 'new',
      scrapedAt: new Date().toISOString(),
      lastEnrichedAt: new Date().toISOString()
    }
  ];

  test('Exports leads to well-formatted CSV with headers', () => {
    const csv = exportLeadsToCsv(sampleLeads);

    assert.ok(csv.includes('Company Name'), 'CSV must include Company Name header');
    assert.ok(csv.includes('Domain'), 'CSV must include Domain header');
    assert.ok(csv.includes('ETA Score (0-100)'), 'CSV must include ETA Score header');
    assert.ok(csv.includes('Alpha Robotics Inc'), 'CSV must include lead company name');
    assert.ok(csv.includes('alpharobotics.com'), 'CSV must include domain');
    assert.ok(csv.includes('James Reynolds'), 'CSV must include decision maker');
    assert.ok(csv.includes('jreynolds@alpharobotics.com'), 'CSV must include decision maker email');
  });
});
