import { initDb, upsertLead } from './database.js';
import type { Lead } from '../types/index.js';

initDb();

const sampleLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Vanguard Precision Manufacturing',
    domain: 'vanguardprecision.com',
    website: 'https://vanguardprecision.com',
    description: 'AS9100 certified precision CNC machining and custom tooling manufacturer for defense and aerospace components.',
    industry: 'Precision Manufacturing',
    location: 'Chicago, IL',
    country: 'United States',
    foundedYear: 1992,
    employeeCount: 42,
    estimatedRevenue: '$8.2M',
    estimatedEbitda: '$1.8M',
    ownershipType: 'family_owned',
    successionRisk: 'high',
    etaScore: 94,
    etaScoreBreakdown: {
      recurringRevenueSignal: 22,
      marketStability: 25,
      ownerSuccessionSignal: 25,
      marginProfile: 22
    },
    contacts: [
      {
        name: 'Robert Miller',
        title: 'Founder & CEO',
        email: 'rmiller@vanguardprecision.com',
        phone: '(312) 555-0182',
        linkedin: 'https://www.linkedin.com/in/robert-miller-mfg',
        isDecisionMaker: true
      },
      {
        name: 'Sarah Jenkins',
        title: 'VP Operations',
        email: 'sjenkins@vanguardprecision.com',
        phone: '(312) 555-0183',
        isDecisionMaker: false
      }
    ],
    technologies: ['Mastercam', 'SolidWorks', 'WordPress', 'Google Analytics'],
    dealThesis: 'Vanguard Precision is an exemplary lower-middle-market target with 30+ years of operating history. AS9100 certifications create high switching moats. Founder is nearing retirement with no internal succession plan. Ideal for Caprae 7-year operational modernization through AI supply chain routing and predictive machine maintenance.',
    acquisitionLetter: `Subject: Confidential Inquiry regarding Vanguard Precision - Carrying Forward Your Legacy\n\nDear Robert Miller,\n\nI hope this message finds you well. I am reaching out as an acquisition entrepreneur backed by Caprae Capital Partners, focused on lower-middle-market leaders in Precision Manufacturing.\n\nWe have been following Vanguard Precision's work in Chicago and hold immense respect for the precision engineering reputation you have built over the past 32+ years. Unlike traditional financial private equity firms that look to flip businesses, our model is grounded in a 7-year growth partnership. We seek to acquire a single exceptional business, step in operationally, and inject practical AI modernizations while honoring your legacy.\n\nIf you have ever contemplated what succession or the next chapter might look like, I would welcome a brief, confidential 15-minute introductory conversation.\n\nWarm regards,\nDeal Sourcing Team\nCaprae Capital Partners`,
    status: 'new',
    scrapedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastEnrichedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'lead-2',
    name: 'Apex Shield Cybersecurity & MSP',
    domain: 'apexshieldmsp.com',
    website: 'https://apexshieldmsp.com',
    description: 'Premier Managed IT and SOC-as-a-service provider delivering compliance and 24/7 endpoint protection for regional banks.',
    industry: 'Managed IT & Cybersecurity',
    location: 'Dallas, TX',
    country: 'United States',
    foundedYear: 2011,
    employeeCount: 34,
    estimatedRevenue: '$6.4M',
    estimatedEbitda: '$1.6M',
    ownershipType: 'founder_owned',
    successionRisk: 'medium',
    etaScore: 91,
    etaScoreBreakdown: {
      recurringRevenueSignal: 25,
      marketStability: 22,
      ownerSuccessionSignal: 20,
      marginProfile: 24
    },
    contacts: [
      {
        name: 'David Vance',
        title: 'Managing Principal & Founder',
        email: 'dvance@apexshieldmsp.com',
        phone: '(214) 555-0912',
        linkedin: 'https://www.linkedin.com/in/david-vance-it',
        isDecisionMaker: true
      }
    ],
    technologies: ['ConnectWise', 'SentinelOne', 'Next.js', 'HubSpot', 'Stripe'],
    dealThesis: 'Apex Shield generates 88% recurring MRR with multi-year government and regional banking contracts. Low churn (<4% annually). Clean financial profile with room to bolt-on regional MSP acquisitions under Caprae roll-up strategy.',
    acquisitionLetter: `Subject: Confidential Inquiry regarding Apex Shield Cybersecurity\n\nDear David Vance,\n\nI am reaching out on behalf of Caprae Capital Partners. We specialize in partnering with mission-critical Managed IT and Security providers.\n\nYour track record in Dallas is exceptional, particularly your recurring retainer structure with financial institutions. We operate on an operator-first 7-year journey, helping resilient IT services businesses scale with institutional backing and AI-assisted triage.\n\nWould you be open to an introductory discussion this month?\n\nBest regards,\nCaprae Capital Partners`,
    status: 'reviewed',
    scrapedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    lastEnrichedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'lead-3',
    name: 'Sterling Environmental & HVAC Systems',
    domain: 'sterlinghvacservices.com',
    website: 'https://sterlinghvacservices.com',
    description: 'Commercial HVAC, building automation, and mission-critical refrigeration systems for cold storage and hospitals.',
    industry: 'Commercial Facilities Services',
    location: 'Atlanta, GA',
    country: 'United States',
    foundedYear: 1996,
    employeeCount: 58,
    estimatedRevenue: '$11.5M',
    estimatedEbitda: '$2.4M',
    ownershipType: 'family_owned',
    successionRisk: 'high',
    etaScore: 89,
    etaScoreBreakdown: {
      recurringRevenueSignal: 21,
      marketStability: 25,
      ownerSuccessionSignal: 24,
      marginProfile: 19
    },
    contacts: [
      {
        name: 'Thomas Sterling',
        title: 'Owner & President',
        email: 'tsterling@sterlinghvacservices.com',
        phone: '(404) 555-3310',
        linkedin: 'https://www.linkedin.com/company/sterlinghvac',
        isDecisionMaker: true
      }
    ],
    technologies: ['ServiceTitan', 'WordPress', 'Google Analytics'],
    dealThesis: 'Sterling HVAC possesses long-term preventive maintenance service agreements covering 60% of total revenue. High barriers to entry due to EPA master licenses and hospital infrastructure relationships. Strong candidate for ETA owner buyout.',
    acquisitionLetter: `Subject: Inquiring on Sterling Environmental - Succession & Growth\n\nDear Thomas Sterling,\n\nI hope your week is off to a great start. I am reaching out from Caprae Capital Partners regarding Sterling Environmental.\n\nYour 28-year history in Atlanta commercial facilities is truly admirable. We partner with established family businesses where the founder is considering retirement or liquidity options, ensuring the business continues to thrive for decades to come.\n\nI'd welcome an informal 10-minute introductory call at your convenience.\n\nWarmly,\nCaprae Capital Acquisitions`,
    status: 'new',
    scrapedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    lastEnrichedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'lead-4',
    name: 'CertiReg Compliance Cloud',
    domain: 'certireg.io',
    website: 'https://certireg.io',
    description: 'Specialized regulatory compliance automation and document tracking software for FDA-regulated medical device manufacturers.',
    industry: 'B2B Software & SaaS',
    location: 'Boston, MA',
    country: 'United States',
    foundedYear: 2016,
    employeeCount: 22,
    estimatedRevenue: '$4.2M',
    estimatedEbitda: '$1.3M',
    ownershipType: 'founder_owned',
    successionRisk: 'low',
    etaScore: 86,
    etaScoreBreakdown: {
      recurringRevenueSignal: 25,
      marketStability: 18,
      ownerSuccessionSignal: 18,
      marginProfile: 25
    },
    contacts: [
      {
        name: 'Elena Rostova',
        title: 'Co-Founder & CEO',
        email: 'elena@certireg.io',
        linkedin: 'https://www.linkedin.com/in/elena-rostova-tech',
        isDecisionMaker: true
      }
    ],
    technologies: ['React', 'AWS', 'PostgreSQL', 'Stripe', 'Segment'],
    dealThesis: 'High net retention (115% NRR) in an inelastic compliance niche. Perfect SaaS acquisition target ready for expanded direct enterprise outbound sales powered by SaaSquatch Leads enrichment.',
    acquisitionLetter: `Subject: Strategic Partnership & Acquisition Inquiry - CertiReg\n\nDear Elena Rostova,\n\nI am reaching out from Caprae Capital Partners. We closely track vertical compliance software platforms and have been impressed by CertiReg\'s traction in medical regulatory automation.\n\nWe provide both growth capital and full operational transition backing for technical founders looking to take money off the table while accelerating scale.\n\nLet\'s find 15 minutes to connect this week.\n\nRegards,\nCaprae Capital Partners`,
    status: 'contacted',
    scrapedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    lastEnrichedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'lead-5',
    name: 'Kodiak Cold Logistics',
    domain: 'kodiakcoldchain.com',
    website: 'https://kodiakcoldchain.com',
    description: 'Temperature-controlled pharmaceutical freight, bio-specimen transportation, and refrigerated warehousing.',
    industry: 'Logistics & Supply Chain',
    location: 'Denver, CO',
    country: 'United States',
    foundedYear: 2005,
    employeeCount: 62,
    estimatedRevenue: '$14.1M',
    estimatedEbitda: '$2.6M',
    ownershipType: 'founder_owned',
    successionRisk: 'high',
    etaScore: 88,
    etaScoreBreakdown: {
      recurringRevenueSignal: 22,
      marketStability: 23,
      ownerSuccessionSignal: 23,
      marginProfile: 20
    },
    contacts: [
      {
        name: 'Marcus Brody',
        title: 'CEO & Founder',
        email: 'mbrody@kodiakcoldchain.com',
        phone: '(303) 555-7781',
        linkedin: 'https://www.linkedin.com/in/marcus-brody-logistics',
        isDecisionMaker: true
      }
    ],
    technologies: ['McLeod Software', 'Teletrac Navman', 'WordPress'],
    dealThesis: 'Kodiak serves specialized pharmaceutical accounts with strict FDA 21 CFR Part 11 requirements. Hard asset moat with strong cash-on-cash return profile and recurring freight volume commitments.',
    acquisitionLetter: `Subject: Kodiak Cold Logistics - Exploring Future Ownership Horizons\n\nDear Marcus Brody,\n\nI hope you are having a productive week. I am contacting you from Caprae Capital Partners.\n\nWe have long admired Kodiak\'s focus on regulated bio-pharma logistics. As long-term investors dedicated to the ETA and acquisition community, we partner with founders ready to plan their exit while keeping company culture intact.\n\nWould you be open to a quick, confidential chat?\n\nSincerely,\nCaprae Capital Acquisitions`,
    status: 'new',
    scrapedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    lastEnrichedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export function runSeed() {
  console.log('Seeding initial ETA deal targets into database...');
  for (const lead of sampleLeads) {
    upsertLead(lead);
    console.log(`✓ Seeded ${lead.name} (${lead.domain})`);
  }
  console.log('Seed completed successfully!');
}

runSeed();
