import React, { useState } from 'react';
import { 
  X, ExternalLink, Mail, Phone, 
  Target, Users, Copy, Check, 
  Sparkles, RefreshCw, Send 
} from 'lucide-react';
import { LinkedInIcon } from './LinkedInIcon.js';
import { updateLeadStatus, customizeOutreach } from '../api.js';
import type { Lead, LeadStatus } from '../types.js';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

export const LeadDrawer: React.FC<LeadDrawerProps> = ({ lead, onClose, onStatusChange }) => {
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [senderName, setSenderName] = useState('Acquisitions Principal');
  const [firmName, setFirmName] = useState('Caprae Capital Partners');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(lead?.acquisitionLetter || '');

  if (!lead) return null;

  const handleStatusSelect = async (newStatus: LeadStatus) => {
    try {
      await updateLeadStatus(lead.id, newStatus);
      onStatusChange(lead.id, newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(currentLetter || lead.acquisitionLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleRegenerateLetter = async () => {
    setIsGenerating(true);
    try {
      const letter = await customizeOutreach(lead.id, senderName, firmName);
      setCurrentLetter(letter);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const primaryContact = lead.contacts.find(c => c.isDecisionMaker) || lead.contacts[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border-l border-white/10 w-full max-w-2xl h-full overflow-y-auto shadow-2xl flex flex-col text-gray-200">
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 bg-[#0b1120]/95 backdrop-blur-md p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-white">{lead.name}</span>
              <a
                href={lead.website}
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-teal-400 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              <span>{lead.industry}</span>
              <span>•</span>
              <span>{lead.location}</span>
              {lead.foundedYear && (
                <>
                  <span>•</span>
                  <span>Founded {lead.foundedYear} ({new Date().getFullYear() - lead.foundedYear} yrs)</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={lead.status}
              onChange={(e) => handleStatusSelect(e.target.value as LeadStatus)}
              className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
            >
              <option value="new" className="bg-[#0b1120]">Status: New</option>
              <option value="reviewed" className="bg-[#0b1120]">Status: Reviewed</option>
              <option value="contacted" className="bg-[#0b1120]">Status: Contacted</option>
              <option value="passed" className="bg-[#0b1120]">Status: Passed</option>
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* Top Metric Strip: Score & Financials */}
          <div className="grid grid-cols-3 gap-3">
            
            {/* ETA Score Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/30 text-center">
              <span className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider block mb-0.5">
                ETA Fit Score
              </span>
              <div className="text-2xl font-extrabold text-white">
                {lead.etaScore}<span className="text-xs font-normal text-gray-400">/100</span>
              </div>
              <span className="text-[10px] text-emerald-400">
                {lead.etaScore >= 85 ? 'Top 5% Target' : 'Search Fund Target'}
              </span>
            </div>

            {/* Est. Revenue */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                Est. Revenue
              </span>
              <div className="text-2xl font-bold text-white">
                {lead.estimatedRevenue}
              </div>
              <span className="text-[10px] text-gray-400">
                ~{lead.employeeCount || 25} Employees
              </span>
            </div>

            {/* Est. EBITDA */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">
                Est. EBITDA
              </span>
              <div className="text-2xl font-bold text-emerald-400">
                {lead.estimatedEbitda}
              </div>
              <span className="text-[10px] text-gray-400">
                ~22% EBITDA Margin
              </span>
            </div>

          </div>

          {/* ETA Breakdown Cards */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Target className="h-4 w-4 text-teal-400" />
              <span>Search Fund Evaluation Matrix</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white/5 flex justify-between items-center">
                <span className="text-gray-400">Recurring MRR / Retainer:</span>
                <span className="font-semibold text-teal-400">{lead.etaScoreBreakdown.recurringRevenueSignal}/25</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 flex justify-between items-center">
                <span className="text-gray-400">Market Stability / Defensibility:</span>
                <span className="font-semibold text-teal-400">{lead.etaScoreBreakdown.marketStability}/25</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 flex justify-between items-center">
                <span className="text-gray-400">Owner Succession Catalyst:</span>
                <span className="font-semibold text-teal-400">{lead.etaScoreBreakdown.ownerSuccessionSignal}/25</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/5 flex justify-between items-center">
                <span className="text-gray-400">Cash Flow &amp; Margin Profile:</span>
                <span className="font-semibold text-teal-400">{lead.etaScoreBreakdown.marginProfile}/25</span>
              </div>
            </div>
          </div>

          {/* AI Deal Thesis */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-950/20 to-teal-950/20 border border-teal-500/20">
            <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span>Caprae 7-Year Value Creation Thesis</span>
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {lead.dealThesis}
            </p>
          </div>

          {/* Primary Decision Maker Contact Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-teal-400" />
              <span>Decision Maker &amp; Executive Profile</span>
            </h4>
            {primaryContact ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">{primaryContact.name}</div>
                    <div className="text-xs text-teal-400">{primaryContact.title}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Decision Maker
                  </span>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {primaryContact.email && (
                    <a
                      href={`mailto:${primaryContact.email}`}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Mail className="h-3.5 w-3.5 text-teal-400" />
                      <span>{primaryContact.email}</span>
                    </a>
                  )}
                  {primaryContact.phone && (
                    <a
                      href={`tel:${primaryContact.phone}`}
                      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                      <Phone className="h-3.5 w-3.5 text-teal-400" />
                      <span>{primaryContact.phone}</span>
                    </a>
                  )}
                  {primaryContact.linkedin && (
                    <a
                      href={primaryContact.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:underline transition-colors"
                    >
                      <LinkedInIcon className="h-3.5 w-3.5" />
                      <span>LinkedIn Profile</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No primary contact identified yet.</p>
            )}
          </div>

          {/* Tech Stack Signals */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Detected Infrastructure &amp; Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {lead.technologies.map(tech => (
                <span key={tech} className="px-2.5 py-1 rounded-md text-xs bg-white/5 border border-white/10 text-gray-300">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Personalized M&A Acquisition Letter */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="h-4 w-4 text-teal-400" />
                <span>Founder Acquisition Outreach Letter</span>
              </h4>
              <button
                onClick={handleCopyLetter}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-teal-400 hover:text-teal-300 transition-colors"
              >
                {copiedLetter ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Letter</span>
                  </>
                )}
              </button>
            </div>

            {/* Customizer controls */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Sender Name"
                className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-500"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="Firm Name"
                  className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-2.5 py-1.5 flex-1 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={handleRegenerateLetter}
                  disabled={isGenerating}
                  className="px-2.5 py-1.5 bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg text-xs font-medium border border-teal-500/30 transition-colors"
                  title="Regenerate Letter"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <pre className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-gray-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
              {currentLetter || lead.acquisitionLetter}
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
