'use client';

import React from 'react';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function TestimonialCards() {
  const { t } = useLanguage();

  const reviews = [
    {
      name: 'Venkatesh Raghavan',
      area: 'West Tambaram, Chennai',
      trade: 'Plumbing & Faucet Overhaul',
      worker: 'Kumar Selvam (Level 4 Advanced)',
      rating: 5,
      date: '2 weeks ago',
      avatar: '👨🏽‍💼',
      quote:
        'When our kitchen main pipe burst on a Sunday morning, Kumar arrived within 20 minutes through the cooperative emergency dispatch. Transparent pricing, no sudden bargaining, and courteous professional service!',
    },
    {
      name: 'Kavitha Sundaresan',
      area: 'Radha Nagar, Chromepet',
      trade: 'Full House Deep Cleaning',
      worker: 'Lakshmi & Team (Level 3 Certified)',
      rating: 5,
      date: '1 week ago',
      avatar: '👩🏽‍🏫',
      quote:
        'Knowing that 90%+ of what I pay goes directly to these hardworking women and their welfare fund makes HOMEService so much better than venture-backed platforms. The deep clean was immaculate.',
    },
    {
      name: 'Dr. Subramanian Raman',
      area: 'Pallavaram, Chennai',
      trade: 'Inverter Wiring & Electrical Safety',
      worker: 'Rajesh Subramanian (Level 5 Expert)',
      rating: 5,
      date: '3 weeks ago',
      avatar: '👨🏽‍⚕️',
      quote:
        'Rajesh inspected our 15-year old switchboard, explained every circuit fault clearly, and tested each safety breaker. As an elderly household on the Annual Family Plan, the priority service is unmatched.',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            <span>Customer Testimonials</span>
            <span className="text-[10px] bg-white text-gray-700 px-1.5 py-0.2 rounded">
              Demo data
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0B1B3F] uppercase tracking-tight font-bold mt-3">
            {t.testimonials.title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1.5">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* 100+ verified reviews avatar stack badge */}
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-200/80 shadow-soft">
          <div className="flex -space-x-2">
            {['👨🏾', '👩🏽', '👨🏻', '👵🏽'].map((em, idx) => (
              <div
                key={idx}
                className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-sm shadow-xs"
              >
                {em}
              </div>
            ))}
          </div>
          <div className="text-xs">
            <p className="font-bold text-[#0B1B3F]">100+ Verified Reviews</p>
            <p className="text-gray-500 text-[10px]">Tambaram & Guindy Federations</p>
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={idx}
            className="bg-white rounded-panel p-7 border border-gray-200/80 shadow-soft hover:shadow-card hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-[#FFB41F]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#FFB41F]" />
                  ))}
                </div>
                <Quote className="w-7 h-7 text-blue-100" />
              </div>

              <p className="text-xs sm:text-sm text-gray-700 italic leading-relaxed">
                "{rev.quote}"
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shrink-0">
                  {rev.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-[#0B1B3F] truncate">{rev.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate">{rev.area}</p>
                </div>
              </div>

              <div className="mt-2 pt-2 bg-gray-50/80 rounded-lg p-2 text-[10px] text-gray-600 flex items-center justify-between">
                <span className="font-medium text-blue-900">{rev.trade}</span>
                <span className="text-gray-400">{rev.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
