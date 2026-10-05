'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Coins,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Check,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function ActiveJobLifecyclePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('Replaced damaged gasket and tightened main intake valve.');
  const [updating, setUpdating] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  // Handle stage transition
  const handleTransition = async (nextStatus: string, note?: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          note: note || `Worker updated status to ${nextStatus}`,
        }),
      });

      if (res.ok) {
        success('Status Updated', `Job marked as ${nextStatus.replace(/_/g, ' ')}`);
        await fetchJob();
      } else {
        error('Error', 'Failed to update stage');
      }
    } catch {
      error('Network Error', 'Failed to reach server');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="shell-gradient min-h-[calc(100vh-80px)] py-16 flex items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#FFB41F] rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="shell-gradient min-h-[calc(100vh-80px)] py-16 flex items-center justify-center text-white">
        <div className="panel-white p-8 max-w-md text-center text-[#0B1B3F]">
          <h2 className="font-display text-2xl font-bold uppercase">Job Not Found</h2>
          <Link href="/provider/jobs" className="btn-amber text-xs font-bold px-6 py-2.5 mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const status = booking.status;

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                Active Cooperative Mission
              </span>
              <span className="text-xs text-blue-200">ID: #{booking.bookingNumber}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-1">
              {booking.service.name}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Client: {booking.customer.fullName} • Net Payout: ₹{booking.workerEarnings}
            </p>
          </div>

          <Link
            href="/provider/jobs"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Jobs List
          </Link>
        </div>

        {/* Unlocked Customer & Premises Card */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
          <div className="p-4 bg-green-50 rounded-2xl border border-green-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#1FA85A] text-white flex items-center justify-center font-bold text-xl">
                📍
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-800 bg-green-200/60 px-2 py-0.5 rounded">
                  Exact Address Unlocked
                </span>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mt-1">
                  {booking.customerAddress}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-2 mt-0.5">
                  <span>Customer: {booking.customer.fullName}</span>
                  <span>•</span>
                  <a href={`tel:${booking.customer.user?.mobile || '9876543210'}`} className="text-[#1F6BFF] font-bold flex items-center gap-1 hover:underline">
                    <Phone className="w-3.5 h-3.5" /> Call Client
                  </a>
                </p>
              </div>
            </div>

            <a
              href={`https://maps.google.com/?q=${booking.customerLat},${booking.customerLng}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#1F6BFF] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-full flex items-center gap-1.5 shadow-sm transition shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>Open in Maps</span>
            </a>
          </div>

          {/* SINGLE BUTTON ACTION LIFECYCLE (One button at a time) as required by Section 8 */}
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>Current Stage: {status.replace(/_/g, ' ')}</span>
              <span className="text-[#1F6BFF]">Step-By-Step Progression</span>
            </div>

            {/* STAGE 1: ACCEPTED -> Action: "On the way" */}
            {status === 'ACCEPTED' && (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-gray-600">
                  Tap below when you start travelling to the customer's premises. The customer will receive an immediate notification that you are on the way.
                </p>
                <button
                  onClick={() => handleTransition('ON_THE_WAY', 'Worker has started journey towards premises')}
                  disabled={updating}
                  className="btn-amber w-full justify-center text-sm font-bold shadow-lg hover:scale-[1.01] transition py-4"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{updating ? 'Updating...' : 'I Am On The Way →'}</span>
                </button>
              </div>
            )}

            {/* STAGE 2: ON_THE_WAY -> Action: "Arrived" */}
            {status === 'ON_THE_WAY' && (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-gray-600">
                  You are en route. Once you reach the customer's door, tap below to announce your arrival.
                </p>
                <button
                  onClick={() => handleTransition('ARRIVED', 'Worker arrived at premises door')}
                  disabled={updating}
                  className="btn-amber w-full justify-center text-sm font-bold shadow-lg hover:scale-[1.01] transition py-4"
                >
                  <MapPin className="w-5 h-5" />
                  <span>{updating ? 'Updating...' : 'I Have Arrived at Location →'}</span>
                </button>
              </div>
            )}

            {/* STAGE 3: ARRIVED -> Action: "Start service" */}
            {status === 'ARRIVED' && (
              <div className="text-center py-4 space-y-4">
                <p className="text-xs text-gray-600">
                  After initial inspection and greeting the client, tap below to begin the clock and service work.
                </p>
                <button
                  onClick={() => handleTransition('SERVICE_STARTED', 'Service work commenced by worker')}
                  disabled={updating}
                  className="btn-amber w-full justify-center text-sm font-bold shadow-lg hover:scale-[1.01] transition py-4"
                >
                  <Wrench className="w-5 h-5" />
                  <span>{updating ? 'Updating...' : 'Start Service Work →'}</span>
                </button>
              </div>
            )}

            {/* STAGE 4: SERVICE_STARTED -> Action: "Complete (notes/photo)" */}
            {status === 'SERVICE_STARTED' && (
              <div className="space-y-4">
                <p className="text-xs text-gray-600">
                  Work in progress. Once the job is completed, record job completion notes and submit for customer verification.
                </p>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Completion Notes / Parts Replaced
                  </label>
                  <textarea
                    rows={3}
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                  />
                </div>
                <button
                  onClick={() => handleTransition('COMPLETED', completionNotes)}
                  disabled={updating}
                  className="bg-[#1FA85A] hover:bg-green-700 text-white font-bold text-sm w-full py-4 rounded-full shadow-lg hover:scale-[1.01] transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{updating ? 'Submitting...' : 'Mark Job Completed →'}</span>
                </button>
              </div>
            )}

            {/* STAGE 5: COMPLETED -> Waiting for customer confirmation */}
            {status === 'COMPLETED' && (
              <div className="text-center py-6 space-y-3 bg-white rounded-xl p-4 border border-gray-200">
                <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                <h4 className="font-bold text-sm text-[#0B1B3F]">Waiting for Customer Confirmation</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  The client has been notified to inspect your work and confirm completion on their device.
                </p>
              </div>
            )}

            {/* STAGE 6: CUSTOMER_CONFIRMED -> Waiting for payment */}
            {status === 'CUSTOMER_CONFIRMED' && (
              <div className="text-center py-6 space-y-3 bg-white rounded-xl p-4 border border-gray-200">
                <Coins className="w-8 h-8 text-[#1FA85A] animate-bounce mx-auto" />
                <h4 className="font-bold text-sm text-[#0B1B3F]">Customer Confirmed! Processing Payment</h4>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Client has confirmed satisfactory completion. Awaiting demo digital settlement.
                </p>
              </div>
            )}

            {/* STAGE 7: PAYMENT_COMPLETED or RATED -> "Earnings added" with breakdown as specified in Section 8 */}
            {(status === 'PAYMENT_COMPLETED' || status === 'RATED') && (
              <div className="bg-white rounded-2xl p-6 border-2 border-green-300 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-100 text-[#1FA85A] flex items-center justify-center font-bold text-2xl">
                    🎉
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0B1B3F]">
                      Earnings Added to Cooperative Account!
                    </h4>
                    <p className="text-xs text-gray-500">
                      Payment received in full. Your cooperative ledger has been credited.
                    </p>
                  </div>
                </div>

                {/* Earnings Breakdown */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs border border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Customer Service Charge</span>
                    <span>₹{booking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Platform Operational Fee (5%)</span>
                    <span>-₹{booking.platformFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Society Mutual Aid & Welfare Contribution (5%)</span>
                    <span>-₹{booking.cooperativeShare}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[#0B1B3F]">
                    <span>Net Direct Artisan Payout (Credited)</span>
                    <span className="font-display text-lg text-[#1FA85A]">₹{booking.workerEarnings}</span>
                  </div>
                </div>

                {booking.rating && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#0B1B3F]">
                      <span>Customer Review ({booking.rating.averageScore}★)</span>
                      <span className="text-amber-500">⭐️⭐️⭐️⭐️⭐️</span>
                    </div>
                    {booking.rating.comment && (
                      <p className="text-gray-600 italic">"{booking.rating.comment}"</p>
                    )}
                  </div>
                )}

                <Link
                  href="/provider/earnings"
                  className="btn-amber w-full justify-center text-xs font-bold py-3 mt-2 block text-center"
                >
                  View Earnings Ledger & Payouts →
                </Link>
              </div>
            )}
          </div>

          {/* Job Details & Notes */}
          <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div>
              <strong className="text-[#0B1B3F] block">Service:</strong>
              <span>{booking.service.name}</span>
            </div>
            <div>
              <strong className="text-[#0B1B3F] block">Scheduled:</strong>
              <span>{booking.scheduledDate} ({booking.scheduledTime})</span>
            </div>
            <div className="col-span-2">
              <strong className="text-[#0B1B3F] block">Original Issue:</strong>
              <p className="mt-0.5">{booking.issueDescription}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
