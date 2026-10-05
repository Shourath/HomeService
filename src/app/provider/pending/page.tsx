'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldCheck, CheckCircle2, ArrowRight, Sparkles, Building2, Phone } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function ProviderPendingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();
  const [approving, setApproving] = useState(false);

  // Fast-track demo approval
  const handleFastTrackApproval = async () => {
    if (!user?.worker?.id) {
      error('Error', 'Worker ID not found');
      return;
    }

    try {
      setApproving(true);
      const res = await fetch('/api/admin/workers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: user.worker.id,
          action: 'VERIFY',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error('Approval Error', data.error || 'Failed to verify worker');
        return;
      }

      success('Worker Verified! 🎖️', 'Cooperative desk has approved your KYC and activated your account.');
      await refreshUser();
      router.push('/provider');
    } catch {
      error('Network Error', 'Failed to reach server');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="panel-white p-8 sm:p-10 border border-gray-100 shadow-2xl text-center">
          {/* Animated Clock / Status Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-100 text-[#FF5A1F] flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <span className="bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full">
            Status: Pending Verification
          </span>

          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#0B1B3F] tracking-tight mt-3">
            Application Under Society Review
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Thank you for registering with the <strong>Tambaram Labour & Artisans Cooperative Society</strong>. Your ID document and trade credentials have been queued for council verification.
          </p>

          {/* Verification Checklist */}
          <div className="bg-gray-50 rounded-2xl p-4 my-6 text-left space-y-3 border border-gray-200 text-xs">
            <div className="flex items-center gap-2.5 text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-[#1FA85A]" />
              <span>Mobile OTP verification completed</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-700">
              <CheckCircle2 className="w-4 h-4 text-[#1FA85A]" />
              <span>Profile details & primary trade submitted</span>
            </div>
            <div className="flex items-center gap-2.5 text-amber-600 font-semibold">
              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Cooperative Council KYC verification (In Progress)</span>
            </div>
            <div className="flex items-center gap-2.5 text-gray-400">
              <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px]">4</span>
              <span>Annual Worker Membership & Dispatch Activation</span>
            </div>
          </div>

          {/* Fast-Track Simulation for testing */}
          <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#1F6BFF] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Sandbox Testing Shortcut
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                Demo
              </span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
              In real operation, your society admin reviews documents within 24 hours. For this prototype evaluation, click below to simulate immediate admin verification.
            </p>
            <button
              onClick={handleFastTrackApproval}
              disabled={approving}
              className="w-full bg-[#1F6BFF] hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-full shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{approving ? 'Verifying with Admin API...' : 'Simulate Admin Approval Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#FFB41F]" /> Society Desk: 1800-425-WORK
            </span>
            <Link href="/" className="font-bold text-[#1F6BFF] hover:underline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
