import React from 'react';
import { Target, Building, Users, CheckCircle2 } from 'lucide-react';
import type { Stats } from '../types.js';

interface StatsBarProps {
  stats: Stats | null;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      
      {/* Total Leads Sourced */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Total Scraped Targets</span>
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Building className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {stats ? stats.totalLeads : '--'}
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Multi-source verified companies</p>
      </div>

      {/* High-Score ETA Targets */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">High ETA Deal Fit (≥80)</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Target className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
          <span>{stats ? stats.highScoreTargets : '--'}</span>
          <span className="text-xs font-semibold text-emerald-400">Prime Targets</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Ready for 7-year growth model</p>
      </div>

      {/* Founder / Family Owned */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Founder &amp; Family Owned</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Users className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {stats ? stats.founderOwnedDeals : '--'}
        </div>
        <p className="text-[11px] text-gray-400 mt-1">High succession &amp; buyout probability</p>
      </div>

      {/* Pipeline In-Flight */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-400">Contacted / In Pipeline</span>
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="text-2xl font-bold text-white tracking-tight">
          {stats ? stats.contactedCount : '--'}
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Confidential acquisition inquiries sent</p>
      </div>

    </div>
  );
};
