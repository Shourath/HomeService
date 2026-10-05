'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Coins, TrendingUp, Calendar, Download, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';

export default function ProviderEarningsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [period, setPeriod] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'ALL'>('ALL');
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

  const completedJobs = bookings.filter((b) =>
    ['COMPLETED', 'CUSTOMER_CONFIRMED', 'PAYMENT_COMPLETED', 'RATED'].includes(b.status)
  );

  const grossEarnings = completedJobs.reduce((acc, b) => acc + b.totalAmount, 0);
  const platformFees = completedJobs.reduce((acc, b) => acc + b.platformFee, 0);
  const coopShares = completedJobs.reduce((acc, b) => acc + b.cooperativeShare, 0);
  const netEarnings = grossEarnings - platformFees - coopShares;

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Transparent Cooperative Ledger
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Artisan Earnings & Payouts
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              100% transparent fee structure • 90%+ direct take-home pay
            </p>
          </div>

          <Link
            href="/provider"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Financial Summary Breakdown Card as specified in Section 8: Gross - Platform - Coop = Net */}
        <div className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Disbursement Overview
              </span>
              <h2 className="font-display text-3xl font-bold uppercase text-[#0B1B3F]">
                Net Direct Pay: ₹{netEarnings}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Credited to your verified cooperative bank account
              </p>
            </div>

            {/* Period Picker */}
            <div className="flex bg-gray-100 p-1 rounded-full text-xs font-bold">
              {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-full transition ${
                    period === p ? 'bg-white text-[#0B1B3F] shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Formula calculation card */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <span className="text-xs text-gray-500 font-semibold block">Gross Service Value</span>
              <span className="font-display text-2xl font-black text-[#0B1B3F] mt-1 block">
                ₹{grossEarnings}
              </span>
            </div>

            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100">
              <span className="text-xs text-red-700 font-semibold block">Platform Tech (5%)</span>
              <span className="font-display text-2xl font-black text-[#E5383B] mt-1 block">
                -₹{platformFees}
              </span>
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100">
              <span className="text-xs text-purple-700 font-semibold block">Society Mutual Aid (5%)</span>
              <span className="font-display text-2xl font-black text-[#8438FF] mt-1 block">
                -₹{coopShares}
              </span>
            </div>

            <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
              <span className="text-xs text-green-800 font-semibold block">Net Payout to You</span>
              <span className="font-display text-2xl font-black text-[#1FA85A] mt-1 block">
                ₹{netEarnings}
              </span>
            </div>
          </div>

          {/* Completed Jobs History */}
          <div className="pt-6 border-t border-gray-100">
            <h4 className="font-bold text-sm text-[#0B1B3F] uppercase tracking-wider mb-4">
              Payout Transactions ({completedJobs.length})
            </h4>

            {completedJobs.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No completed job payouts yet.</p>
            ) : (
              <div className="space-y-3">
                {completedJobs.map((j) => (
                  <div
                    key={j.id}
                    className="p-4 rounded-xl border border-gray-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0B1B3F]">{j.service.name}</span>
                        <span className="text-gray-400 font-mono">#{j.bookingNumber}</span>
                      </div>
                      <p className="text-gray-500 mt-0.5">
                        Client: {j.customer.fullName} • Completed on {j.scheduledDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-base font-bold text-[#1FA85A] block">
                        +₹{j.workerEarnings}
                      </span>
                      <span className="text-[10px] text-gray-400">Direct Payout</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
