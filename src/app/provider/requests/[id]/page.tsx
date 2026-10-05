'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Star,
  Coins,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function RequestDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Countdown timer (2 min for emergency, 10 min for normal)
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  // Reject modal (2 steps)
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectStep, setRejectStep] = useState(1);
  const [rejectionReason, setRejectionReason] = useState('Too far from current location');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetch(`/api/bookings/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.booking) {
          setBooking(data.booking);
          // Calculate seconds remaining
          const offer = data.booking.offers?.find((o: any) => o.workerId === user?.worker?.id && o.status === 'OFFERED');
          if (offer && offer.expiresAt) {
            const diff = Math.max(0, Math.floor((new Date(offer.expiresAt).getTime() - Date.now()) / 1000));
            setSecondsRemaining(diff > 0 ? diff : 120);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [params.id, user]);

  // Countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Accept
  const handleAcceptJob = async () => {
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/bookings/${booking.id}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.jobTaken) {
          warning('Job Taken', 'This job has already been accepted by another cooperative worker.');
          router.push('/provider/jobs');
        } else {
          error('Error', data.error || 'Failed to accept job');
        }
        return;
      }

      success('Job Accepted! 🚀', 'Customer address unlocked. Proceeding to Active Job.');
      router.push(`/provider/jobs/${booking.id}`);
    } catch {
      error('Network Error', 'Failed to communicate with dispatch server');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject
  const handleConfirmReject = async () => {
    const finalReason = rejectionReason === 'Other' ? customReason : rejectionReason;
    try {
      setIsProcessing(true);
      const res = await fetch(`/api/bookings/${booking.id}/offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REJECT',
          rejectionReason: finalReason || 'Declined by worker',
        }),
      });

      if (res.ok) {
        success('Request Declined', 'Offer passed to the next ranked cooperative artisan.');
        router.push('/provider/jobs');
      } else {
        error('Error', 'Failed to decline request');
      }
    } catch {
      error('Network Error', 'Failed to reach dispatch server');
    } finally {
      setIsProcessing(false);
      setShowRejectModal(false);
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
          <h2 className="font-display text-2xl font-bold uppercase">Request Not Found</h2>
          <Link href="/provider/jobs" className="btn-amber text-xs font-bold px-6 py-2.5 mt-4 inline-block">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  // Customer first name only for privacy until accepted as specified in Section 8
  const customerFirstName = booking.customer.fullName.split(' ')[0];

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Countdown Banner */}
        <div className="bg-[#FFB41F] text-[#0B1B3F] p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-[#0B1B3F] animate-spin" />
            <span className="font-bold text-xs uppercase tracking-wider">
              {booking.isEmergency ? '🚨 Emergency SOS Broadcast Window' : 'Dispatch Offer Window'}
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono font-black text-lg">
            <span>{Math.floor(secondsRemaining / 60)}:{('0' + (secondsRemaining % 60)).slice(-2)}</span>
            <span className="text-[11px] font-sans font-normal ml-1">remaining</span>
          </div>
        </div>

        {/* Single Screen Request Detail Panel */}
        <div className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-6">
          <div className="flex items-start justify-between pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs bg-blue-100 text-[#1F6BFF] px-2.5 py-0.5 rounded-full uppercase">
                  #{booking.bookingNumber}
                </span>
                {booking.isEmergency && (
                  <span className="bg-[#FF5A1F] text-white text-xs font-black px-2 py-0.5 rounded-full uppercase">
                    SOS Priority
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold uppercase text-[#0B1B3F] mt-1.5">
                {booking.service.name}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Target Slot: {booking.scheduledDate} ({booking.scheduledTime})
              </p>
            </div>

            {/* Net Earnings Highlight */}
            <div className="text-right">
              <span className="text-[11px] text-gray-400 block font-semibold uppercase">
                Estimated Net Pay
              </span>
              <span className="font-display text-3xl font-black text-[#1FA85A]">
                ₹{booking.workerEarnings}
              </span>
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-1">
              Issue / Client Request Description:
            </h4>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              "{booking.issueDescription}"
            </p>
          </div>

          {/* Customer First Name + Rating */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-base text-[#1F6BFF]">
                👤
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B1B3F]">{customerFirstName} (Verified Household)</p>
                <div className="flex items-center gap-1 text-amber-500 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9 Rating
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-gray-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-base text-[#FF5A1F]">
                📍
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B1B3F]">{booking.approximateArea}</p>
                <p className="text-[11px] text-gray-500">Approx ~2.1 km (12 mins away)</p>
              </div>
            </div>
          </div>

          {/* Approximate Map Visual (Exact address locked) */}
          <div className="h-44 bg-slate-100 rounded-2xl border border-gray-200 relative overflow-hidden flex flex-col items-center justify-center text-center p-4">
            <div className="w-10 h-10 rounded-full bg-[#1F6BFF] text-white flex items-center justify-center shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-gray-700 mt-2">
              Approximate Location: {booking.approximateArea}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              🔒 Exact street address & customer phone will be unlocked upon accepting this job.
            </p>
          </div>

          {/* Transparent Price Breakdown */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
              Cooperative Transparent Price Breakdown
            </h4>
            <div className="flex justify-between text-gray-600">
              <span>Customer Total Charge</span>
              <span>₹{booking.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Platform Tech Fee (5%)</span>
              <span>-₹{booking.platformFee}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Society Mutual Aid Fund (5%)</span>
              <span>-₹{booking.cooperativeShare}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[#0B1B3F]">
              <span>Your Direct Net Payout</span>
              <span className="text-[#1FA85A]">₹{booking.workerEarnings}</span>
            </div>
          </div>

          {/* Two Large Action Buttons: ACCEPT (Green) and REJECT (Red) as specified in Section 8 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              onClick={handleAcceptJob}
              disabled={isProcessing}
              className="bg-[#1FA85A] hover:bg-[#198f4c] text-white font-bold text-base py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isProcessing ? 'Accepting...' : 'ACCEPT JOB (Green)'}</span>
            </button>

            <button
              onClick={() => {
                setRejectStep(1);
                setShowRejectModal(true);
              }}
              disabled={isProcessing}
              className="bg-[#E5383B] hover:bg-[#c92a2d] text-white font-bold text-base py-4 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              <XCircle className="w-5 h-5" />
              <span>REJECT (Red)</span>
            </button>
          </div>
        </div>

        {/* 2-Step Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-panel p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                  {rejectStep === 1 ? 'Reason for Declining' : 'Confirm Job Rejection'}
                </h3>
                <span className="text-xs font-bold text-gray-400">Step {rejectStep} of 2</span>
              </div>

              {rejectStep === 1 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    Select a reason. Rejections are logged for admin demand analysis and NEVER result in automatic worker suspension.
                  </p>
                  <div className="space-y-2">
                    {[
                      'Too far from current location',
                      'Not available at requested time',
                      'Skill mismatch for this specific job',
                      'Personal / Emergency reason',
                      'Other',
                    ].map((reasonOption) => (
                      <label
                        key={reasonOption}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                          rejectionReason === reasonOption
                            ? 'border-[#E5383B] bg-red-50 text-[#E5383B]'
                            : 'border-gray-200 bg-white text-gray-700'
                        }`}
                      >
                        <span>{reasonOption}</span>
                        <input
                          type="radio"
                          name="rejectionReason"
                          value={reasonOption}
                          checked={rejectionReason === reasonOption}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="text-[#E5383B] focus:ring-[#E5383B]"
                        />
                      </label>
                    ))}
                  </div>

                  {rejectionReason === 'Other' && (
                    <input
                      type="text"
                      placeholder="Please specify reason"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#E5383B]"
                    />
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectModal(false)}
                      className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectStep(2)}
                      className="flex-1 py-2.5 rounded-full bg-[#E5383B] text-white font-bold text-xs"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {rejectStep === 2 && (
                <div className="space-y-4 text-xs">
                  <p className="text-gray-600">
                    Are you sure you want to decline this request? Our matching algorithm will immediately re-run and pass this job to the next-ranked artisan in the society.
                  </p>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <strong>Logged Reason:</strong> {rejectionReason === 'Other' ? customReason : rejectionReason}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRejectStep(1)}
                      className="flex-1 py-2.5 rounded-full bg-gray-100 text-gray-700 font-bold text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      disabled={isProcessing}
                      className="flex-1 py-2.5 rounded-full bg-[#E5383B] text-white font-bold text-xs"
                    >
                      {isProcessing ? 'Handing Over...' : 'Confirm Decline & Pass Job'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
