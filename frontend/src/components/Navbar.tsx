import React from 'react';
import { Download, Plus, Layers } from 'lucide-react';

interface NavbarProps {
  onOpenScrape: () => void;
  onExport: () => void;
  isExporting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenScrape, onExport, isExporting }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0a0f1c]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Branding */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">SaaSquatch</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-400 border border-teal-500/30">
                ETA DealEngine
              </span>
            </div>
            <p className="text-xs text-gray-400 hidden sm:block">
              Proprietary M&A Sourcing &amp; Succession Intelligence · Caprae Capital
            </p>
          </div>
        </div>

        {/* Status Indicator & Global Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI Sourcing Engine: <strong className="text-white">Active</strong></span>
          </div>

          <button
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 transition-all hover:text-white"
          >
            <Download className="h-4 w-4 text-teal-400" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={onOpenScrape}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white shadow-lg shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Scrape New Target</span>
          </button>
        </div>

      </div>
    </header>
  );
};

