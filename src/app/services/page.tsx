'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Wrench, Sparkles, HeartHandshake, Truck, Cpu, HardHat, AlertTriangle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = categories.map((cat) => {
    const matchedServices = cat.services.filter((s: any) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nameTa && s.nameTa.includes(searchQuery))
    );
    return { ...cat, services: matchedServices };
  }).filter((cat) => cat.services.length > 0 || cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center text-white max-w-2xl mx-auto">
          <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
            Full Trade Catalogue
          </span>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight font-black mt-2">
            Verified Cooperative Services
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Over 50 skilled trades across 7 essential categories backed by cooperative societies
          </p>

          {/* Search bar */}
          <div className="mt-6 relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search electrician, plumber, deep cleaning, AC technician..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white placeholder-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFB41F]"
            />
            <Search className="w-5 h-5 text-blue-200 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Categories & Services Grid */}
        <div className="space-y-10">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="panel-white p-6 sm:p-8 border border-gray-100 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
                <div className="flex items-center gap-3">
                  <div className="chip-icon chip-icon-blue">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold uppercase text-[#0B1B3F]">
                      {cat.name}
                    </h2>
                    <p className="text-xs text-gray-500">{cat.description}</p>
                  </div>
                </div>

                <Link
                  href={`/book?category=${cat.slug}`}
                  className="btn-amber text-xs font-bold px-4 py-2 self-start sm:self-auto"
                >
                  <span>Book in Category</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Services in this category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {cat.services.map((svc: any) => (
                  <Link
                    key={svc.id}
                    href={`/book?category=${cat.slug}&service=${svc.slug}`}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-[#1F6BFF] hover:shadow-card bg-gray-50/50 hover:bg-white transition flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#0B1B3F] group-hover:text-[#1F6BFF]">
                          {svc.name}
                        </h4>
                        {svc.isEmergencyEligible && (
                          <span className="bg-orange-100 text-[#FF5A1F] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                            SOS
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Est. {svc.durationMinutes} mins • Level {svc.requiredLevel}+ Verified
                      </p>
                    </div>

                    <div className="mt-4 pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                      <span className="font-display text-base font-bold text-[#0B1B3F]">
                        From ₹{svc.basePrice}
                      </span>
                      <span className="text-[#1F6BFF] font-bold group-hover:translate-x-0.5 transition">
                        Select →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
