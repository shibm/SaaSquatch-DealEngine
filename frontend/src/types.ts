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
  recurringRevenueSignal: number;
  marketStability: number;
  ownerSuccessionSignal: number;
  marginProfile: number;
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
  etaScore: number;
  etaScoreBreakdown: ETAScoreBreakdown;
  contacts: Contact[];
  technologies: string[];
  dealThesis: string;
  acquisitionLetter: string;
  status: LeadStatus;
  scrapedAt: string;
  lastEnrichedAt: string;
}

export interface Stats {
  totalLeads: number;
  highScoreTargets: number;
  founderOwnedDeals: number;
  contactedCount: number;
  avgEtaScore: number;
}

