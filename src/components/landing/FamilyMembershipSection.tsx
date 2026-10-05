'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, Users, ArrowRight, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function FamilyMembershipSection() {
  const { t } = useLanguage();

  const benefits = [
    t.family_membership.benefit1,
    t.family_membership.benefit2,
    t.family_membership.benefit3,
    t.family_membership.benefit4,
    t.family_membership.benefit5,
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-gradient-to-br from-[#0A2A8C] via-[#123EAF] to-[#1F6BFF] rounded-panel p-8 sm:p-14 text-white shadow-2xl relative overflow-hidden">
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Info & Benefits */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#FFB41F] text-[#0B1B3F] text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
              <Users className="w-3.5 h-3.5" />
              <span>{t.family_membership.slots_label}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-bold text-white leading-tight">
              {t.family_membership.title}
            </h2>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              {t.family_membership.subtitle}
            </p>

            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-200">
                {t.family_membership.benefits_title}
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                {benefits.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-white/95">
                    <CheckCircle2 className="w-4 h-4 text-[#FFB41F] shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Pricing Box Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-panel p-8 text-[#0B1B3F] shadow-panel border border-white/20 relative">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Household Annual Plan
                </span>
                <span className="bg-green-100 text-green-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Save 40% vs Standalone
                </span>
              </div>

              <div className="py-6">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl font-black text-[#0B1B3F] tracking-tight">
                    ₹1,499
                  </span>
                  <span className="text-gray-500 font-semibold text-sm">
                    {t.family_membership.price_suffix}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Less than ₹125/month for total household coverage across 4 people.
                </p>
              </div>

              {/* 4 slots visual indicator */}
              <div className="bg-blue-50/70 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between text-xs font-bold text-[#0B1B3F] mb-2">
                  <span>Enrolled Family Slots</span>
                  <span className="text-[#1F6BFF]">4 Slots (1 + 3)</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {['Primary', 'Family 1', 'Family 2', 'Family 3'].map((slot, i) => (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-xl text-center border border-blue-200/60 shadow-xs"
                    >
                      <div className="text-base">{i === 0 ? '👑' : '👤'}</div>
                      <span className="text-[10px] font-bold text-gray-700 block truncate mt-0.5">
                        {slot}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href="/membership"
                className="btn-amber w-full justify-between shadow-xl hover:scale-[1.02] active:scale-[0.98] transition group text-sm font-bold"
              >
                <span>{t.family_membership.cta_join}</span>
                <span className="w-8 h-8 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center group-hover:translate-x-1 transition">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              <p className="text-center text-[11px] text-gray-400 mt-3">
                Sandbox Demo Checkout • Instant Activation
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
