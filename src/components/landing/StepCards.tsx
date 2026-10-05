'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Wrench, UserCheck, CreditCard } from 'lucide-react';

export function StepCards() {
  const { t } = useLanguage();

  const steps = [
    {
      num: '01',
      title: t.steps.step1_title,
      desc: t.steps.step1_desc,
      icon: Wrench,
      visualBadge: 'Over 50+ Trades',
      chipColor: 'bg-[#FF5A1F]',
      timelineLabel: 'Immediate Request',
    },
    {
      num: '02',
      title: t.steps.step2_title,
      desc: t.steps.step2_desc,
      icon: UserCheck,
      visualBadge: 'AI Proximity & Verified Skills',
      chipColor: 'bg-[#1F6BFF]',
      timelineLabel: '15-25 Mins Arrival',
    },
    {
      num: '03',
      title: t.steps.step3_title,
      desc: t.steps.step3_desc,
      icon: CreditCard,
      visualBadge: 'Direct Pay & Mutual Aid',
      chipColor: 'bg-[#1FA85A]',
      timelineLabel: 'Job Complete & Invoiced',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-[#1F6BFF] text-xs font-extrabold uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
          Simple 3-Step Process
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0B1B3F] uppercase tracking-tight font-bold mt-3">
          {t.steps.section_title}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-2">
          {t.steps.section_subtitle}
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-panel p-8 border border-gray-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Huge Outlined Numeral */}
              <div className="absolute -top-3 right-4 font-display text-7xl sm:text-8xl font-black text-gray-100 select-none pointer-events-none">
                {s.num}
              </div>

              <div>
                <div className={`w-12 h-12 rounded-2xl ${s.chipColor} text-white flex items-center justify-center shadow-md mb-6 relative z-10`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <div className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full mb-2">
                  {s.visualBadge}
                </div>

                <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F] tracking-tight">
                  {s.title}
                </h3>

                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {/* Timeline ruler beneath */}
              <div className="mt-8 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                  <span>Step {idx + 1} of 3</span>
                  <span className="text-[#1F6BFF]">{s.timelineLabel}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#1F6BFF] to-[#FF5A1F]"
                    style={{ width: `${((idx + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
