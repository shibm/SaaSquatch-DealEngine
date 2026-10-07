import type { Lead, Stats, LeadStatus } from './types.js';

const BASE_URL = '/api';

export async function fetchLeads(params: Record<string, any> = {}): Promise<{ leads: Lead[]; total: number }> {
  const query = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== '' && val !== 'all') {
      query.append(key, String(val));
    }
  }

  const res = await fetch(`${BASE_URL}/leads?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch leads');
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${BASE_URL}/leads/stats`);
  if (!res.ok) throw new Error('Failed to fetch statistics');
  return res.json();
}

export async function scrapeDomain(url: string, forceFresh = false): Promise<{ message: string; lead: Lead }> {
  const res = await fetch(`${BASE_URL}/leads/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, forceFresh })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to scrape domain');
  }
  return res.json();
}

export async function bulkScrapeDomains(domains: string[]): Promise<{ processedCount: number; leads: Lead[] }> {
  const res = await fetch(`${BASE_URL}/leads/bulk-scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ domains })
  });
  if (!res.ok) throw new Error('Failed to bulk scrape');
  return res.json();
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const res = await fetch(`${BASE_URL}/leads/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update status');
}

export async function deleteLead(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/leads/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete lead');
}

export async function exportLeadsCsv(filters: Record<string, any> = {}): Promise<void> {
  const res = await fetch(`${BASE_URL}/leads/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters })
  });
  if (!res.ok) throw new Error('Failed to export CSV');
  
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `saasquatch-leads-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
}

export async function customizeOutreach(id: string, senderName: string, firmName: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/leads/${id}/generate-outreach`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senderName, firmName })
  });
  if (!res.ok) throw new Error('Failed to generate outreach');
  const data = await res.json();
  return data.acquisitionLetter;
}

