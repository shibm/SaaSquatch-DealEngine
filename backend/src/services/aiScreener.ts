import { randomUUID } from 'crypto';
import type { Lead, ScrapedRawData, OwnershipType, SuccessionRisk, ETAScoreBreakdown, Contact } from '../types/index.js';

export class AIScreenerService {

  public screenAndEnrichLead(rawData: ScrapedRawData): Lead {
    const textLower = (rawData.title + ' ' + rawData.description + ' ' + rawData.extractedText).toLowerCase();

    // 1. Identify Clean Company Name
    const name = this.extractCompanyName(rawData);

    // 2. Classify Industry
    const industry = this.classifyIndustry(textLower);

    // 3. Estimate Location
    const { location, country } = this.extractLocation(textLower, rawData);

    // 4. Estimate Year Founded & Age
    const currentYear = new Date().getFullYear();
    const foundedYear = rawData.copyrightYear || this.detectFoundedYear(textLower) || (currentYear - 14);
    const companyAge = currentYear - foundedYear;

    // 5. Estimate Employee Count & Financials (Lower-Middle Market Sweet Spot)
    const employeeCount = this.estimateEmployeeCount(textLower, companyAge);
    const { estimatedRevenue, estimatedEbitda } = this.estimateFinancials(employeeCount, industry);

    // 6. Ownership & Succession Risk
    const ownershipType = this.detectOwnershipType(textLower);
    const successionRisk = this.calculateSuccessionRisk(companyAge, ownershipType, textLower);

    // 7. Calculate ETA Score (0 - 100)
    const etaScoreBreakdown = this.calculateETABreakdown(industry, companyAge, ownershipType, textLower);
    const etaScore = etaScoreBreakdown.recurringRevenueSignal + 
                     etaScoreBreakdown.marketStability + 
                     etaScoreBreakdown.ownerSuccessionSignal + 
                     etaScoreBreakdown.marginProfile;

    // 8. Discover Key Contacts / Decision Makers
    const contacts = this.extractContacts(rawData, textLower);

    // 9. Generate Deal Thesis for Caprae / Search Funds
    const dealThesis = this.generateDealThesis(name, industry, companyAge, ownershipType, estimatedRevenue, estimatedEbitda);

    // 10. Generate Personalized Founder M&A Acquisition Letter
    const primaryContact = contacts.find(c => c.isDecisionMaker)?.name || 'Founder / Business Owner';
    const acquisitionLetter = this.generateAcquisitionLetter(name, primaryContact, industry, companyAge, location);

    const now = new Date().toISOString();

    return {
      id: randomUUID(),
      name,
      domain: rawData.domain,
      website: rawData.url,
      description: rawData.description || `Specialized ${industry} provider based in ${location}.`,
      industry,
      location,
      country,
      foundedYear,
      employeeCount,
      estimatedRevenue,
      estimatedEbitda,
      ownershipType,
      successionRisk,
      etaScore,
      etaScoreBreakdown,
      contacts,
      technologies: rawData.technologies,
      dealThesis,
      acquisitionLetter,
      status: 'new',
      scrapedAt: now,
      lastEnrichedAt: now
    };
  }

  private extractCompanyName(raw: ScrapedRawData): string {
    if (raw.ogTitle && raw.ogTitle.length < 50 && !raw.ogTitle.includes('http')) {
      const parts = raw.ogTitle.split(/[-–|:•]/);
      if (parts[0].trim().length > 2) return parts[0].trim();
    }
    if (raw.title && raw.title.length < 50) {
      const parts = raw.title.split(/[-–|:•]/);
      if (parts[0].trim().length > 2) return parts[0].trim();
    }
    const clean = raw.domain.split('.')[0];
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  private classifyIndustry(text: string): string {
    if (text.includes('saas') || text.includes('software') || text.includes('cloud platform') || text.includes('api')) {
      return 'B2B Software & SaaS';
    }
    if (text.includes('managed it') || text.includes('cybersecurity') || text.includes('msp') || text.includes('it support')) {
      return 'Managed IT & Cybersecurity';
    }
    if (text.includes('machin') || text.includes('manufactur') || text.includes('fabricat') || text.includes('cnc') || text.includes('industrial')) {
      return 'Precision Manufacturing';
    }
    if (text.includes('logistics') || text.includes('freight') || text.includes('trucking') || text.includes('warehouse') || text.includes('supply chain')) {
      return 'Logistics & Supply Chain';
    }
    if (text.includes('hvac') || text.includes('plumbing') || text.includes('roofing') || text.includes('facility') || text.includes('maintenance')) {
      return 'Commercial Facilities Services';
    }
    if (text.includes('health') || text.includes('medical') || text.includes('clinic') || text.includes('patient') || text.includes('care')) {
      return 'Healthcare & Clinical Services';
    }
    if (text.includes('consulting') || text.includes('accounting') || text.includes('staffing') || text.includes('compliance')) {
      return 'Professional Business Services';
    }
    return 'Specialized B2B Services';
  }

  private extractLocation(text: string, raw: ScrapedRawData): { location: string; country: string } {
    const usCities = [
      'Austin, TX', 'Chicago, IL', 'Atlanta, GA', 'Dallas, TX', 'Boston, MA',
      'Denver, CO', 'Phoenix, AZ', 'Charlotte, NC', 'Minneapolis, MN', 'Tampa, FL',
      'Columbus, OH', 'Indianapolis, IN', 'Nashville, TN', 'Salt Lake City, UT'
    ];

    for (const city of usCities) {
      const cityName = city.split(',')[0].toLowerCase();
      if (text.includes(cityName)) {
        return { location: city, country: 'United States' };
      }
    }

    // Default based on tld
    if (raw.domain.endsWith('.co.uk')) return { location: 'London, UK', country: 'United Kingdom' };
    if (raw.domain.endsWith('.ca')) return { location: 'Toronto, ON', country: 'Canada' };
    if (raw.domain.endsWith('.com.au')) return { location: 'Sydney, NSW', country: 'Australia' };

    // Default lower-middle-market US hub
    const defaultCity = usCities[Math.abs(raw.domain.length) % usCities.length];
    return { location: defaultCity, country: 'United States' };
  }

  private detectFoundedYear(text: string): number | null {
    const match = text.match(/(?:since|founded in|established in|operating since)\s*(19\d{2}|20\d{2})/i);
    if (match) {
      const yr = parseInt(match[1], 10);
      if (yr >= 1960 && yr <= 2024) return yr;
    }
    return null;
  }

  private estimateEmployeeCount(text: string, age: number): number {
    if (text.includes('fortune 500') || text.includes('1,000+ employees') || text.includes('thousands of employees')) {
      return 250;
    }
    // Search fund target typical range: 15 - 75 employees
    const base = Math.min(65, Math.max(12, Math.floor(age * 2.2)));
    return base;
  }

  private estimateFinancials(employees: number, industry: string): { estimatedRevenue: string; estimatedEbitda: string } {
    // Average B2B revenue per employee is ~$160k - $240k
    let revPerEmp = 185000;
    let margin = 0.22; // 22% average EBITDA margin for niche lower-middle market

    if (industry.includes('Software')) {
      revPerEmp = 220000;
      margin = 0.28;
    } else if (industry.includes('Manufacturing')) {
      revPerEmp = 240000;
      margin = 0.18;
    } else if (industry.includes('Managed IT')) {
      revPerEmp = 195000;
      margin = 0.24;
    }

    const totalRev = employees * revPerEmp;
    const totalEbitda = totalRev * margin;

    const revFormatted = `$${(totalRev / 1000000).toFixed(1)}M`;
    const ebitdaFormatted = `$${(totalEbitda / 1000000).toFixed(1)}M`;

    return { estimatedRevenue: revFormatted, estimatedEbitda: ebitdaFormatted };
  }

  private detectOwnershipType(text: string): OwnershipType {
    if (text.includes('family owned') || text.includes('family-owned') || text.includes('generation of')) {
      return 'family_owned';
    }
    if (text.includes('venture capital') || text.includes('series a') || text.includes('series b') || text.includes('backed by')) {
      return 'venture_backed';
    }
    if (text.includes('private equity') || text.includes('portfolio company') || text.includes('acquired by')) {
      return 'private_equity';
    }
    if (text.includes('nasdaq') || text.includes('nyse') || text.includes('publicly traded')) {
      return 'public';
    }
    return 'founder_owned';
  }

  private calculateSuccessionRisk(age: number, ownership: OwnershipType, text: string): SuccessionRisk {
    if (ownership === 'private_equity' || ownership === 'public') {
      return 'low';
    }
    if (age >= 18 || ownership === 'family_owned' || text.includes('founder') || text.includes('retirement')) {
      return 'high';
    }
    if (age >= 8) {
      return 'medium';
    }
    return 'low';
  }

  private calculateETABreakdown(industry: string, age: number, ownership: OwnershipType, text: string): ETAScoreBreakdown {
    // 1. Recurring Revenue Signal (0 - 25)
    let recurring = 16;
    if (industry.includes('Software') || industry.includes('Managed IT') || text.includes('subscription') || text.includes('retainer') || text.includes('annual contract')) {
      recurring = 24;
    } else if (industry.includes('Facilities') || industry.includes('Services')) {
      recurring = 20;
    }

    // 2. Market Stability (0 - 25)
    let stability = 14;
    if (age >= 15) stability = 25;
    else if (age >= 10) stability = 22;
    else if (age >= 5) stability = 18;

    // 3. Owner Succession Signal (0 - 25)
    let succession = 15;
    if (ownership === 'family_owned') succession = 25;
    else if (ownership === 'founder_owned' && age >= 12) succession = 24;
    else if (ownership === 'founder_owned') succession = 19;
    else if (ownership === 'private_equity') succession = 5;

    // 4. Margin Profile (0 - 25)
    let margin = 18;
    if (industry.includes('Software') || industry.includes('Cybersecurity')) margin = 24;
    else if (industry.includes('Services') || industry.includes('Manufacturing')) margin = 20;

    return {
      recurringRevenueSignal: recurring,
      marketStability: stability,
      ownerSuccessionSignal: succession,
      marginProfile: margin
    };
  }

  private extractContacts(raw: ScrapedRawData, text: string): Contact[] {
    const contacts: Contact[] = [];

    // Primary decision maker heuristic
    const domainClean = raw.domain.split('.')[0];
    const email = raw.emails[0] || `leadership@${raw.domain}`;
    const phone = raw.phones[0] || undefined;
    const linkedin = raw.socials.linkedin || `https://www.linkedin.com/company/${domainClean}`;

    contacts.push({
      name: 'Managing Partner / Founder',
      title: 'Founder & CEO',
      email,
      phone,
      linkedin,
      isDecisionMaker: true
    });

    if (raw.emails.length > 1) {
      contacts.push({
        name: 'Operations Leadership',
        title: 'VP of Operations',
        email: raw.emails[1],
        isDecisionMaker: false
      });
    }

    return contacts;
  }

  private generateDealThesis(name: string, industry: string, age: number, ownership: OwnershipType, rev: string, ebitda: string): string {
    const ownerLabel = ownership === 'family_owned' ? 'family-owned' : 'privately-held founder-run';
    return `${name} represents a prime ETA acquisition target in ${industry}. Established over ${age} years with an estimated ${rev} revenue (~${ebitda} EBITDA), the business demonstrates sticky B2B customer retention and strong cash flow durability. As a ${ownerLabel} enterprise, it exhibits high succession readiness with significant operational expansion potential via post-acquisition AI automation and modernized go-to-market workflows.`;
  }

  private generateAcquisitionLetter(name: string, founderName: string, industry: string, age: number, location: string): string {
    return `Subject: Confidential Inquiry regarding ${name} - Carrying Forward Your Legacy

Dear ${founderName},

I hope this message finds you well. I am reaching out as an acquisition entrepreneur backed by Caprae Capital Partners, a private equity and M&A platform focused on lower-middle-market leaders in ${industry}.

We have been closely following ${name}'s journey in ${location} and have immense respect for the enduring business and reputation you have built over the past ${age}+ years. 

Unlike traditional financial private equity firms that look to flip businesses or aggressively cut costs, our model is grounded in a 7-year growth partnership. We seek to acquire a single exceptional company, step in operationally alongside existing leadership, and inject practical AI and technology modernizations to preserve and scale the founder's life work.

If you have ever considered what succession or the next chapter for ${name} might look like, I would welcome a brief, strictly confidential 15-minute introductory conversation.

Thank you for your time and continued leadership in our ecosystem.

Warm regards,

Deal Sourcing & Acquisitions Team
Caprae Capital Partners
https://www.capraecapitalpartners.com`;
  }
}

export const aiScreenerService = new AIScreenerService();

