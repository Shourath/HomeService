'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Bell,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  MapPin,
  Coins
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';

function ProviderJobsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') || 'new').toUpperCase();

  const [activeTab, setActiveTab] = useState<'NEW' | 'ACTIVE' | 'COMPLETED' | 'REJECTED'>(
    initialTab === 'ACTIVE' ? 'ACTIVE' : initialTab === 'COMPLETED' ? 'COMPLETED' : 'NEW'
  );

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const newOffers = bookings.filter((b) => b.status === 'REQUESTED');
  const activeJobs = bookings.filter((b) =>
    ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'SERVICE_STARTED'].includes(b.status)
  );
  const completedJobs = bookings.filter((b) =>
    ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'].includes(b.status)
  );
  const rejectedExpired = bookings.filter((b) =>
    ['CANCELLED', 'EXPIRED'].includes(b.status) || b.offers?.some((o: any) => o.status === 'REJECTED')
  );

  const displayedList =
    activeTab === 'NEW'
      ? newOffers
      : activeTab === 'ACTIVE'
      ? activeJobs
      : activeTab === 'COMPLETED'
      ? completedJobs
      : rejectedExpired;

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Artisan Mission Queue
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-1">
              Dispatched Service Jobs
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Review incoming requests, manage active jobs, and verify completed payments
            </p>
          </div>

          <Link
            href="/provider"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* White Panel Container */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
          {/* Tabs: New | Active | Completed | Rejected/Expired */}
          <div className="flex flex-wrap bg-gray-100 p-1 rounded-2xl mb-6 max-w-lg gap-1">
            <button
              onClick={() => setActiveTab('NEW')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'NEW'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>New Requests</span>
              {newOffers.length > 0 && (
                <span className="bg-[#FF5A1F] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {newOffers.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('ACTIVE')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'ACTIVE'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Active ({activeJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'COMPLETED'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Completed ({completedJobs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('REJECTED')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'REJECTED'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span>Rejected/Expired</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading jobs...</div>
          ) : displayedList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Clock className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="font-bold text-gray-700 text-sm">No jobs in this category</h4>
              <p className="text-xs text-gray-500">
                Ensure your status is switched to <strong>Available</strong> to receive incoming local dispatches.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedList.map((job) => (
                <div
                  key={job.id}
                  className="p-5 rounded-2xl border border-gray-200 hover:border-[#1F6BFF]/40 shadow-xs hover:shadow-card transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B1B3F]">{job.service.name}</span>
                      <span className="text-xs text-gray-400 font-mono">#{job.bookingNumber}</span>
                      {job.isEmergency && (
                        <span className="bg-[#FF5A1F] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          SOS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Area: {job.approximateArea} • Scheduled: {job.scheduledDate} ({job.scheduledTime})
                    </p>
                    <p className="text-[11px] text-gray-600 italic truncate max-w-lg">
                      "{job.issueDescription}"
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="font-display text-lg font-black text-[#1FA85A]">
                      Net: ₹{job.workerEarnings}
                    </span>
                    {job.status === 'REQUESTED' ? (
                      <Link
                        href={`/provider/requests/${job.id}`}
                        className="btn-amber text-xs font-bold px-4 py-2 shadow-sm"
                      >
                        Accept / Decline →
                      </Link>
                    ) : (
                      <Link
                        href={`/provider/jobs/${job.id}`}
                        className="bg-blue-50 text-[#1F6BFF] hover:bg-blue-100 text-xs font-bold px-4 py-2 rounded-full transition flex items-center gap-1"
                      >
                        <span>Open Stage ({job.status})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProviderJobsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 font-medium">Loading jobs...</div>}>
      <ProviderJobsContent />
    </React.Suspense>
  );
}
