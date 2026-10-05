'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  AlertTriangle,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  HeartHandshake,
  GraduationCap,
  HardHat,
  Bell
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [workerData, setWorkerData] = useState<any>(null);
  const [newRequests, setNewRequests] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [statusMode, setStatusMode] = useState<'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'EMERGENCY_ONLY'>('AVAILABLE');
  const [loading, setLoading] = useState(true);

  const fetchProviderData = async () => {
    try {
      const [skillsRes, bookingsRes] = await Promise.all([
        fetch('/api/provider/skills').then((r) => r.json()),
        fetch('/api/bookings').then((r) => r.json()),
      ]);

      if (skillsRes.success && skillsRes.worker) {
        setWorkerData(skillsRes);
        const w = skillsRes.worker;
        if (w.isOffline) setStatusMode('OFFLINE');
        else if (w.isBusy) setStatusMode('BUSY');
        else if (!w.isAvailable && w.isEmergencyAvailable) setStatusMode('EMERGENCY_ONLY');
        else setStatusMode('AVAILABLE');
      }

      if (bookingsRes.bookings) {
        // Pending requested offers
        const reqs = bookingsRes.bookings.filter(
          (b: any) => b.status === 'REQUESTED' && b.offers?.some((o: any) => o.status === 'OFFERED')
        );
        const active = bookingsRes.bookings.filter(
          (b: any) => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'].includes(b.status)
        );
        const completedToday = bookingsRes.bookings.filter(
          (b: any) => ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'].includes(b.status)
        );

        setNewRequests(reqs);
        setActiveJobs(active);

        const earned = completedToday.reduce((acc: number, b: any) => acc + (b.workerEarnings || 0), 0);
        setTodayEarnings(earned);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
    const interval = setInterval(fetchProviderData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (mode: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | 'EMERGENCY_ONLY') => {
    try {
      const res = await fetch('/api/provider/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusMode: mode }),
      });
      if (res.ok) {
        setStatusMode(mode);
        success('Status Updated', `Availability switched to ${mode.replace(/_/g, ' ')}`);
        fetchProviderData();
      }
    } catch {
      error('Error', 'Failed to update status');
    }
  };

  const level = workerData?.levelInfo?.level || user?.worker?.currentLevel || 1;
  const levelTitle = workerData?.levelInfo?.levelTitle || 'Artisan';

  // 10 big icon tiles as specified in Section 8
  const tiles = [
    { title: 'Job Requests', count: newRequests.length, desc: 'Review & accept local calls', href: '/provider/jobs', icon: Bell, color: 'chip-icon-orange' },
    { title: 'Active Jobs', count: activeJobs.length, desc: 'Live job lifecycle & progress', href: '/provider/jobs?tab=active', icon: Wrench, color: 'chip-icon-blue' },
    { title: 'Earnings & Pay', count: `₹${todayEarnings}`, desc: 'Breakdown of net cooperative pay', href: '/provider/earnings', icon: Coins, color: 'chip-icon-green' },
    { title: 'Availability', count: '6 Days/Wk', desc: 'Schedule working hours', href: '/provider/availability', icon: Clock, color: 'chip-icon-purple' },
    { title: 'Skills & Upgrade', count: `Level ${level}`, desc: 'Add trades & upgrade rank', href: '/provider/skills', icon: Sparkles, color: 'chip-icon-blue' },
    { title: 'Training & NSDC', count: '4 Courses', desc: 'State technical modules', href: '/provider/training', icon: GraduationCap, color: 'chip-icon-purple' },
    { title: 'Welfare & Mutual Aid', count: 'Active', desc: 'Health coverage & insurance claims', href: '/provider/welfare', icon: HeartHandshake, color: 'chip-icon-green' },
    { title: 'Annual Membership', count: '₹499/Yr', desc: 'Cooperative society standing', href: '/provider/membership', icon: ShieldCheck, color: 'chip-icon-blue' },
  ];

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Greeting & Status Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-white gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                Level {level} {levelTitle}
              </span>
              <span className="text-xs text-blue-200">
                Society: Tambaram Artisans (TNL-FED-01)
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-2">
              Vanakkam, {user?.name || 'Worker'}!
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Service Provider Dispatch Portal • 100% Worker Owned
            </p>
          </div>

          {/* Big Status Switch (Available / Busy / Offline / Emergency Available) */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex flex-wrap items-center gap-1.5 shadow-xl">
            {(['AVAILABLE', 'BUSY', 'OFFLINE', 'EMERGENCY_ONLY'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => handleStatusChange(mode)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  statusMode === mode
                    ? mode === 'AVAILABLE'
                      ? 'bg-[#1FA85A] text-white shadow-md'
                      : mode === 'BUSY'
                      ? 'bg-[#F5A524] text-white shadow-md'
                      : mode === 'EMERGENCY_ONLY'
                      ? 'bg-[#FF5A1F] text-white shadow-md'
                      : 'bg-gray-700 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${
                  mode === 'AVAILABLE' ? 'bg-green-300' : mode === 'BUSY' ? 'bg-amber-300' : mode === 'EMERGENCY_ONLY' ? 'bg-orange-300' : 'bg-gray-400'
                }`} />
                <span>{mode === 'EMERGENCY_ONLY' ? 'Emergency Only' : mode.charAt(0) + mode.slice(1).toLowerCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Highlighted New Request Banner if any */}
        {newRequests.length > 0 && (
          <div className="bg-gradient-to-r from-[#FF5A1F] to-[#FF7A3D] text-white p-5 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {newRequests.length} New Job Request Available!
                </h3>
                <p className="text-xs text-white/90">
                  {newRequests[0].service.name} requested in {newRequests[0].approximateArea}. Estimated earnings: ₹{newRequests[0].workerEarnings}.
                </p>
              </div>
            </div>
            <Link
              href={`/provider/requests/${newRequests[0].id}`}
              className="bg-white text-[#FF5A1F] hover:bg-orange-50 font-black text-xs px-4 py-2.5 rounded-full shadow-md transition shrink-0 flex items-center gap-1.5"
            >
              <span>View & Accept</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* 4 Cards as specified in Section 8 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: New Requests */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>New Requests</span>
              <Bell className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#0B1B3F]">
                {newRequests.length}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Pending offers waiting</p>
            </div>
            <Link href="/provider/jobs" className="text-xs font-bold text-[#FF5A1F] hover:underline mt-2 inline-block">
              Open requests list →
            </Link>
          </div>

          {/* Card 2: Today's Jobs */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Today's Jobs</span>
              <Wrench className="w-4 h-4 text-[#1F6BFF]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#0B1B3F]">
                {activeJobs.length} Active
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Ongoing service calls</p>
            </div>
            <Link href="/provider/jobs?tab=active" className="text-xs font-bold text-[#1F6BFF] hover:underline mt-2 inline-block">
              View active jobs →
            </Link>
          </div>

          {/* Card 3: Today's Earnings */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Today's Net Earnings</span>
              <Coins className="w-4 h-4 text-[#1FA85A]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#1FA85A]">
                ₹{todayEarnings}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Net direct artisan payout</p>
            </div>
            <Link href="/provider/earnings" className="text-xs font-bold text-[#1FA85A] hover:underline mt-2 inline-block">
              Detailed earnings report →
            </Link>
          </div>

          {/* Card 4: Profile Level */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Artisan Rank & Level</span>
              <Sparkles className="w-4 h-4 text-[#8438FF]" />
            </div>
            <div>
              <span className="font-display text-2xl font-black text-[#0B1B3F]">
                Level {level}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">{levelTitle} (95% complete)</p>
            </div>
            <Link href="/provider/skills" className="text-xs font-bold text-[#8438FF] hover:underline mt-2 inline-block">
              Upgrade Profile →
            </Link>
          </div>
        </div>

        {/* Tiles Grid */}
        <div>
          <h3 className="font-display text-2xl font-bold uppercase text-white mb-4">
            Artisan Dispatch Management
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
                    <div className="flex items-center justify-between mb-4">
                      <div className={`chip-icon ${t.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {t.count}
                      </span>
                    </div>
                    <h4 className="font-bold text-base text-[#0B1B3F] group-hover:text-[#1F6BFF] transition">
                      {t.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1F6BFF]">
                    <span>Manage</span>
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
