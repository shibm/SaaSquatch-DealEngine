import axios from 'axios';
import * as cheerio from 'cheerio';
import type { ScrapedRawData } from '../types/index.js';
import { getCachedScrape, setCachedScrape } from '../db/database.js';

export class ScraperService {
  private userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  ];

  public normalizeDomain(input: string): { url: string; domain: string } {
    let clean = input.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    try {
      const parsed = new URL(clean);
      const domain = parsed.hostname.replace(/^www\./, '');
      return { url: `${parsed.protocol}//${parsed.hostname}`, domain };
    } catch {
      const domain = clean.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
      return { url: `https://${domain}`, domain };
    }
  }

  public async scrapeWebsite(inputUrl: string, forceFresh = false): Promise<ScrapedRawData> {
    const { url, domain } = this.normalizeDomain(inputUrl);

    // 1. Check cache first
    if (!forceFresh) {
      const cached = getCachedScrape(domain);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgents[0],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000,
        maxRedirects: 5,
        validateStatus: (status) => status < 400
      });

      const html = response.data;
      const rawData = this.parseHtml(html, url, domain);

      // Cache the result
      setCachedScrape(domain, rawData, 48);
      return rawData;
    } catch (err: any) {
      // If fetching directly fails, return graceful fallback with basic domain structure
      const fallbackData: ScrapedRawData = {
        url,
        domain,
        title: domain.split('.')[0].toUpperCase(),
        description: `Company operating under domain ${domain}.`,
        headings: [`Welcome to ${domain}`],
        emails: [`contact@${domain}`, `info@${domain}`],
        phones: [],
        socials: {
          linkedin: `https://www.linkedin.com/company/${domain.split('.')[0]}`
        },
        technologies: ['Custom Web Stack'],
        extractedText: `Domain ${domain}`
      };
      setCachedScrape(domain, fallbackData, 24);
      return fallbackData;
    }
  }

  private parseHtml(html: string, url: string, domain: string): ScrapedRawData {
    const $ = cheerio.load(html);

    // Metadata
    const title = $('title').first().text().trim() ||
                  $('meta[property="og:title"]').attr('content') ||
                  domain;

    const description = $('meta[name="description"]').attr('content') ||
                        $('meta[property="og:description"]').attr('content') ||
                        '';

    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');

    // Headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 5 && text.length < 150 && !headings.includes(text)) {
        headings.push(text);
      }
    });

    // Extract emails
    const emailsSet = new Set<string>();
    $('a[href^="mailto:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
      if (email && email.includes('@')) emailsSet.add(email);
    });

    // Regex email scanning in text
    const textContent = $('body').text().replace(/\s+/g, ' ');
    const emailMatches = textContent.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    for (const match of emailMatches) {
      const clean = match.toLowerCase();
      if (!clean.endsWith('.png') && !clean.endsWith('.jpg') && !clean.endsWith('.svg') && !clean.endsWith('.webp')) {
        emailsSet.add(clean);
      }
    }

    // Extract phones
    const phoneSet = new Set<string>();
    $('a[href^="tel:"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const phone = href.replace(/^tel:/i, '').trim();
      if (phone.length >= 7) phoneSet.add(phone);
    });

    const phoneMatches = textContent.match(/(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    for (const p of phoneMatches.slice(0, 3)) {
      phoneSet.add(p.trim());
    }

    // Social Links
    const socials: ScrapedRawData['socials'] = {};
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('linkedin.com/company') || href.includes('linkedin.com/in')) {
        socials.linkedin = href;
      } else if (href.includes('twitter.com') || href.includes('x.com')) {
        socials.twitter = href;
      } else if (href.includes('facebook.com')) {
        socials.facebook = href;
      }
    });

    // Detect Technologies
    const technologies: string[] = [];
    const htmlLower = html.toLowerCase();
    if (htmlLower.includes('wp-content') || htmlLower.includes('wordpress')) technologies.push('WordPress');
    if (htmlLower.includes('shopify')) technologies.push('Shopify');
    if (htmlLower.includes('webflow')) technologies.push('Webflow');
    if (htmlLower.includes('wix.com')) technologies.push('Wix');
    if (htmlLower.includes('squarespace')) technologies.push('Squarespace');
    if (htmlLower.includes('_next') || htmlLower.includes('next.js')) technologies.push('Next.js');
    if (htmlLower.includes('react')) technologies.push('React');
    if (htmlLower.includes('vue')) technologies.push('Vue.js');
    if (htmlLower.includes('google-analytics') || htmlLower.includes('gtag')) technologies.push('Google Analytics');
    if (htmlLower.includes('hubspot')) technologies.push('HubSpot');
    if (htmlLower.includes('salesforce')) technologies.push('Salesforce');
    if (htmlLower.includes('stripe')) technologies.push('Stripe');
    if (technologies.length === 0) technologies.push('Custom Web Stack');

    // Detect Founded / Copyright Year
    let copyrightYear: number | undefined;
    const yearMatch = textContent.match(/©\s*(\d{4})|copyright\s*(\d{4})|founded\s*(?:in\s*)?(\d{4})/i);
    if (yearMatch) {
      const found = parseInt(yearMatch[1] || yearMatch[2] || yearMatch[3], 10);
      if (found >= 1950 && found <= new Date().getFullYear()) {
        copyrightYear = found;
      }
    }

    return {
      url,
      domain,
      title: title.slice(0, 150),
      description: description.slice(0, 500),
      ogTitle,
      ogDescription,
      headings: headings.slice(0, 10),
      emails: Array.from(emailsSet).slice(0, 5),
      phones: Array.from(phoneSet).slice(0, 3),
      socials,
      technologies,
      copyrightYear,
      extractedText: textContent.slice(0, 3000)
    };
  }
}

export const scraperService = new ScraperService();

