'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Upload,
  Plus,
  ArrowRight,
  GraduationCap,
  Award,
  Wrench
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { WizardCard } from '@/components/common/WizardCard';

export default function ProviderSkillsPage() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [skillsData, setSkillsData] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upgrade Profile Wizard State (3 steps)
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [certificateTitle, setCertificateTitle] = useState('ITI National Trade Certificate in Plumbing');
  const [issuingAuthority, setIssuingAuthority] = useState('National Council for Vocational Training (NCVT)');
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = async () => {
    try {
      const [skRes, catRes] = await Promise.all([
        fetch('/api/provider/skills').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
      ]);

      if (skRes.success) setSkillsData(skRes);
      if (catRes.categories) {
        setCategories(catRes.categories);
        if (catRes.categories[0]?.services[0]) {
          setSelectedServiceId(catRes.categories[0].services[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleUpgradeNext = async () => {
    if (wizardStep === 1) {
      if (!selectedServiceId) {
        warning('Skill Required', 'Please select a trade to add');
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      if (!certificateTitle.trim()) {
        warning('Title Required', 'Enter certificate or qualification title');
        return;
      }
      setWizardStep(3);
    } else if (wizardStep === 3) {
      // Submit to server: status is PENDING and never auto-verified!
      try {
        setSubmitting(true);
        const res = await fetch('/api/provider/skills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceId: selectedServiceId,
            experienceYears,
            certificateTitle,
            issuingAuthority,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          success(
            'Submitted for Council Verification! 📜',
            'Pending Admin Review. Your level will upgrade once certified.'
          );
          await fetchSkills();
          setShowWizard(false);
          setWizardStep(1);
        } else {
          error('Error', data.error || 'Failed to submit skill');
        }
      } catch {
        error('Network Error', 'Failed to reach server');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const levelInfo = skillsData?.levelInfo || {
    level: 1,
    levelTitle: 'Registered',
    completionPct: 60,
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Artisan Guild Verification
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Skills, Rank & Upgrades
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Levels 1 to 5: Earn higher society dispatch rank, client trust, and welfare benefits
            </p>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            className="btn-amber text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Skill / Upgrade Rank</span>
          </button>
        </div>

        {/* Level Progression & Completion Panel */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Current Cooperative Rank
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-display text-3xl sm:text-4xl font-bold uppercase text-[#0B1B3F]">
                  Level {levelInfo.level}: {levelInfo.levelTitle}
                </span>
                <span className="bg-[#1FA85A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                  Verified Member
                </span>
              </div>
            </div>

            {/* Profile Completion Bar */}
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-gray-500">Profile Completion:</span>
                <span className="text-[#1F6BFF]">{levelInfo.completionPct}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1F6BFF] to-[#1FA85A] transition-all duration-300"
                  style={{ width: `${levelInfo.completionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* 5 Levels Ruler as required by Section 8 */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Artisan Progression Framework (Levels 1 to 5)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              {[
                { lvl: 1, title: 'Registered', desc: 'KYC Submitted' },
                { lvl: 2, title: 'Verified', desc: 'Background & 1 Skill' },
                { lvl: 3, title: 'Certified', desc: 'Trade Certificate & 5 Jobs' },
                { lvl: 4, title: 'Advanced', desc: '3+ Yrs Exp & 4.5★' },
                { lvl: 5, title: 'Expert', desc: '5+ Yrs, 100 Jobs, 4.8★' },
              ].map((stepLvl) => {
                const isPassed = levelInfo.level >= stepLvl.lvl;
                const isCurrent = levelInfo.level === stepLvl.lvl;
                return (
                  <div
                    key={stepLvl.lvl}
                    className={`p-3.5 rounded-2xl border text-center transition ${
                      isCurrent
                        ? 'border-[#FFB41F] bg-amber-50/70 shadow-sm ring-2 ring-[#FFB41F]/30'
                        : isPassed
                        ? 'border-[#1FA85A]/40 bg-green-50/40 text-gray-800'
                        : 'border-gray-200 bg-gray-50/50 text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full mx-auto mb-1.5 flex items-center justify-center font-bold text-xs ${
                        isCurrent
                          ? 'bg-[#FFB41F] text-[#0B1B3F]'
                          : isPassed
                          ? 'bg-[#1FA85A] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : stepLvl.lvl}
                    </div>
                    <h5 className="font-bold text-sm text-[#0B1B3F]">{stepLvl.title}</h5>
                    <p className="text-[10px] text-gray-500 mt-0.5">{stepLvl.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Skills List */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-bold text-sm text-[#0B1B3F] uppercase tracking-wider mb-4">
              Enrolled Trade Skills
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {skillsData?.skills?.map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1F6BFF] flex items-center justify-center font-bold">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm text-[#0B1B3F]">{s.service?.name}</h5>
                      <p className="text-xs text-gray-500">{s.experienceYears} Years Exp</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      s.isVerified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {s.isVerified ? 'Verified ✓' : 'Pending Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications List */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-bold text-sm text-[#0B1B3F] uppercase tracking-wider mb-4">
              Trade Certifications & Licenses
            </h4>
            <div className="space-y-3">
              {skillsData?.certifications?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-[#FFB41F] shrink-0" />
                    <div>
                      <h5 className="font-bold text-sm text-[#0B1B3F]">{c.certificateTitle}</h5>
                      <p className="text-gray-500">Authority: {c.issuingAuthority}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase self-start sm:self-auto ${
                      c.status === 'VERIFIED'
                        ? 'bg-green-100 text-green-800'
                        : c.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3-Step Upgrade Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <WizardCard
                currentStep={wizardStep}
                totalSteps={3}
                stepTitle={
                  wizardStep === 1
                    ? '01. Select Skill to Add'
                    : wizardStep === 2
                    ? '02. Upload Trade Certificate'
                    : '03. Submit for Society Verification'
                }
                stepSubtitle={
                  wizardStep === 1
                    ? 'Choose an additional trade you have practical craftsmanship in'
                    : wizardStep === 2
                    ? 'State trade certificate, NSDC badge, or ITI diploma'
                    : 'Certifications are NEVER auto-verified and require council review'
                }
                onBack={wizardStep > 1 ? () => setWizardStep(wizardStep - 1) : undefined}
                onNext={handleUpgradeNext}
                nextLabel={wizardStep === 3 ? 'Submit for Council Review' : 'Next Step'}
                isLoading={submitting}
              >
                {/* Step 1: Select Service */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Select Specialized Trade
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      >
                        {categories.map((cat) => (
                          <optgroup key={cat.id} label={cat.name}>
                            {cat.services.map((svc: any) => (
                              <option key={svc.id} value={svc.id}>
                                {svc.name} (Base ₹{svc.basePrice})
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Years of Hands-on Experience in this Trade
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Certificate details */}
                {wizardStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Certificate Title / Qualification
                      </label>
                      <input
                        type="text"
                        value={certificateTitle}
                        onChange={(e) => setCertificateTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Issuing Authority / Technical Board
                      </label>
                      <input
                        type="text"
                        value={issuingAuthority}
                        onChange={(e) => setIssuingAuthority(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>

                    <div className="p-4 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 space-y-1">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto" />
                      <p className="text-xs font-bold text-gray-700">Digital Copy Attached (Demo)</p>
                      <p className="text-[11px] text-gray-400">PDF, JPG, PNG accepted (Max 5MB)</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Review policy */}
                {wizardStep === 3 && (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <ShieldCheck className="w-5 h-5 text-[#FF5A1F]" />
                        <span>Council Review Protocol</span>
                      </div>
                      <p className="leading-relaxed">
                        To maintain high quality benchmarks, trade skills and certificates are <strong>never automatically verified</strong>. Your society council will review your submission. Once approved, your artisan level will upgrade.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-1 border border-gray-200">
                      <p><strong>Certificate:</strong> {certificateTitle}</p>
                      <p><strong>Authority:</strong> {issuingAuthority}</p>
                      <p><strong>Experience:</strong> {experienceYears} Years</p>
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
