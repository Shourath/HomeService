'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Heart, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0B1B3F] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top persistent entry buttons banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-8 rounded-panel border border-white/10 shadow-2xl mb-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-wider">
              {t.hero.badge}
            </span>
            <h3 className="font-display text-2xl sm:text-3xl text-white mt-1">
              Join Tamil Nadu's Worker-Owned Movement
            </h3>
            <p className="text-blue-200 text-xs sm:text-sm mt-1 max-w-xl">
              Whether you need guaranteed home repair or you are an artisan seeking dignity, fair pay, and cooperative ownership.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <Link
              href="/customer"
              className="btn-amber text-sm font-bold shadow-md hover:scale-105 transition"
            >
              <span>{t.nav.need_service}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/provider"
              className="btn-secondary text-sm font-semibold border-white/30 hover:bg-white/20 transition"
            >
              <span>{t.nav.am_provider}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10 text-sm">
          {/* Col 1: Brand & Cooperative Federation info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#FFB41F]" />
              <span className="font-display text-xl tracking-wider font-bold text-white">
                HOME<span className="text-[#FFB41F]">Service</span>
              </span>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed">
              Empowering local tradespeople through worker-owned cooperatives. Transparent pricing, mutual welfare, zero corporate exploitation.
            </p>
            <div className="text-xs text-blue-300 space-y-1.5 pt-2">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFB41F]" />
                Gandhi Irwin Road, Egmore, Chennai 600008
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FFB41F]" />
                1800-425-WORK (9 AM - 7 PM)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FFB41F]" />
                desk@homeservice.coop
              </p>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
              Service Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li><Link href="/services?category=home-repair" className="hover:text-white transition">Home & Repair (Plumbing, Electrical)</Link></li>
              <li><Link href="/services?category=cleaning-maintenance" className="hover:text-white transition">Deep Cleaning & Sanitization</Link></li>
              <li><Link href="/services?category=care-assistance" className="hover:text-white transition">Elderly & Patient Care</Link></li>
              <li><Link href="/services?category=transport-outdoor" className="hover:text-white transition">Transport, Moving & Drivers</Link></li>
              <li><Link href="/services?category=technical-professional" className="hover:text-white transition">AC, Appliances & Technical</Link></li>
              <li><Link href="/emergency" className="text-[#FF5A1F] font-bold hover:underline">24/7 Rapid Emergency (SOS)</Link></li>
            </ul>
          </div>

          {/* Col 3: Cooperative Model */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
              Cooperative Model
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li><Link href="/membership" className="hover:text-white transition">Annual Family Membership (1+3)</Link></li>
              <li><Link href="/family" className="hover:text-white transition">Family Management Hub</Link></li>
              <li><Link href="/provider/register" className="hover:text-white transition">Register as a Tradesperson</Link></li>
              <li><Link href="/provider/welfare" className="hover:text-white transition">Mutual Aid & Welfare Schemes</Link></li>
              <li><Link href="/verify" className="hover:text-white transition">Worker Verification Standards</Link></li>
            </ul>
          </div>

          {/* Col 4: Portals & Discreet Admin Link */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-4">
              Portals & Governance
            </h4>
            <ul className="space-y-2.5 text-xs text-blue-200">
              <li><Link href="/customer" className="hover:text-white transition">Household Customer Portal</Link></li>
              <li><Link href="/provider" className="hover:text-white transition">Worker Dispatch Portal</Link></li>
              <li>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold text-xs border border-amber-400/30 px-2.5 py-1 rounded-full mt-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.nav.admin_login}</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-blue-300/80 gap-4">
          <p>© {new Date().getFullYear()} HOMEService Labour Cooperative Federation Ltd. All rights reserved.</p>
          <p className="flex items-center gap-1 text-blue-300/60">
            <span>Verified Cooperative Prototype</span> • <span>Demo & Sandbox Mode</span>
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Cooperative By-Laws</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
