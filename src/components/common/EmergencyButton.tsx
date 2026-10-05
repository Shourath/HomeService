'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function EmergencyButton() {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-6 left-6 z-40">
      <Link
        href="/emergency"
        className="group flex items-center gap-2.5 bg-[#FF5A1F] hover:bg-[#e04812] text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/40 ring-4 ring-[#FF5A1F]/30 animate-pulse hover:animate-none"
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-4 h-4 text-white" />
        </span>
        <span className="font-extrabold tracking-wide">{t.emergency.button}</span>
      </Link>
    </div>
  );
}
