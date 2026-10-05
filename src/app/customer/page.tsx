'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  AlertTriangle,
  Calendar,
  Users,
  CreditCard,
  Star,
  User,
  ShieldCheck,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [bookings, setBookings] = useState<any[]>([]);
  const [familyData, setFamilyData] = useState<any>(null);
  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/bookings').then((r) => r.json()),
      fetch('/api/family').then((r) => r.json()),
      fetch('/api/subscriptions').then((r) => r.json()),
    ])
      .then(([bRes, fRes, sRes]) => {
        if (bRes.bookings) setBookings(bRes.bookings);
        if (fRes.success) setFamilyData(fRes);
        if (sRes.success) setSubData(sRes);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const upcomingBooking = bookings.find(
    (b) => !['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED', 'CANCELLED'].includes(b.status)
  );

  const lastService = bookings.find(
    (b) => ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'].includes(b.status)
  );

  // 8 icon tiles as requested in Section 6
  const tiles = [
    { title: 'Book Service', desc: 'Browse 50+ cooperative trades', href: '/book', icon: Wrench, color: 'chip-icon-blue' },
    { title: 'Emergency (SOS)', desc: '24/7 rapid dispatch in minutes', href: '/emergency', icon: AlertTriangle, color: 'chip-icon-orange' },
    { title: 'My Bookings', desc: 'View live & completed jobs', href: '/customer/bookings', icon: Calendar, color: 'chip-icon-purple' },
    { title: 'Family Hub', desc: `${familyData?.slots?.used || 1}/4 Slots Used`, href: '/family', icon: Users, color: 'chip-icon-green' },
    { title: 'Membership', desc: subData?.hasActiveSubscription ? 'Annual Family Active' : 'Upgrade to 1+3 Plan', href: '/membership', icon: ShieldCheck, color: 'chip-icon-blue' },
    { title: 'Payments & GST', desc: 'Download invoices & receipts', href: '/customer/bookings', icon: CreditCard, color: 'chip-icon-green' },
    { title: 'Ratings & Reviews', desc: 'Support local artisans', href: '/customer/bookings', icon: Star, color: 'chip-icon-orange' },
    { title: 'Customer Profile', desc: 'Address & preferences', href: '/customer/profile', icon: User, color: 'chip-icon-purple' },
  ];

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Greeting & Location Chip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/15 px-3 py-1 rounded-full border border-white/20 font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#FFB41F]" />
                <span>Tambaram Zone, Chennai (600045)</span>
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-2">
              Vanakkam, {user?.name || 'Customer'}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Cooperative household service dashboard • Direct worker-owned platform
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/emergency"
              className="bg-[#FF5A1F] hover:bg-[#e04812] text-white text-xs font-extrabold px-4 py-3 rounded-full shadow-lg flex items-center gap-2 animate-pulse hover:animate-none"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>EMERGENCY SOS</span>
            </Link>
            <Link
              href="/book"
              className="btn-amber text-xs font-bold px-5 py-3 shadow-md"
            >
              <span>+ Book a Service</span>
            </Link>
          </div>
        </div>

        {/* 4 KPI Summary Cards as specified in Section 6 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Upcoming Booking */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Upcoming Booking</span>
              <Calendar className="w-4 h-4 text-[#1F6BFF]" />
            </div>
            {upcomingBooking ? (
              <Link href={`/customer/bookings/${upcomingBooking.id}`} className="block group">
                <h4 className="font-bold text-sm text-[#0B1B3F] group-hover:text-[#1F6BFF] truncate">
                  {upcomingBooking.service.name}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Status: <strong className="text-[#1FA85A]">{upcomingBooking.status}</strong>
                </p>
                <span className="text-[11px] text-[#1F6BFF] font-bold mt-2 inline-flex items-center gap-1">
                  Track Live <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            ) : (
              <div>
                <p className="text-xs text-gray-400">No active bookings</p>
                <Link href="/book" className="text-xs font-bold text-[#1F6BFF] hover:underline mt-2 inline-block">
                  Schedule a service →
                </Link>
              </div>
            )}
          </div>

          {/* Card 2: Membership */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Membership Plan</span>
              <ShieldCheck className="w-4 h-4 text-[#1FA85A]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#0B1B3F]">
                {subData?.hasActiveSubscription ? 'Annual Family (1+3)' : 'Individual Plan'}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {subData?.hasActiveSubscription ? 'Active with Priority Dispatch' : 'Standard pay-as-you-go'}
              </p>
            </div>
            <Link href="/membership" className="text-xs font-bold text-[#1F6BFF] hover:underline mt-2 inline-block">
              {subData?.hasActiveSubscription ? 'Manage membership →' : 'Join family plan (₹1,499) →'}
            </Link>
          </div>

          {/* Card 3: Family Members */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Family Hub</span>
              <Users className="w-4 h-4 text-[#8438FF]" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-2xl font-black text-[#0B1B3F]">
                  {familyData?.slots?.used || 1} / {familyData?.slots?.total || 4}
                </span>
                <span className="text-xs text-gray-500 font-medium">Slots Used</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {familyData?.slots?.remaining || 3} slot(s) available to invite
              </p>
            </div>
            <Link href="/family" className="text-xs font-bold text-[#8438FF] hover:underline mt-2 inline-block">
              Manage family members →
            </Link>
          </div>

          {/* Card 4: Last Service */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Last Completed Service</span>
              <Clock className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            {lastService ? (
              <div>
                <h4 className="font-bold text-sm text-[#0B1B3F] truncate">{lastService.service.name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Artisan: {lastService.worker?.fullName || 'Kumar Selvam'}
                </p>
                <Link href={`/customer/bookings/${lastService.id}`} className="text-xs font-bold text-[#1F6BFF] hover:underline mt-2 inline-block">
                  View invoice & rating →
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400">No past services yet</p>
                <span className="text-[11px] text-gray-400 mt-2 block">Cooperative history ready</span>
              </div>
            )}
          </div>
        </div>

        {/* 8 Big Icon Tiles Grid */}
        <div>
          <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
            Cooperative Services & Management
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tiles.map((t, idx) => {
              const Icon = t.icon;
              return (
                <Link
                  key={idx}
                  href={t.href}
                  className="panel-white p-6 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className={`chip-icon ${t.color} mb-4`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-base text-[#0B1B3F] group-hover:text-[#1F6BFF] transition">
                      {t.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1F6BFF]">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
