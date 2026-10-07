import React, { useState, useEffect } from 'react';
import { 
  Search, ExternalLink, Mail, Phone, 
  Trash2, Sparkles, Building2, RefreshCw 
} from 'lucide-react';
import { LinkedInIcon } from './components/LinkedInIcon.js';
import { fetchLeads, fetchStats, exportLeadsCsv, deleteLead, updateLeadStatus } from './api.js';
import type { Lead, Stats, LeadStatus } from './types.js';
import { Navbar } from './components/Navbar.js';
import { StatsBar } from './components/StatsBar.js';
import { ScrapeModal } from './components/ScrapeModal.js';
import { LeadDrawer } from './components/LeadDrawer.js';

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedOwnership, setSelectedOwnership] = useState<string>('all');
  const [minEtaScore, setMinEtaScore] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isScrapeModalOpen, setIsScrapeModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetchLeads({
          query: searchQuery,
          industry: selectedIndustry,
          successionRisk: selectedRisk,
          ownershipType: selectedOwnership,
          minEtaScore: minEtaScore > 0 ? minEtaScore : undefined,
          status: selectedStatus
        }),
        fetchStats()
      ]);
      setLeads(leadsRes.leads);
      setStats(statsRes);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedIndustry, selectedRisk, selectedOwnership, minEtaScore, selectedStatus]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportLeadsCsv({
        query: searchQuery,
        industry: selectedIndustry,
        successionRisk: selectedRisk,
        ownershipType: selectedOwnership,
        minEtaScore: minEtaScore > 0 ? minEtaScore : undefined,
        status: selectedStatus
      });
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this lead from the pipeline?')) return;
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      const updatedStats = await fetchStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(id, newStatus);
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead?.id === id) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
      const updatedStats = await fetchStats();
      setStats(updatedStats);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedIndustry('all');
    setSelectedRisk('all');
    setSelectedOwnership('all');
    setMinEtaScore(0);
    setSelectedStatus('all');
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 flex flex-col font-sans selection:bg-teal-500/30">
      
      {/* Top Navbar */}
      <Navbar
        onOpenScrape={() => setIsScrapeModalOpen(true)}
        onExport={handleExport}
        isExporting={isExporting}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full flex-1">
        
        {/* Banner Section */}
        <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-950/30 via-slate-900 to-blue-950/30 border border-teal-500/20 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Lower-Middle-Market Deal Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              AI-Powered Search Fund &amp; PE Deal Sourcing
            </h1>
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Find off-market acquisition targets, evaluate owner succession risk, estimate EBITDA, and auto-draft confidential founder outreach letters for Caprae Capital’s 7-year growth model.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-teal-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Dashboard Statistics */}
        <StatsBar stats={stats} />

        {/* Search & Filtering Toolbar */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 mb-6 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by company name, domain, city, or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>

            {/* Industry Filter */}
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all" className="bg-[#0b1120]">All Industries</option>
              <option value="Precision Manufacturing" className="bg-[#0b1120]">Precision Manufacturing</option>
              <option value="Managed IT & Cybersecurity" className="bg-[#0b1120]">Managed IT & Cybersecurity</option>
              <option value="Commercial Facilities Services" className="bg-[#0b1120]">Commercial Facilities</option>
              <option value="B2B Software & SaaS" className="bg-[#0b1120]">B2B Software & SaaS</option>
              <option value="Logistics & Supply Chain" className="bg-[#0b1120]">Logistics & Supply Chain</option>
            </select>

            {/* Min ETA Score Filter */}
            <select
              value={minEtaScore}
              onChange={(e) => setMinEtaScore(Number(e.target.value))}
              className="bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value={0} className="bg-[#0b1120]">Any ETA Score</option>
              <option value={80} className="bg-[#0b1120]">ETA Score ≥ 80</option>
              <option value={85} className="bg-[#0b1120]">ETA Score ≥ 85 (Top Fit)</option>
              <option value={90} className="bg-[#0b1120]">ETA Score ≥ 90 (Elite Target)</option>
            </select>

            {/* Succession Risk Filter */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all" className="bg-[#0b1120]">All Succession Risks</option>
              <option value="high" className="bg-[#0b1120]">High Succession Risk (Retiring)</option>
              <option value="medium" className="bg-[#0b1120]">Medium Succession Risk</option>
              <option value="low" className="bg-[#0b1120]">Low Succession Risk</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all" className="bg-[#0b1120]">All Pipeline Statuses</option>
              <option value="new" className="bg-[#0b1120]">New</option>
              <option value="reviewed" className="bg-[#0b1120]">Reviewed</option>
              <option value="contacted" className="bg-[#0b1120]">Contacted</option>
              <option value="passed" className="bg-[#0b1120]">Passed</option>
            </select>

            {/* Reset Button */}
            {(searchQuery || selectedIndustry !== 'all' || selectedRisk !== 'all' || minEtaScore > 0 || selectedStatus !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl text-xs font-medium text-teal-400 hover:text-teal-300 hover:bg-white/5 border border-teal-500/30 transition-colors"
              >
                Reset
              </button>
            )}

          </div>
        </div>

        {/* Leads Data Table */}
        <div className="rounded-2xl border border-white/10 bg-[#0b1120] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-white/[0.03] border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Target Company</th>
                  <th className="py-3.5 px-4">Industry &amp; Location</th>
                  <th className="py-3.5 px-4 text-center">Est. Financials</th>
                  <th className="py-3.5 px-4 text-center">Ownership &amp; Risk</th>
                  <th className="py-3.5 px-4 text-center">ETA Fit Score</th>
                  <th className="py-3.5 px-4">Decision Maker</th>
                  <th className="py-3.5 px-4 text-center">Pipeline</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="h-6 w-6 text-teal-400 animate-spin" />
                        <span>Querying deal database...</span>
                      </div>
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <Building2 className="h-10 w-10 text-gray-600 mx-auto" />
                        <h4 className="text-base font-medium text-white">No targets found matching criteria</h4>
                        <p className="text-xs text-gray-400">
                          Try clearing filters or click &ldquo;Scrape New Target&rdquo; to analyze any company website in real-time.
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="px-4 py-1.5 text-xs rounded-xl bg-white/5 border border-white/10 text-teal-400 hover:text-teal-300"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const dm = lead.contacts.find(c => c.isDecisionMaker) || lead.contacts[0];
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                      >
                        {/* Company Name & Domain */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                              {lead.name}
                            </span>
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-gray-500 hover:text-teal-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                          <div className="text-xs text-gray-400">{lead.domain}</div>
                        </td>

                        {/* Industry & Location */}
                        <td className="py-4 px-4">
                          <div className="text-xs font-medium text-gray-200">{lead.industry}</div>
                          <div className="text-[11px] text-gray-400">{lead.location}</div>
                        </td>

                        {/* Est. Financials */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-bold text-white">{lead.estimatedRevenue} Rev</span>
                            <span className="text-[11px] font-semibold text-emerald-400">{lead.estimatedEbitda} EBITDA</span>
                          </div>
                        </td>

                        {/* Ownership & Succession Risk */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-gray-300">
                              {lead.ownershipType === 'family_owned' ? 'Family Owned' : 'Founder Owned'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              lead.successionRisk === 'high'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : lead.successionRisk === 'medium'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-500/10 text-gray-400 border border-gray-500/30'
                            }`}>
                              {lead.successionRisk.toUpperCase()} Succession
                            </span>
                          </div>
                        </td>

                        {/* ETA Fit Score */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-teal-400 font-bold text-xs">
                            <Sparkles className="h-3 w-3" />
                            <span>{lead.etaScore}</span>
                          </div>
                        </td>

                        {/* Primary Decision Maker */}
                        <td className="py-4 px-4">
                          {dm ? (
                            <div>
                              <div className="text-xs font-semibold text-white">{dm.name}</div>
                              <div className="text-[11px] text-gray-400">{dm.title}</div>
                              <div className="flex items-center gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                                {dm.email && (
                                  <a href={`mailto:${dm.email}`} className="text-gray-400 hover:text-teal-400" title={dm.email}>
                                    <Mail className="h-3 w-3" />
                                  </a>
                                )}
                                {dm.phone && (
                                  <a href={`tel:${dm.phone}`} className="text-gray-400 hover:text-teal-400" title={dm.phone}>
                                    <Phone className="h-3 w-3" />
                                  </a>
                                )}
                                {dm.linkedin && (
                                  <a href={dm.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-400">
                                    <LinkedInIcon className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-500">Unassigned</span>
                          )}
                        </td>

                        {/* Pipeline Status */}
                        <td className="py-4 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusUpdate(lead.id, e.target.value as LeadStatus)}
                            className="bg-white/5 border border-white/10 text-xs text-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                          >
                            <option value="new" className="bg-[#0b1120]">New</option>
                            <option value="reviewed" className="bg-[#0b1120]">Reviewed</option>
                            <option value="contacted" className="bg-[#0b1120]">Contacted</option>
                            <option value="passed" className="bg-[#0b1120]">Passed</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedLead(lead)}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 transition-colors"
                            >
                              Deal Memo
                            </button>
                            <button
                              onClick={(e) => handleDelete(e, lead.id)}
                              className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Scrape Modal */}
      <ScrapeModal
        isOpen={isScrapeModalOpen}
        onClose={() => setIsScrapeModalOpen(false)}
        onScrapeSuccess={(newLead) => {
          setLeads(prev => [newLead, ...prev]);
          setSelectedLead(newLead);
          loadData();
        }}
        onBulkSuccess={() => {
          loadData();
        }}
      />

      {/* Detailed Lead Drawer */}
      <LeadDrawer
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onStatusChange={(id, newStatus) => {
          setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
        }}
      />

    </div>
  );
}

export default App;
