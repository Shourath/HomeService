'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function FinalCtaSection() {
  const { t } = useLanguage();

  return (
    <section className="relative shell-gradient py-20 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
          Guaranteed Cooperative Craftsmanship
        </span>

        <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight font-black text-white mt-4 max-w-3xl mx-auto leading-tight">
          {t.cta_final.title}
        </h2>

        <p className="text-blue-100 text-sm sm:text-base max-w-xl mx-auto mt-3">
          {t.cta_final.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href="/book"
            className="btn-amber text-base font-bold shadow-2xl hover:scale-105 active:scale-95 transition group"
          >
            <span>{t.hero.cta_book}</span>
            <span className="w-8 h-8 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center group-hover:translate-x-1 transition shadow-sm">
              <ArrowRight className="w-5 h-5" />
            </span>
          </Link>

          <Link
            href="/provider/register"
            className="btn-secondary text-sm font-semibold border-white/30 hover:bg-white/20 transition"
          >
            <span>Join as a Worker</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Trust Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-12 pt-8 border-t border-white/15 text-xs text-blue-100 font-semibold">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-[#FFB41F]" />
            <span>{t.cta_final.chip1}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <CheckCircle2 className="w-4 h-4 text-[#1FA85A]" />
            <span>{t.cta_final.chip2}</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-[#FF5A1F]" />
            <span>{t.cta_final.chip3}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
