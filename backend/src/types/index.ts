export type OwnershipType = 
  | 'founder_owned' 
  | 'family_owned' 
  | 'private_equity' 
  | 'venture_backed' 
  | 'public' 
  | 'unknown';

export type SuccessionRisk = 'high' | 'medium' | 'low';

export type LeadStatus = 'new' | 'reviewed' | 'contacted' | 'passed';

export interface Contact {
  name: string;
  title: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  isDecisionMaker: boolean;
}

export interface ETAScoreBreakdown {
  recurringRevenueSignal: number; // 0-25
  marketStability: number;        // 0-25
  ownerSuccessionSignal: number;  // 0-25
  marginProfile: number;          // 0-25
}

export interface Lead {
  id: string;
  name: string;
  domain: string;
  website: string;
  description: string;
  industry: string;
  location: string;
  country: string;
  foundedYear: number | null;
  employeeCount: number | null;
  estimatedRevenue: string;
  estimatedEbitda: string;
  ownershipType: OwnershipType;
  successionRisk: SuccessionRisk;
  etaScore: number; // 0 - 100
  etaScoreBreakdown: ETAScoreBreakdown;
  contacts: Contact[];
  technologies: string[];
  dealThesis: string;
  acquisitionLetter: string;
  status: LeadStatus;
  scrapedAt: string;
  lastEnrichedAt: string;
}

export interface ScrapedRawData {
  url: string;
  domain: string;
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  headings: string[];
  emails: string[];
  phones: string[];
  socials: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  technologies: string[];
  copyrightYear?: number;
  extractedText: string;
}

export interface FilterParams {
  query?: string;
  industry?: string;
  location?: string;
  minEtaScore?: number;
  successionRisk?: SuccessionRisk;
  ownershipType?: OwnershipType;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}
