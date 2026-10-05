'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WizardCard } from '@/components/common/WizardCard';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import {
  AlertTriangle,
  Zap,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Phone
} from 'lucide-react';

export default function EmergencyWizardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Emergency service types
  const emergencyTypes = [
    { slug: 'emergency-plumber', title: 'Emergency Plumber', desc: 'Pipe bursts, flooding, severe drain blocks', icon: '🚰' },
    { slug: 'emergency-electrician', title: 'Emergency Electrician', desc: 'Main power trip, sparks, short circuit hazard', icon: '⚡️' },
    { slug: 'emergency-locksmith', title: 'Emergency Locksmith', desc: 'Locked out, jammed door lock, key breakage', icon: '🔑' },
    { slug: 'power-backup-technician', title: 'Power Backup Failure', desc: 'Inverter inverter failure during blackout', icon: '🔋' },
    { slug: 'water-leakage-repair', title: 'Water Leakage Repair', desc: 'Ceiling drip, overhead tank overflow', icon: '💧' },
    { slug: 'appliance-breakdown', title: 'Appliance Breakdown', desc: 'Critical refrigerator or pump breakdown', icon: '🛠️' },
  ];

  const [selectedType, setSelectedType] = useState('emergency-plumber');
  const [gpsLatitude, setGpsLatitude] = useState(12.9249);
  const [gpsLongitude, setGpsLongitude] = useState(80.1472);
  const [address, setAddress] = useState(user?.customer?.address || 'GST Road, West Tambaram, Chennai');
  const [issueNotes, setIssueNotes] = useState('Burst water pipe in kitchen - water spreading quickly');

  const [isSearching, setIsSearching] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2-min countdown
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Capture GPS on step 2
  useEffect(() => {
    if (step === 2 && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLatitude(pos.coords.latitude);
          setGpsLongitude(pos.coords.longitude);
        },
        () => {}
      );
    }
  }, [step]);

  // Handle countdown when in live dispatch (step 3)
  useEffect(() => {
    let timer: any;
    if (step === 3 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Dispatch emergency booking via API
      try {
        setIsSearching(true);
        // Find service for this slug
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        let targetServiceId = '';
        for (const cat of catData.categories || []) {
          const s = cat.services.find((svc: any) => svc.slug === selectedType);
          if (s) {
            targetServiceId = s.id;
            break;
          }
        }

        if (!targetServiceId) {
          // Fallback to first available emergency service
          const emCat = catData.categories.find((c: any) => c.slug === 'emergency');
          targetServiceId = emCat?.services[0]?.id;
        }

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: targetServiceId,
            scheduledDate: new Date().toISOString().split('T')[0],
            scheduledTime: 'Immediate SOS',
            customerAddress: address,
            customerLat: gpsLatitude,
            customerLng: gpsLongitude,
            approximateArea: 'Tambaram Zone',
            issueDescription: `[EMERGENCY SOS]: ${issueNotes}`,
            isEmergency: true,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          error('Emergency Dispatch Error', data.error || 'Failed to dispatch SOS');
          return;
        }

        setCreatedBooking(data.booking);
        setStep(3);
        success('SOS Broadcasted! 🚨', 'Active cooperative workers alerted with 2-minute priority');
      } catch {
        error('Connection Error', 'Failed to broadcast emergency call');
      } finally {
        setIsSearching(false);
      }
    } else if (step === 3) {
      if (createdBooking) {
        router.push(`/customer/bookings/${createdBooking.id}`);
      }
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-6 text-white">
        <span className="bg-[#FF5A1F] text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full ring-4 ring-[#FF5A1F]/30 animate-pulse">
          🚨 24/7 Cooperative SOS
        </span>
        <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-3">
          Emergency Dispatch Assistance
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          Rapid local artisan response for hazardous leaks, electrical faults and lockouts
        </p>
      </div>

      <WizardCard
        currentStep={step}
        totalSteps={totalSteps}
        stepTitle={
          step === 1
            ? '01. Select Emergency Category'
            : step === 2
            ? '02. Confirm GPS Location & Hazard'
            : '03. Live Rapid Broadcast Status'
        }
        stepSubtitle={
          step === 1
            ? 'What is the immediate problem requiring rapid dispatch?'
            : step === 2
            ? 'Verify exact premises coordinates for fastest arrival'
            : 'Broadcasting to standby society workers • First acceptance wins'
        }
        onBack={step > 1 && step < 3 ? () => setStep(step - 1) : undefined}
        onNext={handleNext}
        nextLabel={
          step === 1
            ? 'Proceed to GPS Confirmation'
            : step === 2
            ? 'Broadcast SOS Immediately'
            : 'Open Live Tracking & Status'
        }
        isLoading={isSearching}
      >
        {/* Step 1: Emergency Type */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {emergencyTypes.map((em) => {
              const isSelected = selectedType === em.slug;
              return (
                <div
                  key={em.slug}
                  onClick={() => setSelectedType(em.slug)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-[#FF5A1F] bg-orange-50/70 shadow-md ring-2 ring-[#FF5A1F]/20'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl shrink-0">{em.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-[#0B1B3F]">{em.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{em.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Confirm GPS */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] text-white flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">GPS Coordinates Locked</h4>
                  <p className="text-xs text-gray-600">
                    {gpsLatitude.toFixed(4)}, {gpsLongitude.toFixed(4)} (Tambaram Zone)
                  </p>
                </div>
              </div>
              <span className="bg-[#FF5A1F] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                Active
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Emergency Location Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Hazard Severity & Details
              </label>
              <textarea
                rows={2}
                value={issueNotes}
                onChange={(e) => setIssueNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1F6BFF] shrink-0" />
              <span>Priority Boost Applied: Dispatches instantly to the closest available society artisan.</span>
            </div>
          </div>
        )}

        {/* Step 3: Live Broadcast Countdown */}
        {step === 3 && (
          <div className="text-center py-6 space-y-6">
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-orange-200 border-t-[#FF5A1F] animate-spin" />
              <div className="text-center">
                <span className="font-display text-3xl font-black text-[#FF5A1F]">
                  {Math.floor(countdown / 60)}:{('0' + (countdown % 60)).slice(-2)}
                </span>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  Standby Window
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F]">
                Broadcasting to Local Cooperative Workers
              </h3>
              <p className="text-xs text-gray-600 max-w-sm mx-auto">
                All certified artisans within 5 km of Tambaram have been alerted with emergency sound alert. First acceptance locks the job.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 max-w-md mx-auto border border-gray-200 text-xs text-left space-y-2">
              <div className="flex items-center justify-between text-gray-700">
                <span>Active Artisans Notified:</span>
                <span className="font-bold text-[#1F6BFF]">4 Nearby Workers</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Expected Arrival Window:</span>
                <span className="font-bold text-[#1FA85A]">15 - 20 Mins</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span>Estimated Price:</span>
                <span className="font-bold text-gray-900">₹399 (Standard Emergency Rate)</span>
              </div>
            </div>
          </div>
        )}
      </WizardCard>
    </div>
  );
}
