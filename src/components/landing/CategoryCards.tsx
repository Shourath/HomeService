'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wrench,
  Sparkles,
  HeartHandshake,
  Truck,
  Cpu,
  HardHat,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function CategoryCards() {
  const { t } = useLanguage();

  const categories = [
    {
      slug: 'home-repair',
      name: 'Home & Repair',
      desc: 'Plumbing, electrical wiring, carpentry, painting, appliance fixes.',
      count: '12 Services',
      icon: Wrench,
      chipClass: 'chip-icon-orange',
      priceFrom: '₹299',
      highlight: false,
    },
    {
      slug: 'cleaning-maintenance',
      name: 'Cleaning & Maintenance',
      desc: 'Deep cleaning, sanitization, sofa, carpet, water tanks & pest control.',
      count: '10 Services',
      icon: Sparkles,
      chipClass: 'chip-icon-blue',
      priceFrom: '₹399',
      highlight: false,
    },
    {
      slug: 'care-assistance',
      name: 'Care & Assistance',
      desc: 'Trained elderly caregivers, patient attendants, domestic helpers.',
      count: '8 Services',
      icon: HeartHandshake,
      chipClass: 'chip-icon-purple',
      priceFrom: '₹449',
      highlight: false,
    },
    {
      slug: 'transport-outdoor',
      name: 'Transport & Outdoor',
      desc: 'Professional drivers, vehicle cleaning, loading helpers, gardening.',
      count: '7 Services',
      icon: Truck,
      chipClass: 'chip-icon-green',
      priceFrom: '₹299',
      highlight: false,
    },
    {
      slug: 'technical-professional',
      name: 'Technical & Professional',
      desc: 'CCTV setup, Wi-Fi networking, computer repair, solar panels.',
      count: '7 Services',
      icon: Cpu,
      chipClass: 'chip-icon-blue',
      priceFrom: '₹349',
      highlight: false,
    },
    {
      slug: 'construction-skilled',
      name: 'Construction & Skilled Labour',
      desc: 'Masonry, steel binding, concrete casting, roofing, civil work.',
      count: '8 Services',
      icon: HardHat,
      chipClass: 'chip-icon-purple',
      priceFrom: '₹599',
      highlight: false,
    },
    {
      slug: 'emergency',
      name: 'Emergency Services (SOS)',
      desc: 'Rapid 24/7 dispatch for burst pipes, electrical short circuits & lockouts.',
      count: '6 Services',
      icon: AlertTriangle,
      chipClass: 'chip-icon-orange',
      priceFrom: '₹399',
      highlight: true, // One highlighted orange card as requested
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-[#0A2A8C] text-xs font-extrabold uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
            All 7 Essential Categories
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0B1B3F] uppercase tracking-tight font-bold mt-3">
            {t.categories.section_title}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-1.5">
            {t.categories.section_subtitle}
          </p>
        </div>
        <Link
          href="/services"
          className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-[#1F6BFF] hover:underline"
        >
          <span>View All 50+ Trades</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Staggered Grid of 7 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.slug}
              href={`/book?category=${cat.slug}`}
              className={`rounded-card p-6 border transition-all duration-300 flex flex-col justify-between group ${
                cat.highlight
                  ? 'bg-gradient-to-br from-[#FF5A1F] to-[#FF7A3D] text-white shadow-xl hover:shadow-2xl border-transparent scale-[1.02]'
                  : 'bg-white text-[#0B1B3F] border-gray-200/80 shadow-soft hover:shadow-card hover:-translate-y-1'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={
                      cat.highlight
                        ? 'w-11 h-11 rounded-2xl bg-white/20 text-white flex items-center justify-center'
                        : `chip-icon ${cat.chipClass}`
                    }
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      cat.highlight
                        ? 'bg-white text-[#FF5A1F] uppercase'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </div>

                <h3
                  className={`font-display text-xl font-bold uppercase tracking-tight ${
                    cat.highlight ? 'text-white' : 'text-[#0B1B3F]'
                  }`}
                >
                  {cat.name}
                </h3>
                <p
                  className={`text-xs mt-2 leading-relaxed ${
                    cat.highlight ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {cat.desc}
                </p>
              </div>

              <div
                className={`mt-6 pt-4 border-t flex items-center justify-between text-xs font-semibold ${
                  cat.highlight
                    ? 'border-white/20 text-white'
                    : 'border-gray-100 text-[#1F6BFF]'
                }`}
              >
                <span>From {cat.priceFrom}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition">
                  <span>{cat.highlight ? 'Immediate SOS' : t.categories.book_now}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
