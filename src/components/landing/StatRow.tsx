'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';

export function StatRow() {
  const { t } = useLanguage();

  const stats = [
    { value: '24+', label: t.hero.stat_coops },
    { value: '12k+', label: t.hero.stat_jobs },
    { value: '4.9/5', label: t.hero.stat_rating },
    { value: '100%', label: t.hero.stat_ownership },
  ];

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-full border border-white/20 p-4 sm:px-8 sm:py-5 shadow-2xl">
      <div className="flex items-center justify-between text-[10px] text-blue-200 mb-2 uppercase tracking-wider px-2">
        <span>Verified Cooperative Impact</span>
        <span className="bg-white/20 text-white font-semibold px-2 py-0.5 rounded-full">
          Demo data
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center divide-y md:divide-y-0 md:divide-x divide-white/15">
        {stats.map((s, idx) => (
          <div key={idx} className="pt-2 md:pt-0 md:px-4">
            <div className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {s.value}
            </div>
            <div className="text-[11px] sm:text-xs font-semibold text-blue-100 uppercase tracking-wider mt-0.5">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
