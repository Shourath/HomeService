'use client';

import React, { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function FaqAccordion() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // first item open by default

  const faqs = [
    {
      q: 'How does cooperative pricing differ from commercial gig apps?',
      a: 'Unlike commercial gig apps that extract up to 30-40% in hidden commission, HOMEService is owned directly by labour cooperative societies. A nominal 5% platform fee covers cloud infrastructure, and 5% goes to the society mutual aid welfare fund. Over 90% of your service fee goes straight to the skilled worker.',
    },
    {
      q: 'How does the Annual Family Membership (1 + 3) work?',
      a: 'For ₹1,499 per year, you get full coverage for up to 4 household members (1 primary account + 3 invited family members). All 4 members enjoy priority booking dispatch, zero emergency surcharges on urgent calls, digital GST invoices, and access to the shared family booking history.',
    },
    {
      q: 'How are cooperative service providers verified?',
      a: 'Every worker must be an enrolled member of a recognised state labour cooperative society. We verify their government KYC, physical address, police clearance, and trade credentials. Senior master craftspeople conduct practical skill assessments before upgrading a worker from Level 1 Registered to Level 2 Verified or Level 3 Certified.',
    },
    {
      q: 'How fast is emergency dispatch in my area?',
      a: 'When an emergency SOS is triggered for plumbing leaks, power trips, or lockout emergencies, nearby active workers on rapid standby are notified immediately with a 2-minute countdown. The first accepting worker is dispatched with live tracking, arriving in 15-25 minutes in major residential zones like Tambaram, Chromepet, and Pallavaram.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'Our digital marketplace provides a sandbox payment adapter supporting UPI QR / intent (Google Pay, PhonePe, Paytm), debit/credit cards, and net banking. Official digital GST receipts and invoices are generated automatically upon job completion.',
    },
    {
      q: 'Can family members book emergencies on my plan?',
      a: 'Yes! As the primary account holder, you can configure granular permissions for each of your 3 family members: allow standard booking, allow emergency SOS calls, and choose whether they can view invoices and payments.',
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <span className="text-[#FF5A1F] text-xs font-extrabold uppercase tracking-widest bg-[#FFEAE2] px-3.5 py-1.5 rounded-full">
          Got Questions?
        </span>
        <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#0B1B3F] uppercase tracking-tight font-bold mt-3">
          {t.faq.title}
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mt-2">
          {t.faq.subtitle}
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'bg-white border-[#1F6BFF]/40 shadow-card'
                  : 'bg-white/80 border-gray-200/80 hover:bg-white hover:border-gray-300'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#0B1B3F]"
              >
                <span>{faq.q}</span>
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                    isOpen
                      ? 'bg-[#FF5A1F] text-white rotate-180'
                      : 'bg-orange-50 text-[#FF5A1F]'
                  }`}
                >
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
