'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { WizardCard } from '@/components/common/WizardCard';
import { useToast } from '@/components/common/ToastContext';
import { useAuth } from '@/components/common/AuthContext';
import {
  Wrench,
  CheckCircle2,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  Clock,
  MapPin,
  Lock
} from 'lucide-react';

export default function ProviderRegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { success, error, warning } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Categories & Services list
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  // Form State
  // Step 1
  const [mobile, setMobile] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);

  // Step 2
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');

  // Step 3
  const [primaryCategory, setPrimaryCategory] = useState('Home & Repair');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['plumber']);
  const [experienceYears, setExperienceYears] = useState(3);

  // Step 4
  const [workingHours, setWorkingHours] = useState('08:00 - 18:00');
  const [areasServed, setAreasServed] = useState('Tambaram, Chromepet, Pallavaram');

  // Step 5
  const [kycDocType, setKycDocType] = useState('AADHAAR');
  const [kycDocNumber, setKycDocNumber] = useState('');

  // Step 6
  const [certificateTitle, setCertificateTitle] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [upiId, setUpiId] = useState('');

  // Step 7: Consent
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
      setDemoOtp(data.demoCode);
      success('Demo OTP Sent', `Code dispatched: ${data.demoCode}`);
    } catch {
      error('Error', 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSkill = (slug: string) => {
    setSelectedSkills((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!mobile || mobile.length !== 10) {
        warning('Mobile Required', 'Enter 10-digit mobile');
        return;
      }
      if (!otpCode || otpCode.length < 6) {
        warning('OTP Required', 'Enter 6-digit OTP code');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!fullName.trim() || !email.includes('@') || password.length < 6 || !address.trim()) {
        warning('Incomplete', 'Please fill in all personal details and minimum 6-character password');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedSkills.length === 0) {
        warning('Skill Required', 'Please select at least 1 trade skill');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!areasServed.trim()) {
        warning('Areas Required', 'Specify the neighbourhoods you serve');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!kycDocNumber || kycDocNumber.length < 4) {
        warning('ID Document Required', 'Please enter document number for cooperative verification');
        return;
      }
      setStep(6);
    } else if (step === 6) {
      if (!bankAccount || bankAccount.length < 6) {
        warning('Bank Account Required', 'Required for direct cooperative payouts');
        return;
      }
      setStep(7);
    } else if (step === 7) {
      if (!consentAccepted) {
        warning('Consent Required', 'Please accept the cooperative membership terms');
        return;
      }

      try {
        setIsLoading(true);
        const res = await fetch('/api/auth/signup/provider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            mobile,
            email,
            password,
            primaryCategory,
            skills: selectedSkills,
            experienceYears,
            workingHours,
            areasServed,
            address,
            kycDocType,
            kycDocNumber,
            bankAccount,
            upiId: upiId || `${mobile}@coopbank`,
            certificateTitle,
            consentAccepted,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          error('Registration Error', data.error || 'Failed to submit application');
          return;
        }

        success('Application Submitted!', 'Awaiting cooperative society verification');
        await refreshUser();
        router.push(data.redirectUrl || '/provider/pending');
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
          Artisan & Tradesperson Onboarding
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-2">
          Join Labour Cooperative Society
        </h1>
        <p className="text-blue-100 text-xs sm:text-sm mt-1">
          7-step registration: zero commissions, mutual aid health insurance & cooperative ownership
        </p>
      </div>

      <WizardCard
        currentStep={step}
        totalSteps={totalSteps}
        stepTitle={
          step === 1
            ? 'Mobile Verification (OTP)'
            : step === 2
            ? 'Personal & Account Details'
            : step === 3
            ? 'Trade Occupation & Skills'
            : step === 4
            ? 'Working Hours & Coverage Areas'
            : step === 5
            ? 'Cooperative Details & KYC'
            : step === 6
            ? 'Certificates & Bank Account'
            : 'Review Application & Member Agreement'
        }
        stepSubtitle={
          step === 1
            ? 'Verify your direct contact number'
            : step === 2
            ? 'Your name, password and contact address'
            : step === 3
            ? 'Select all trades you are proficient in'
            : step === 4
            ? 'Define your daily availability schedule'
            : step === 5
            ? 'KYC data is encrypted and masked for security'
            : step === 6
            ? 'For direct earnings disbursement and trade certification'
            : 'Submit for cooperative society verification'
        }
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onNext={handleNext}
        nextLabel={step === totalSteps ? 'Submit for Verification' : 'Next Step'}
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
                  placeholder="e.g. 9876543220"
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
                  {otpSent ? 'Resend' : 'Send Demo OTP'}
                </button>
              </div>
            </div>

            {demoOtp && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <div>
                  <span className="font-bold">DEMO OTP: </span>
                  <span className="font-mono text-base font-black text-[#0B1B3F]">{demoOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtpCode(demoOtp)}
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

        {/* Step 2: Personal Details */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                placeholder="e.g. Ravi Shankar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. ravi@coop.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Create Password
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Residential Address
              </label>
              <textarea
                rows={2}
                placeholder="Street address, colony, Chennai"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Trade & Skills */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Primary Trade Category
              </label>
              <select
                value={primaryCategory}
                onChange={(e) => setPrimaryCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              >
                <option value="Home & Repair">Home & Repair (Plumbing, Electrical, Carpentry)</option>
                <option value="Cleaning & Maintenance">Cleaning & Maintenance</option>
                <option value="Care & Assistance">Care & Assistance</option>
                <option value="Transport & Outdoor">Transport & Outdoor</option>
                <option value="Technical & Professional">Technical & Professional</option>
                <option value="Construction & Skilled Labour">Construction & Skilled Labour</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Years of Trade Experience
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Specific Trade Skills (Select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-xl bg-gray-50/50">
                {[
                  { slug: 'plumber', label: 'Plumber' },
                  { slug: 'electrician', label: 'Electrician' },
                  { slug: 'carpenter', label: 'Carpenter' },
                  { slug: 'painter', label: 'Painter' },
                  { slug: 'ac-technician', label: 'AC Technician' },
                  { slug: 'deep-cleaning', label: 'Deep Cleaning' },
                  { slug: 'elderly-caregiver', label: 'Elderly Caregiver' },
                  { slug: 'emergency-plumber', label: 'Emergency Plumber' },
                  { slug: 'emergency-electrician', label: 'Emergency Electrician' },
                ].map((sk) => {
                  const isChecked = selectedSkills.includes(sk.slug);
                  return (
                    <button
                      type="button"
                      key={sk.slug}
                      onClick={() => toggleSkill(sk.slug)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                        isChecked
                          ? 'border-[#1F6BFF] bg-blue-50 text-[#1F6BFF]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span>{sk.label}</span>
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#1F6BFF]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Working Hours & Areas */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Preferred Working Hours
              </label>
              <input
                type="text"
                placeholder="e.g. 08:00 - 18:00"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Neighbourhoods & Areas Served
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Tambaram, Chromepet, Pallavaram, Guindy"
                value={areasServed}
                onChange={(e) => setAreasServed(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                You will receive job request notifications within these areas.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Cooperative Details & KYC */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Building2 className="w-4 h-4 text-[#1F6BFF] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Assigned Labour Cooperative Society:</p>
                <p className="text-[11px] text-blue-800">
                  Tambaram Labour & Artisans Cooperative Society (Reg No. TNL-FED-01/01)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  ID Proof Document
                </label>
                <select
                  value={kycDocType}
                  onChange={(e) => setKycDocType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                >
                  <option value="AADHAAR">Aadhaar Card</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="DRIVING_LICENSE">Driving License</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Document Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 5839 2049 8492"
                  value={kycDocNumber}
                  onChange={(e) => setKycDocNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              🔒 ID document number is masked and stored securely in accordance with IT and cooperative privacy rules.
            </p>
          </div>
        )}

        {/* Step 6: Certificate & Bank/UPI */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Technical Certificate / License (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. ITI National Trade Certificate / Wireman License"
                value={certificateTitle}
                onChange={(e) => setCertificateTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bank Account / Cooperative A/c
                </label>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543220@coopbank"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review & Submit */}
        {step === 7 && (
          <div className="space-y-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
              <h4 className="font-bold text-sm text-[#0B1B3F]">Summary for Society Review</h4>
              <div className="grid grid-cols-2 gap-2 text-gray-600">
                <p><strong className="text-gray-900">Name:</strong> {fullName}</p>
                <p><strong className="text-gray-900">Mobile:</strong> {mobile}</p>
                <p><strong className="text-gray-900">Category:</strong> {primaryCategory}</p>
                <p><strong className="text-gray-900">Experience:</strong> {experienceYears} Years</p>
                <p><strong className="text-gray-900">Coverage:</strong> {areasServed}</p>
                <p><strong className="text-gray-900">Status:</strong> PENDING_VERIFICATION</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl text-amber-900 border border-amber-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF5A1F] shrink-0 mt-0.5" />
              <p>
                Upon submission, your application will be assigned status <strong>PENDING_VERIFICATION</strong>. The cooperative desk will review your trade certificates and verify KYC before you can receive job requests.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-gray-600 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="coop-consent"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 rounded text-[#1F6BFF]"
              />
              <label htmlFor="coop-consent" className="cursor-pointer leading-relaxed">
                I agree to adhere to cooperative quality benchmarks, fair client communication, and consent to my credentials being verified by the society council.
              </label>
            </div>
          </div>
        )}
      </WizardCard>
    </div>
  );
}
