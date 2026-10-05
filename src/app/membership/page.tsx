'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  CreditCard,
  ArrowRight,
  Zap,
  Sparkles,
  Download
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { WizardCard } from '@/components/common/WizardCard';

export default function MembershipPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [subData, setSubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 3-step Purchase / Renewal Wizard
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD'>('UPI');
  const [purchaseReceipt, setPurchaseReceipt] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/subscriptions');
      const data = await res.json();
      if (data.success) {
        setSubData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const price = subData?.pricing?.customerAnnualFamilyPrice || 1499;

  // Handle wizard step navigation
  const handleNext = async () => {
    if (wizardStep === 1) {
      setWizardStep(2);
    } else if (wizardStep === 2) {
      // Process sandbox payment
      try {
        setIsProcessing(true);
        const res = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planType: 'ANNUAL_FAMILY',
            paymentMethod,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setPurchaseReceipt(data);
          setWizardStep(3);
          success('Subscription Activated! 🎉', 'Your entire family now enjoys cooperative benefits');
          await fetchSubscription();
        } else {
          error('Payment Error', data.error || 'Failed to complete subscription');
        }
      } catch {
        error('Error', 'Failed to reach payment gateway');
      } finally {
        setIsProcessing(false);
      }
    } else if (wizardStep === 3) {
      setShowWizard(false);
      setWizardStep(1);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center text-white">
          <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
            Cooperative Household Shield
          </span>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-2">
            Annual Family Membership
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-lg mx-auto">
            1 Primary Account + 3 Family Members = Complete Peace of Mind Across 50+ Trades
          </p>
        </div>

        {/* Subscription Plan Card */}
        <div className="panel-white p-8 sm:p-10 border border-gray-100 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 border-b border-gray-100 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                  {subData?.hasActiveSubscription ? 'Currently Active' : 'Popular Household Plan'}
                </span>
                <span className="text-xs text-gray-500">1 + 3 Family Slots</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#0B1B3F]">
                Annual Family Plan
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {subData?.hasActiveSubscription
                  ? `Active until ${new Date(subData.subscription.endDate).toLocaleDateString()}`
                  : 'Valid for 365 days from date of purchase'}
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

          {/* Benefits Grid */}
          <div className="py-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Primary member + up to 3 family members on 1 shared plan</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Priority dispatch & fast-track allocation on all jobs</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>24/7 emergency SOS service access with zero surcharge</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Digital GST invoices and shared family service logs</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Member-exclusive discounts across specialized trades</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#1FA85A] shrink-0" />
              <span>Supports the Tamil Nadu Labour Welfare Cooperative Fund</span>
            </div>
          </div>

          {/* Actions: Buy / Renew / Manage family */}
          <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {subData?.hasActiveSubscription ? (
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setShowWizard(true);
                  }}
                  className="btn-amber text-xs sm:text-sm font-bold shadow-md"
                >
                  <span>Renew Family Membership (+1 Year)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setWizardStep(1);
                    setShowWizard(true);
                  }}
                  className="btn-amber text-xs sm:text-sm font-bold shadow-md"
                >
                  <span>Join Family Plan Now (₹{price})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <Link
                href="/family"
                className="px-5 py-3 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1F6BFF] text-xs sm:text-sm font-bold transition flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Manage Family Members (1+3)</span>
              </Link>
            </div>

            <span className="text-[11px] text-gray-400">
              Instant sandbox receipt • No auto-renewal surprises
            </span>
          </div>
        </div>

        {/* 3-Step Purchase Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <WizardCard
                currentStep={wizardStep}
                totalSteps={3}
                stepTitle={
                  wizardStep === 1
                    ? '01. Review Plan Coverage'
                    : wizardStep === 2
                    ? '02. Sandbox Demo Payment'
                    : '03. Membership Activated & Receipt'
                }
                stepSubtitle={
                  wizardStep === 1
                    ? 'Annual Family Membership (1 Primary + 3 Family Slots)'
                    : wizardStep === 2
                    ? 'Complete payment via simulated UPI or Card'
                    : 'Official digital subscription receipt'
                }
                onBack={wizardStep === 2 ? () => setWizardStep(1) : undefined}
                onNext={handleNext}
                nextLabel={
                  wizardStep === 1
                    ? 'Proceed to Demo Payment'
                    : wizardStep === 2
                    ? `Pay ₹${price} (Sandbox)`
                    : 'Return to Hub'
                }
                isLoading={isProcessing}
              >
                {/* Wizard Step 1: Review */}
                {wizardStep === 1 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex justify-between font-bold text-sm text-[#0B1B3F]">
                        <span>Annual Cooperative Family Membership</span>
                        <span className="text-[#1F6BFF]">₹{price} / Year</span>
                      </div>
                      <p className="text-gray-500">
                        Provides shared priority dispatch, zero emergency surcharges, and dedicated artisan allocation for up to 4 household members.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-xl text-blue-900 border border-blue-200">
                      Renewal extends the whole family group for an additional 365 days.
                    </div>
                  </div>
                )}

                {/* Wizard Step 2: Payment */}
                {wizardStep === 2 && (
                  <div className="space-y-5">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span className="font-bold">Total Due: ₹{price}</span>
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
                        UPI (GPay / PhonePe / QR)
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

                    <p className="text-xs text-gray-500 text-center">
                      Simulated transaction. No actual credit card or bank funds are debited.
                    </p>
                  </div>
                )}

                {/* Wizard Step 3: Receipt */}
                {wizardStep === 3 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 text-[#1FA85A] flex items-center justify-center mx-auto text-2xl">
                      🎉
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                      Membership Active!
                    </h3>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto">
                      Your Annual Family Membership has been successfully activated. You can now invite family members from your Family Hub.
                    </p>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-600 border border-gray-200">
                      Payment Ref: {purchaseReceipt?.receiptNumber || 'PAY-SUB-DEMO'}
                    </div>
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
