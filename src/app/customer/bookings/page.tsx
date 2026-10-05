'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Star, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';

export default function CustomerBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((res) => res.json())
      .then((data) => {
        if (data.bookings) setBookings(data.bookings);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'ACTIVE') {
      return !['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED', 'CANCELLED'].includes(b.status);
    }
    if (activeTab === 'COMPLETED') {
      return ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'].includes(b.status);
    }
    return true;
  });

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Job History & Tracking
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-1">
              My Household Bookings
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Live status updates, artisan tracking, invoices and ratings
            </p>
          </div>

          <Link href="/book" className="btn-amber text-xs font-bold px-5 py-2.5 shadow-md">
            + Schedule New Service
          </Link>
        </div>

        {/* White Panel Container */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-full mb-6 max-w-sm">
            {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-full text-xs font-bold transition ${
                  activeTab === tab
                    ? 'bg-white text-[#0B1B3F] shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'ALL' ? 'All Bookings' : tab === 'ACTIVE' ? 'Active Dispatch' : 'Completed'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
              <h4 className="font-bold text-gray-700 text-sm">No bookings in this category</h4>
              <p className="text-xs text-gray-500">Need plumbing, cleaning, or electrical help?</p>
              <Link href="/book" className="btn-amber text-xs font-bold px-5 py-2 mt-2 inline-flex">
                Book a Service
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border border-gray-200 hover:border-[#1F6BFF]/40 shadow-xs hover:shadow-card transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B1B3F]">{b.service.name}</span>
                      <span className="text-xs text-gray-400 font-mono">#{b.bookingNumber}</span>
                      {b.isEmergency && (
                        <span className="bg-[#FF5A1F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                          SOS
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Scheduled: {b.scheduledDate} at {b.scheduledTime} • Artisan: {b.worker?.fullName || 'Assigned Society Artisan'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate max-w-lg">
                      {b.customerAddress}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                    <span className="bg-blue-50 text-[#1F6BFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {b.status.replace(/_/g, ' ')}
                    </span>
                    <span className="font-display text-base font-bold text-[#0B1B3F]">
                      ₹{b.totalAmount}
                    </span>
                    <Link
                      href={`/customer/bookings/${b.id}`}
                      className="text-xs font-bold text-[#1F6BFF] hover:underline flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
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
