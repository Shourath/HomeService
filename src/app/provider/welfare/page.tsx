'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { WizardCard } from '@/components/common/WizardCard';

export default function ProviderWelfarePage() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [welfareData, setWelfareData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Claim Wizard (3 steps)
  const [showClaimWizard, setShowClaimWizard] = useState(false);
  const [claimStep, setClaimStep] = useState(1);
  const [claimAmount, setClaimAmount] = useState('5000');
  const [reason, setReason] = useState('Medical treatment reimbursement for on-duty thumb sprain');
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const fetchWelfare = async () => {
    try {
      const res = await fetch('/api/provider/welfare');
      const data = await res.json();
      if (data.success) {
        setWelfareData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWelfare();
  }, []);

  const handleClaimNext = async () => {
    if (claimStep === 1) {
      if (!claimAmount || Number(claimAmount) <= 0) {
        warning('Amount Required', 'Please enter a valid claim amount');
        return;
      }
      setClaimStep(2);
    } else if (claimStep === 2) {
      if (!reason.trim()) {
        warning('Reason Required', 'Please provide reason and details of incident');
        return;
      }
      // Submit claim to API
      const coverage = welfareData?.insuranceCoverages?.[0];
      if (!coverage) {
        error('Error', 'No active mutual aid policy on record');
        return;
      }

      try {
        setSubmittingClaim(true);
        const res = await fetch('/api/provider/welfare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coverageId: coverage.id,
            claimAmount: Number(claimAmount),
            reason,
            incidentDate,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          success('Claim Submitted! 🏥', 'Dispatched to society welfare desk for review.');
          await fetchWelfare();
          setClaimStep(3);
        } else {
          error('Error', data.error || 'Failed to submit claim');
        }
      } catch {
        error('Network Error', 'Failed to reach welfare desk');
      } finally {
        setSubmittingClaim(false);
      }
    } else if (claimStep === 3) {
      setShowClaimWizard(false);
      setClaimStep(1);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Worker Mutual Assistance Desk
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Welfare & Mutual Aid
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Health, disability and accidental assistance funded by cooperative work allocations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowClaimWizard(true)}
              className="btn-amber text-xs sm:text-sm font-bold shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>File Mutual Aid Claim</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Banner: Integration only, platform does not provide insurance as required by Section 8 */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-blue-100 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#FFB41F] shrink-0 mt-0.5" />
          <p>
            <strong>Cooperative Integration Notice:</strong> Welfare and mutual aid programs are administered directly by the <em>Tamil Nadu Unorganised Workers Welfare Board</em> and society mutual aid societies. The HOMEService platform facilitates verified enrollment, ledger contributions, and claim coordination only.
          </p>
        </div>

        {/* Policy & Schemes Panel */}
        <div className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-8">
          {/* Active Policy Status */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
              Active Mutual Aid Protection
            </h3>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFB41F] bg-white/10 px-2 py-0.5 rounded">
                  Policy No: {welfareData?.insuranceCoverages?.[0]?.policyNumber || 'COOP-INS-2026-0982'}
                </span>
                <h4 className="font-display text-2xl font-bold uppercase text-white mt-1">
                  Accidental & Emergency Hospitalization Cover
                </h4>
                <p className="text-xs text-blue-200">
                  Provider: {welfareData?.insuranceCoverages?.[0]?.providerLabel || 'Cooperative Group Mutual Aid'}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-blue-300 block">Sum Insured</span>
                <span className="font-display text-3xl font-black text-[#1FA85A]">
                  ₹2,50,000
                </span>
                <span className="text-[11px] text-green-300 block mt-0.5 font-semibold">
                  Valid Till Dec 2026 ✓
                </span>
              </div>
            </div>
          </div>

          {/* Welfare Schemes */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
              State & Society Welfare Schemes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {welfareData?.schemes?.map((sch: any) => (
                <div
                  key={sch.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#1F6BFF] uppercase bg-blue-50 px-2 py-0.5 rounded">
                      {sch.category}
                    </span>
                    <h4 className="font-bold text-base text-[#0B1B3F] mt-2">{sch.title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{sch.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1FA85A]">{sch.benefitAmount}</span>
                    <span className="text-gray-400 text-[10px]">{sch.providerLabel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Step Claim Wizard Modal */}
        {showClaimWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <WizardCard
                currentStep={claimStep}
                totalSteps={3}
                stepTitle={
                  claimStep === 1
                    ? '01. Claim Amount'
                    : claimStep === 2
                    ? '02. Incident & Treatment Details'
                    : '03. Claim Dispatched to Welfare Desk'
                }
                stepSubtitle={
                  claimStep === 1
                    ? 'Specify eligible medical or accidental assistance amount'
                    : claimStep === 2
                    ? 'Describe what happened and when'
                    : 'Your claim ticket has been filed with the cooperative welfare council'
                }
                onBack={claimStep === 2 ? () => setClaimStep(1) : undefined}
                onNext={handleClaimNext}
                nextLabel={claimStep === 3 ? 'Done' : claimStep === 2 ? 'Submit Claim' : 'Next Step'}
                isLoading={submittingClaim}
              >
                {claimStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Claim Amount (INR)
                      </label>
                      <input
                        type="number"
                        min={100}
                        max={250000}
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Incident Date
                      </label>
                      <input
                        type="date"
                        value={incidentDate}
                        onChange={(e) => setIncidentDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>
                  </div>
                )}

                {claimStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Reason & Medical Details
                      </label>
                      <textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>

                    <p className="text-xs text-gray-500">
                      Medical slips and receipts can be presented in person at the Tambaram Society counter.
                    </p>
                  </div>
                )}

                {claimStep === 3 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 text-[#1FA85A] flex items-center justify-center mx-auto text-2xl">
                      🏥
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                      Claim Ticket Queued
                    </h3>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto">
                      Your claim for ₹{claimAmount} has been forwarded to the Tambaram Society Welfare Desk. Settlement will be deposited to your registered bank account upon review.
                    </p>
                  </div>
                )}
              </WizardCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
