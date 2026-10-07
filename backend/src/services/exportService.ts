import { createObjectCsvStringifier } from 'csv-writer';
import type { Lead } from '../types/index.js';

export function exportLeadsToCsv(leads: Lead[]): string {
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'name', title: 'Company Name' },
      { id: 'domain', title: 'Domain' },
      { id: 'website', title: 'Website' },
      { id: 'industry', title: 'Industry' },
      { id: 'location', title: 'Location' },
      { id: 'foundedYear', title: 'Founded Year' },
      { id: 'employeeCount', title: 'Employees' },
      { id: 'estimatedRevenue', title: 'Est. Revenue' },
      { id: 'estimatedEbitda', title: 'Est. EBITDA' },
      { id: 'ownershipType', title: 'Ownership' },
      { id: 'successionRisk', title: 'Succession Risk' },
      { id: 'etaScore', title: 'ETA Score (0-100)' },
      { id: 'decisionMakerName', title: 'Primary Contact' },
      { id: 'decisionMakerEmail', title: 'Email' },
      { id: 'decisionMakerPhone', title: 'Phone' },
      { id: 'decisionMakerLinkedIn', title: 'LinkedIn' },
      { id: 'technologies', title: 'Tech Stack' },
      { id: 'status', title: 'Status' },
      { id: 'dealThesis', title: 'Acquisition Thesis' }
    ]
  });

  const records = leads.map(l => {
    const dm = l.contacts.find(c => c.isDecisionMaker) || l.contacts[0] || {};
    return {
      name: l.name,
      domain: l.domain,
      website: l.website,
      industry: l.industry,
      location: l.location,
      foundedYear: l.foundedYear || 'N/A',
      employeeCount: l.employeeCount || 'N/A',
      estimatedRevenue: l.estimatedRevenue,
      estimatedEbitda: l.estimatedEbitda,
      ownershipType: l.ownershipType,
      successionRisk: l.successionRisk,
      etaScore: l.etaScore,
      decisionMakerName: dm.name || 'N/A',
      decisionMakerEmail: dm.email || 'N/A',
      decisionMakerPhone: dm.phone || 'N/A',
      decisionMakerLinkedIn: dm.linkedin || 'N/A',
      technologies: l.technologies.join(', '),
      status: l.status,
      dealThesis: l.dealThesis
    };
  });

  const header = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(records);
  return header + body;
}

