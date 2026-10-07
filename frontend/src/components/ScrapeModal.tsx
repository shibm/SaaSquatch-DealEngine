import React, { useState } from 'react';
import { X, Search, Sparkles, Globe, Loader2, Layers, AlertCircle } from 'lucide-react';
import { scrapeDomain, bulkScrapeDomains } from '../api.js';
import type { Lead } from '../types.js';

interface ScrapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrapeSuccess: (lead: Lead) => void;
  onBulkSuccess: () => void;
}

export const ScrapeModal: React.FC<ScrapeModalProps> = ({
  isOpen,
  onClose,
  onScrapeSuccess,
  onBulkSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSingleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep('Connecting to domain and extracting metadata...');

    try {
      setTimeout(() => setLoadingStep('Analyzing tech stack & discovering decision-makers...'), 1000);
      setTimeout(() => setLoadingStep('Computing ETA Acquisition Score & Succession Risk...'), 2000);
      setTimeout(() => setLoadingStep('Synthesizing M&A Deal Thesis & Outreach Letter...'), 3000);

      const result = await scrapeDomain(singleUrl.trim());
      setIsLoading(false);
      onScrapeSuccess(result.lead);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Scraping failed. Please check the domain and try again.');
    }
  };

  const handleBulkScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    const domains = bulkText
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 3);

    if (domains.length === 0) return;

    setIsLoading(true);
    setError(null);
    setLoadingStep(`Batch scraping ${domains.length} target companies in parallel...`);

    try {
      await bulkScrapeDomains(domains);
      setIsLoading(false);
      onBulkSuccess();
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Bulk scrape failed.');
    }
  };

  const setPresetDomain = (domain: string) => {
    setSingleUrl(domain);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0b1120] border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-gray-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Live Deal Scraping &amp; Sourcing</h3>
              <p className="text-xs text-gray-400">Instant extraction, ETA scoring, and M&A thesis generation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/10 px-6 pt-3 bg-white/[0.01]">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors mr-6 ${
              activeTab === 'single'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Single Company URL
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'bulk'
                ? 'border-teal-400 text-teal-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            Bulk Multi-Domain Sourcing
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-4">
                <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                <Sparkles className="h-4 w-4 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm font-medium text-white mb-1">Analyzing Target Company</p>
              <p className="text-xs text-teal-400 animate-pulse">{loadingStep}</p>
              <div className="mt-6 w-3/4 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-teal-400 to-blue-500 h-full w-2/3 animate-[pulse_1.5s_infinite]"></div>
              </div>
            </div>
          ) : activeTab === 'single' ? (
            <form onSubmit={handleSingleScrape} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Company Website or Domain
                </label>
                <div className="relative">
                  <Globe className="h-4 w-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    placeholder="e.g. apexshieldmsp.com or https://company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] text-gray-400 mr-2">Try sample targets:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                  {['summitmfg.com', 'clearwatercontrols.com', 'novacloudmsp.com'].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setPresetDomain(preset)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-teal-400 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Search className="h-4 w-4" />
                  <span>Start Live Scrape &amp; Score</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleBulkScrape} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                  Domains to Scrape (one per line, up to 10)
                </label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={"industrialmachining.com\nregionalcoldstorage.com\nsummitmsp.com"}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/20 transition-all"
                >
                  <Layers className="h-4 w-4" />
                  <span>Process Batch Sourcing</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
