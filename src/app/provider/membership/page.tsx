'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { WizardCard } from '@/components/common/WizardCard';

export default function WorkerMembershipPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [membershipData, setMembershipData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 3-step wizard
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMembership = async () => {
    try {
      const res = await fetch('/api/provider/membership');
      const data = await res.json();
      if (data.success) {
        setMembershipData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, []);

  const price = membershipData?.price || 499;

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      try {
        setIsProcessing(true);
        const res = await fetch('/api/provider/membership', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          success('Worker Membership Active! 🎖️', 'You are now eligible to receive local job dispatches.');
          await fetchMembership();
          setStep(3);
        } else {
          error('Error', data.error || 'Failed to purchase membership');
        }
      } catch {
        error('Network Error', 'Failed to reach payment gateway');
      } finally {
        setIsProcessing(false);
      }
    } else if (step === 3) {
      setShowWizard(false);
      setStep(1);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center text-white">
          <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
            Artisan Society Standing
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-2">
            Annual Worker Cooperative Membership
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            Annual subscription enables active dispatch matching, mutual aid insurance eligibility, and tool purchase subsidies.
          </p>
        </div>

        {/* Membership Status Card */}
        <div className="panel-white p-8 sm:p-10 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gray-100 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                  membershipData?.hasActiveSubscription
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {membershipData?.hasActiveSubscription ? 'Active & Receiving Jobs' : 'Payment Required for Dispatch'}
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#0B1B3F]">
                Artisan Annual Card
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {membershipData?.hasActiveSubscription
                  ? `Valid until ${new Date(membershipData.subscription.endDate).toLocaleDateString()}`
                  : 'Pay annual dues to unfreeze your dispatch account'}
              </p>
            </div>

            <div className="text-left md:text-right">
              <div className="flex items-baseline md:justify-end gap-1">
                <span className="font-display text-4xl sm:text-5xl font-black text-[#0B1B3F]">
                  ₹{price}
                </span>
                <span className="text-gray-500 text-sm font-semibold">/ Year</span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                Admin configurable rate • Demo checkout
              </span>
            </div>
          </div>

          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Full eligibility to receive household service requests</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>₹2,50,000 mutual aid health and accidental coverage</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Free enrollment in state ITI / NSDC skill certifications</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Eligibility for cooperative tool and safety equipment micro-loans</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => {
                setStep(1);
                setShowWizard(true);
              }}
              className="btn-amber text-xs sm:text-sm font-bold shadow-md"
            >
              <span>{membershipData?.hasActiveSubscription ? 'Renew Membership' : 'Activate Membership Now'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/provider" className="text-xs font-bold text-[#1F6BFF] hover:underline">
              Return to Provider Dashboard →
            </Link>
          </div>
        </div>

        {/* 3-Step Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <WizardCard
                currentStep={step}
                totalSteps={3}
                stepTitle={
                  step === 1
                    ? '01. Review Annual Worker Dues'
                    : step === 2
                    ? '02. Sandbox Demo Checkout'
                    : '03. Dispatch Privileges Activated'
                }
                stepSubtitle={
                  step === 1
                    ? 'Cooperative society annual trade fee'
                    : step === 2
                    ? 'Simulated UPI or Card payment'
                    : 'You are now ready to receive job requests'
                }
                onBack={step === 2 ? () => setStep(1) : undefined}
                onNext={handleNext}
                nextLabel={step === 1 ? 'Proceed to Payment' : step === 2 ? `Pay ₹${price} (Sandbox)` : 'Return to Portal'}
                isLoading={isProcessing}
              >
                {step === 1 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex justify-between font-bold text-sm text-[#0B1B3F]">
                        <span>Annual Worker Cooperative Membership</span>
                        <span className="text-[#1F6BFF]">₹{price} / Year</span>
                      </div>
                      <p className="text-gray-500">
                        Unlocks job offers, algorithmic matching ranking, and welfare board mutual aid.
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span className="font-bold">Total Payable: ₹{price}</span>
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        SANDBOX DEMO
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          paymentMethod === 'UPI'
                            ? 'border-[#1F6BFF] bg-blue-50 text-[#1F6BFF]'
                            : 'border-gray-200 bg-white text-gray-700'
                        }`}
                      >
                        UPI Demo
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                          paymentMethod === 'CARD'
                            ? 'border-[#1F6BFF] bg-blue-50 text-[#1F6BFF]'
                            : 'border-gray-200 bg-white text-gray-700'
                        }`}
                      >
                        Debit / Credit Card
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 text-[#1FA85A] flex items-center justify-center mx-auto text-2xl">
                      🎉
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                      Membership Active!
                    </h3>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto">
                      Your annual membership is active for 365 days. Switch your status to <strong>Available</strong> on the dashboard to receive incoming customer requests.
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
