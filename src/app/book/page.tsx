'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardCard } from '@/components/common/WizardCard';
import { useToast } from '@/components/common/ToastContext';
import { useAuth } from '@/components/common/AuthContext';
import {
  Wrench,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Zap,
  ArrowRight,
  UserCheck
} from 'lucide-react';

function BookServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Data loaded from API
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form selections
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(
    searchParams.get('category') || 'home-repair'
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState<string>('10:00 AM');
  const [customerAddress, setCustomerAddress] = useState<string>(
    user?.customer?.address || 'Flat 4B, Shanthi Niketan Apt, GST Road, Tambaram East, Chennai'
  );
  const [approximateArea, setApproximateArea] = useState<string>('Tambaram Zone');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Filters (Step 4)
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(true);
  const [filterAvailableNow, setFilterAvailableNow] = useState(true);
  const [filterRating4Plus, setFilterRating4Plus] = useState(true);
  const [isEmergency, setIsEmergency] = useState(searchParams.get('emergency') === 'true');

  // Matched workers (Step 5)
  const [rankedWorkers, setRankedWorkers] = useState<any[]>([]);
  const [topThreeWorkers, setTopThreeWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showAllWorkers, setShowAllWorkers] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          setCategories(data.categories);
          // Set initial service if matching query
          const targetCat = data.categories.find((c: any) => c.slug === selectedCategorySlug);
          if (targetCat && targetCat.services.length > 0) {
            setSelectedServiceId(targetCat.services[0].id);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingCategories(false));
  }, [selectedCategorySlug]);

  // Handle category change
  const handleCategorySelect = (catSlug: string) => {
    setSelectedCategorySlug(catSlug);
    const cat = categories.find((c) => c.slug === catSlug);
    if (cat && cat.services.length > 0) {
      setSelectedServiceId(cat.services[0].id);
    }
  };

  const currentCategory = categories.find((c) => c.slug === selectedCategorySlug);
  const currentService = currentCategory?.services.find((s: any) => s.id === selectedServiceId);

  // Run matching when reaching step 5
  const runMatching = async () => {
    if (!selectedServiceId) return;
    try {
      setMatchingLoading(true);
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: selectedServiceId,
          lat: 12.9249,
          lng: 80.1472,
          isEmergency,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTopThreeWorkers(data.topRecommended || []);
        setRankedWorkers(data.allWorkers || []);
        if (data.topRecommended && data.topRecommended.length > 0) {
          setSelectedWorkerId(data.topRecommended[0].workerId);
        }
      }
    } catch {
      error('Matching Error', 'Failed to retrieve matched workers');
    } finally {
      setMatchingLoading(false);
    }
  };

  // Step navigation
  const handleNext = async () => {
    if (step === 1) {
      if (!selectedCategorySlug) {
        warning('Selection Required', 'Please select a service category');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedServiceId) {
        warning('Selection Required', 'Please select a specific service');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!customerAddress.trim() || !issueDescription.trim()) {
        warning('Details Required', 'Please provide service address and brief issue description');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      await runMatching();
      setStep(5);
    } else if (step === 5) {
      setStep(6);
    } else if (step === 6) {
      // Review & Submit
      if (!user) {
        warning('Login Required', 'Please sign in or use a demo account to book');
        router.push('/auth/login');
        return;
      }

      try {
        setSubmittingBooking(true);
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedServiceId,
            workerId: selectedWorkerId,
            scheduledDate,
            scheduledTime,
            customerAddress,
            approximateArea,
            issueDescription,
            notes,
            isEmergency,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          error('Booking Error', data.error || 'Failed to place booking');
          return;
        }

        success('Booking Dispatched! 🎉', `Job #${data.booking.bookingNumber} sent to worker.`);
        router.push(`/customer/bookings/${data.booking.id}`);
      } catch {
        error('Network Error', 'Failed to submit booking');
      } finally {
        setSubmittingBooking(false);
      }
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-6 text-white">
        <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
          Cooperative Service Dispatch
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-2">
          {isEmergency ? '🚨 Emergency Service Booking' : 'Book a Verified Service'}
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          Direct connection to local society artisans with upfront transparent rates
        </p>
      </div>

      <WizardCard
        currentStep={step}
        totalSteps={totalSteps}
        stepTitle={
          step === 1
            ? '01. Choose Service Category'
            : step === 2
            ? '02. Select Specific Trade Service'
            : step === 3
            ? '03. Service Address, Date & Issue'
            : step === 4
            ? '04. Preferences & Verification Filters'
            : step === 5
            ? '05. AI Recommended Cooperative Workers'
            : '06. Review Booking & Confirm Dispatch'
        }
        stepSubtitle={
          step === 1
            ? '7 essential trade categories supported by Tamil Nadu labour cooperatives'
            : step === 2
            ? `Select your specific need under ${currentCategory?.name || 'Category'}`
            : step === 3
            ? 'Tell us where to arrive and describe the problem'
            : step === 4
            ? 'Customize matching parameters according to your priority'
            : step === 5
            ? 'Transparently ranked by verified skills, proximity and customer ratings'
            : 'Confirm job parameters and pricing breakdown before dispatching'
        }
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onNext={handleNext}
        nextLabel={step === totalSteps ? 'Confirm & Dispatch Worker' : 'Next Step'}
        isLoading={matchingLoading || submittingBooking}
      >
        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {categories.map((cat) => {
              const isSelected = selectedCategorySlug === cat.slug;
              return (
                <div
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'border-[#1F6BFF] bg-blue-50/70 shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                      cat.slug === 'emergency'
                        ? 'bg-[#FF5A1F]'
                        : cat.slug === 'cleaning-maintenance'
                        ? 'bg-[#1FA85A]'
                        : cat.slug === 'care-assistance'
                        ? 'bg-[#8438FF]'
                        : 'bg-[#1F6BFF]'
                    }`}
                  >
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#0B1B3F] truncate">{cat.name}</h4>
                    <p className="text-[11px] text-gray-500 truncate">{cat.services?.length || 0} Trades Available</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[#1F6BFF] shrink-0" />}
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && currentCategory && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
              {currentCategory.services.map((svc: any) => {
                const isSelected = selectedServiceId === svc.id;
                return (
                  <div
                    key={svc.id}
                    onClick={() => setSelectedServiceId(svc.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#FFB41F] bg-amber-50/70 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1B3F]">{svc.name}</h4>
                      <p className="text-[11px] text-gray-500">
                        {svc.durationMinutes} mins • Level {svc.requiredLevel}+ Artisan
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-display text-base font-bold text-[#0B1B3F]">
                        ₹{svc.basePrice}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Location, Date & Issue Description */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Service Address
              </label>
              <textarea
                rows={2}
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Enter complete address, apartment, and landmarks"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Time Slot
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                >
                  <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                  <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                  <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                  <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                  <option value="Immediate SOS">Immediate SOS (Rapid Dispatch)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Describe the Issue or Job Details
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Bathroom sink water leaking heavily from the drain pipe joint. Need replacement gasket."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>
          </div>
        )}

        {/* Step 4: Filters & Preferences */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              Fine-tune the matching weights for your booking. The cooperative matching engine guarantees fair distribution while prioritizing your preferences.
            </p>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-[#1FA85A]" />
                  <div>
                    <h5 className="font-bold text-xs text-[#0B1B3F]">Verified & ITI/NSDC Certified Only</h5>
                    <p className="text-[11px] text-gray-500">Workers with verified state artisan credentials</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filterVerifiedOnly}
                  onChange={(e) => setFilterVerifiedOnly(e.target.checked)}
                  className="rounded text-[#1F6BFF] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[#1F6BFF]" />
                  <div>
                    <h5 className="font-bold text-xs text-[#0B1B3F]">Available Now (Rapid Dispatch)</h5>
                    <p className="text-[11px] text-gray-500">Workers currently active and not occupied on another job</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filterAvailableNow}
                  onChange={(e) => setFilterAvailableNow(e.target.checked)}
                  className="rounded text-[#1F6BFF] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Star className="w-5 h-5 text-[#FFB41F]" />
                  <div>
                    <h5 className="font-bold text-xs text-[#0B1B3F]">Top Rated (4.8+ Stars)</h5>
                    <p className="text-[11px] text-gray-500">Prioritize craftspeople with top neighborhood reviews</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filterRating4Plus}
                  onChange={(e) => setFilterRating4Plus(e.target.checked)}
                  className="rounded text-[#1F6BFF] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-orange-50/50 cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-5 h-5 text-[#FF5A1F]" />
                  <div>
                    <h5 className="font-bold text-xs text-[#0B1B3F]">Mark as Emergency Priority</h5>
                    <p className="text-[11px] text-gray-500">Broadcasts with 2-minute countdown priority</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="rounded text-[#FF5A1F] w-4 h-4"
                />
              </label>
            </div>
          </div>
        )}

        {/* Step 5: Top 3 Recommended Workers with AI Explanation */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-gray-100">
              <span className="font-bold text-gray-700">
                Top 3 Recommended Artisans ({rankedWorkers.length} total nearby)
              </span>
              <span className="text-[#1F6BFF] font-semibold">Ranked by Proximity & Skill</span>
            </div>

            <div className="space-y-3">
              {(showAllWorkers ? rankedWorkers : topThreeWorkers).map((w) => {
                const isSelected = selectedWorkerId === w.workerId;
                return (
                  <div
                    key={w.workerId}
                    onClick={() => setSelectedWorkerId(w.workerId)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#1F6BFF] bg-blue-50/70 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl shrink-0 font-bold text-[#1F6BFF]">
                          👨🏽‍🔧
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#0B1B3F]">{w.fullName}</h4>
                            <span className="bg-[#1FA85A] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                              Level {w.level} {w.levelTitle}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-3.5 h-3.5 fill-amber-400" /> {w.ratingAvg}
                            </span>
                            <span>•</span>
                            <span>{w.totalJobs} jobs</span>
                            <span>•</span>
                            <span>{w.distanceKm} km away</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full block">
                          Match Score: {w.score}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-[#1F6BFF] font-bold mt-1 inline-block">
                            Selected ✓
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Explanation Banner */}
                    <div className="mt-3 p-2.5 rounded-xl bg-white border border-blue-200/80 text-[11px] text-gray-700 leading-relaxed flex items-start gap-2 shadow-xs">
                      <Sparkles className="w-4 h-4 text-[#FFB41F] shrink-0 mt-0.5" />
                      <span>{w.explanation}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {rankedWorkers.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllWorkers(!showAllWorkers)}
                className="w-full text-center text-xs text-[#1F6BFF] font-bold py-2 hover:underline"
              >
                {showAllWorkers ? 'Show Top 3 Only' : `See More Workers (${rankedWorkers.length - 3} additional)`}
              </button>
            )}
          </div>
        )}

        {/* Step 6: Review & Confirm */}
        {step === 6 && currentService && (
          <div className="space-y-5 text-xs">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 space-y-3">
              <h4 className="font-bold text-sm text-[#0B1B3F]">Booking Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <p><strong className="text-gray-900">Service:</strong> {currentService.name}</p>
                <p><strong className="text-gray-900">Category:</strong> {currentCategory?.name}</p>
                <p><strong className="text-gray-900">Date:</strong> {scheduledDate}</p>
                <p><strong className="text-gray-900">Slot:</strong> {scheduledTime}</p>
                <p className="col-span-2">
                  <strong className="text-gray-900">Address:</strong> {customerAddress}
                </p>
                <p className="col-span-2">
                  <strong className="text-gray-900">Issue:</strong> {issueDescription}
                </p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Base Service Rate</span>
                <span>₹{currentService.basePrice}</span>
              </div>
              {isEmergency && (
                <div className="flex justify-between text-amber-700">
                  <span>Emergency Rapid Surcharge (+20%)</span>
                  <span>+₹{Math.round(currentService.basePrice * 0.2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400 text-[11px]">
                <span>Cooperative Platform & Mutual Aid (Included)</span>
                <span>10%</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between font-bold text-sm text-[#0B1B3F]">
                <span>Estimated Total</span>
                <span className="font-display text-lg text-[#1F6BFF]">
                  ₹{isEmergency ? Math.round(currentService.basePrice * 1.2) : currentService.basePrice}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl text-blue-900 flex items-start gap-2 border border-blue-200">
              <ShieldCheck className="w-4 h-4 text-[#1F6BFF] shrink-0 mt-0.5" />
              <p>
                Payment is only processed <strong>after work is verified completed</strong>. You can pay securely via demo UPI, card, or wallet, and download your GST invoice.
              </p>
            </div>
          </div>
        )}
      </WizardCard>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 font-medium">Loading booking flow...</div>}>
      <BookServiceContent />
    </React.Suspense>
  );
}
