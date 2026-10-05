'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Users, Wrench, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { StatRow } from './StatRow';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative shell-gradient pt-12 pb-24 text-white overflow-hidden">
      {/* Decorative background glow rings */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headlines & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Federation Badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-4 py-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#1FA85A] animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                {t.hero.badge}
              </span>
            </div>

            {/* Display Headline */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[1.05] text-white">
              {t.hero.title_part1} <br />
              <span className="text-[#FFB41F] underline decoration-wavy decoration-[#FF5A1F]/60">
                {t.hero.title_part2}
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-blue-100 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* Primary Amber CTA with orange circular arrow icon */}
              <Link
                href="/book"
                className="btn-amber text-base font-bold shadow-xl hover:scale-105 active:scale-95 transition group"
              >
                <span>{t.hero.cta_book}</span>
                <span className="w-8 h-8 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center group-hover:translate-x-1 transition shadow-sm">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Link>

              {/* Provider Button */}
              <Link
                href="/provider"
                className="btn-secondary text-sm font-semibold border-white/30 hover:bg-white/20 transition"
              >
                <span>{t.hero.cta_provider}</span>
              </Link>
            </div>

            {/* Verified Reviews Badge */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {['👨🏽‍🔧', '👩🏽‍⚕️', '👨🏾‍🏭', '👩🏽‍🍳'].map((avatar, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white border-2 border-[#1F6BFF] flex items-center justify-center text-sm shadow-sm"
                  >
                    {avatar}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-blue-100">
                <div className="flex text-[#FFB41F]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-[#FFB41F]" />
                  ))}
                </div>
                <span className="font-bold text-white">4.9 / 5</span>
                <span>• {t.hero.review_badge}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-white/10 backdrop-blur-xl border border-white/25 rounded-panel p-6 shadow-2xl overflow-hidden">
              {/* Top Card Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-white/15">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#1FA85A] text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Cooperative Guarantee</h3>
                    <p className="text-[11px] text-blue-200">100% Verified Society Members</p>
                  </div>
                </div>
                <span className="bg-[#FFB41F] text-[#0B1B3F] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Zero Markup
                </span>
              </div>

              {/* Sample Verified Worker Highlight */}
              <div className="bg-white rounded-2xl p-4 my-4 shadow-lg text-[#0B1B3F]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-2xl">
                    👨🏽‍🔧
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Kumar Selvam</h4>
                      <span className="text-[11px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-md">
                        Available Now
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Master Plumber • 8 Yrs Experience</p>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-amber-500 font-bold flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.8
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600 font-medium">426 Jobs Completed</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1FA85A]" />
                    <span>State ITI Certified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1FA85A]" />
                    <span>Cooperative Welfare Insured</span>
                  </div>
                </div>
              </div>

              {/* Instant dispatch preview */}
              <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between text-xs text-blue-100">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#1FA85A]" />
                  Average Arrival Time: 15-25 Mins
                </span>
                <span className="text-white font-bold">Tambaram & Chromepet</span>
              </div>
            </div>
          </div>
        </div>

        {/* StatRow along bottom */}
        <div className="mt-16">
          <StatRow />
        </div>
      </div>
    </section>
  );
}
