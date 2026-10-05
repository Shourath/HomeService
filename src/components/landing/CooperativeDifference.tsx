'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Coins, HeartHandshake, Zap, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function CooperativeDifference() {
  const { t } = useLanguage();

  const cards = [
    {
      title: t.difference.card1_title,
      desc: t.difference.card1_desc,
      icon: ShieldCheck,
      chipClass: 'chip-icon-blue',
      chipColor: 'bg-[#1F6BFF]',
    },
    {
      title: t.difference.card2_title,
      desc: t.difference.card2_desc,
      icon: Coins,
      chipClass: 'chip-icon-green',
      chipColor: 'bg-[#1FA85A]',
    },
    {
      title: t.difference.card3_title,
      desc: t.difference.card3_desc,
      icon: HeartHandshake,
      chipClass: 'chip-icon-purple',
      chipColor: 'bg-[#8438FF]',
    },
    {
      title: t.difference.card4_title,
      desc: t.difference.card4_desc,
      icon: Zap,
      chipClass: 'chip-icon-orange',
      chipColor: 'bg-[#FF5A1F]',
    },
  ];

  return (
    <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
      <div className="panel-white p-8 sm:p-12 border border-gray-100 shadow-panel">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#FF5A1F] text-xs font-extrabold uppercase tracking-widest bg-[#FFEAE2] px-3.5 py-1.5 rounded-full">
            Worker-Owned Model
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0B1B3F] uppercase tracking-tight font-bold mt-3">
            {t.difference.section_title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2 font-normal">
            {t.difference.section_subtitle}
          </p>
        </div>

        {/* Four Staggered Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div
                key={i}
                className="bg-[#F7F8DC]/50 rounded-card p-6 border border-gray-200/60 hover:border-[#1F6BFF]/40 hover:shadow-card hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className={`chip-icon ${c.chipClass} mb-5`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-[#0B1B3F] text-lg leading-snug">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-[#1F6BFF]">
                  <span>Cooperative Standard</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1FA85A]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Button */}
        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="btn-amber text-sm font-bold shadow-md hover:scale-105 transition"
          >
            <span>Explore All Cooperative Trades</span>
            <span className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center">
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
