'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardCard } from '@/components/common/WizardCard';
import { useToast } from '@/components/common/ToastContext';
import { useAuth } from '@/components/common/AuthContext';
import {
  Phone,
  User,
  MapPin,
  Compass,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Globe
} from 'lucide-react';

function CustomerSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [mobile, setMobile] = useState(searchParams.get('mobile') || '');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Chennai');
  const [pinCode, setPinCode] = useState('600045');

  const [latitude, setLatitude] = useState(12.9249);
  const [longitude, setLongitude] = useState(80.1472);
  const [gpsCaptured, setGpsCaptured] = useState(false);

  const [planType, setPlanType] = useState<'ANNUAL_FAMILY' | 'INDIVIDUAL'>('ANNUAL_FAMILY');
  const [consentAccepted, setConsentAccepted] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Send OTP
  const handleSendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      warning('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: mobile, purpose: 'SIGNUP' }),
      });
      const data = await res.json();
      if (!res.ok) {
        error('Error', data.error || 'Failed to dispatch OTP');
        return;
      }
      setOtpSent(true);
      setDemoOtpCode(data.demoCode);
      success('Demo OTP Sent', `Code dispatched: ${data.demoCode}`);
    } catch {
      error('Error', 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Capture GPS
  const handleCaptureGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setGpsCaptured(true);
          success('GPS Captured', `Accurate coordinates pinned: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          // Fallback to Tambaram default
          setGpsCaptured(true);
          success('Location Set', 'Pinned to Tambaram East, Chennai (12.9249, 80.1472)');
        }
      );
    } else {
      setGpsCaptured(true);
      success('Location Set', 'Pinned to Tambaram East, Chennai (12.9249, 80.1472)');
    }
  };

  // Next step validation
  const handleNext = async () => {
    if (step === 1) {
      if (!mobile || mobile.length !== 10) {
        warning('Required', 'Please enter a valid 10-digit mobile number');
        return;
      }
      if (!otpCode || otpCode.length < 6) {
        warning('Required', 'Please enter the 6-digit OTP code');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!fullName.trim() || fullName.length < 2) {
        warning('Required', 'Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        warning('Required', 'Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        warning('Password Policy', 'Password must be at least 6 characters');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!address.trim() || address.length < 5) {
        warning('Address Required', 'Please enter your street address');
        return;
      }
      if (!pinCode || pinCode.length !== 6) {
        warning('PIN Required', 'Please enter a 6-digit PIN code');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    } else if (step === 5) {
      // Submit registration
      if (!consentAccepted) {
        warning('Consent Required', 'Please accept the cooperative member terms');
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/signup/customer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            mobile,
            email,
            password,
            preferredLanguage,
            address,
            city,
            pinCode,
            latitude,
            longitude,
            planType,
            consentAccepted,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          error('Registration Error', data.error || 'Failed to complete registration');
          return;
        }

        success('Account Created! 🎉', 'Welcome to the HOMEService cooperative family');
        await refreshUser();
        router.push(data.redirectUrl || '/customer');
      } catch {
        error('Network Error', 'Failed to reach server');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="text-center max-w-xl mx-auto mb-6 text-white">
        <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
          Customer Onboarding
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-2">
          Join HOMEService Marketplace
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          5 quick steps to verified cooperative services and household privileges
        </p>
      </div>

      <WizardCard
        currentStep={step}
        totalSteps={totalSteps}
        stepTitle={
          step === 1
            ? 'Mobile Verification (OTP)'
            : step === 2
            ? 'Account & Language Settings'
            : step === 3
            ? 'Service Address & Area'
            : step === 4
            ? 'Pin Location & Coordinates'
            : 'Select Membership Plan & Review'
        }
        stepSubtitle={
          step === 1
            ? 'We will send a 6-digit sandbox verification code'
            : step === 2
            ? 'Your credentials and preferred language for notices'
            : step === 3
            ? 'Where our verified cooperative artisans will arrive'
            : step === 4
            ? 'Ensures fast dispatch from the closest cooperative society'
            : 'Choose between the 1+3 Annual Family Plan or Individual'
        }
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onNext={handleNext}
        nextLabel={step === totalSteps ? 'Complete Registration' : 'Next Step'}
        isLoading={isLoading}
      >
        {/* Step 1: Mobile & OTP */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading || mobile.length !== 10}
                  className="bg-blue-50 text-[#1F6BFF] hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50"
                >
                  {otpSent ? 'Resend OTP' : 'Send Demo OTP'}
                </button>
              </div>
            </div>

            {demoOtpCode && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">DEMO OTP: </span>
                  <span className="font-mono text-base font-black text-[#0B1B3F]">{demoOtpCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtpCode)}
                  className="text-[11px] bg-amber-200 font-bold px-2 py-0.5 rounded text-amber-900"
                >
                  Auto-fill
                </button>
              </div>
            )}

            {otpSent && (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full text-center font-mono tracking-widest text-lg px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Personal Info & Language */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aravind Krishnan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. aravind@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              >
                <option value="en">English</option>
                <option value="ta">Tamil (தமிழ்)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="te">Telugu (తెలుగు)</option>
                <option value="kn">Kannada (ಕನ್ನಡ)</option>
                <option value="ml">Malayalam (മലയാളം)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Address & City */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Street Address / Apartment
              </label>
              <textarea
                rows={3}
                placeholder="Flat / Door No., Apartment Name, Street Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="600045"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: GPS Coordinates */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1F6BFF] text-white flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3F]">Pinpoint Map Location</h4>
                  <p className="text-xs text-gray-500">
                    {latitude.toFixed(4)}, {longitude.toFixed(4)} (Tambaram Zone)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCaptureGps}
                className="bg-[#1F6BFF] hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-full transition shadow-sm"
              >
                {gpsCaptured ? 'Recalibrate GPS' : 'Detect GPS'}
              </button>
            </div>

            {/* Visual map preview block */}
            <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border border-gray-200 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-800 mt-2">
                Tambaram Labour & Artisans Cooperative Society
              </p>
              <p className="text-[11px] text-gray-500">
                Guaranteed coverage within 15 km radius
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Plan Selection & Review */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-3">
              {/* Option 1: Annual Family Plan */}
              <div
                onClick={() => setPlanType('ANNUAL_FAMILY')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  planType === 'ANNUAL_FAMILY'
                    ? 'border-[#FFB41F] bg-amber-50/60 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👨‍👩‍👧‍👦</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1B3F]">
                        Annual Family Membership (1 + 3)
                      </h4>
                      <p className="text-xs text-gray-500">
                        Up to 4 household members on 1 plan • Zero emergency surcharge
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-lg font-bold text-[#0B1B3F]">₹1,499</span>
                    <span className="text-[10px] text-gray-400 block">/ Year</span>
                  </div>
                </div>
              </div>

              {/* Option 2: Individual Plan */}
              <div
                onClick={() => setPlanType('INDIVIDUAL')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  planType === 'INDIVIDUAL'
                    ? 'border-[#1F6BFF] bg-blue-50/60 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">👤</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1B3F]">
                        Standard Individual Account
                      </h4>
                      <p className="text-xs text-gray-500">
                        Pay-as-you-go per service • Upgrade anytime
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-display text-lg font-bold text-[#0B1B3F]">FREE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consent"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#1F6BFF] focus:ring-[#1F6BFF]"
              />
              <label htmlFor="consent" className="leading-relaxed cursor-pointer">
                I agree to the cooperative marketplace bylaws, transparent pricing structure, and understand that external payments operate in sandboxed demo mode.
              </label>
            </div>
          </div>
        )}
      </WizardCard>
    </div>
  );
}

export default function CustomerSignupPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500 font-medium">Loading signup...</div>}>
      <CustomerSignupContent />
    </React.Suspense>
  );
}
