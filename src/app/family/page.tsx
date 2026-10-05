'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { WizardCard } from '@/components/common/WizardCard';

export default function FamilyHubPage() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [familyData, setFamilyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add Member 3-Step Wizard state
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [canBook, setCanBook] = useState(true);
  const [canBookEmergency, setCanBookEmergency] = useState(true);
  const [canViewPayments, setCanViewPayments] = useState(false);
  const [inviteResult, setInviteResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchFamily = async () => {
    try {
      const res = await fetch('/api/family');
      const data = await res.json();
      if (data.success) {
        setFamilyData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamily();
  }, []);

  // Handle Remove Family Member
  const handleRemoveMember = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName}? This will free up a household slot.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/family?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        success('Member Removed', `${memberName} removed. Slot is now available.`);
        await fetchFamily();
      } else {
        error('Error', data.error || 'Failed to remove member');
      }
    } catch {
      error('Error', 'Failed to communicate with server');
    }
  };

  // Add member wizard next
  const handleAddNext = async () => {
    if (addStep === 1) {
      if (!name.trim() || mobile.length !== 10) {
        warning('Validation', 'Please provide a valid name and 10-digit mobile number');
        return;
      }
      setAddStep(2);
    } else if (addStep === 2) {
      // Submit member creation
      try {
        setSubmitting(true);
        const res = await fetch('/api/family', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            mobile,
            canBook,
            canBookEmergency,
            canViewPayments,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          error('Cannot Add Member', data.error || 'Failed to add family member');
          return;
        }

        setInviteResult(data);
        setAddStep(3);
        success('Family Member Invited! 🎉', `${name} added to family plan.`);
        await fetchFamily();
      } catch {
        error('Network Error', 'Failed to submit family member');
      } finally {
        setSubmitting(false);
      }
    } else if (addStep === 3) {
      // Done
      setShowAddWizard(false);
      setAddStep(1);
      setName('');
      setMobile('');
      setInviteResult(null);
    }
  };

  const usedSlots = familyData?.slots?.used || 1;
  const totalSlots = 4;
  const isFull = usedSlots >= totalSlots;

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                1 + 3 Household Protection
              </span>
              <span className="text-xs text-blue-200">Shared Cooperative Benefits</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Family Hub & Members
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Manage household access, emergency permissions, and shared booking history
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isFull) {
                  warning(
                    'Family Plan Full',
                    'Maximum 4 members allowed (1 Primary + 3 Family Members). Please remove an existing member to free a slot.'
                  );
                } else {
                  setShowAddWizard(true);
                }
              }}
              className="btn-amber text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Add Family Member</span>
            </button>
          </div>
        </div>

        {/* 4 Slots Visual Box: "Family Members: X / 4 Used" as specified in Section 7 */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Shared Household Slots
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#0B1B3F]">
                Family Members: {usedSlots} / 4 Used
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                {isFull
                  ? 'All 4 household slots are occupied. Remove a member below if you need to add someone else.'
                  : `${4 - usedSlots} slot(s) remaining for your spouse, parents, or children.`}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((slotIndex) => {
                const isOccupied = slotIndex <= usedSlots;
                return (
                  <div
                    key={slotIndex}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border ${
                      isOccupied
                        ? 'bg-[#1F6BFF] text-white border-[#1F6BFF] shadow-sm'
                        : 'bg-gray-50 text-gray-300 border-dashed border-gray-300'
                    }`}
                  >
                    {isOccupied ? '✓' : slotIndex}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Members List */}
          <div className="mt-6 space-y-4">
            {/* Primary Member */}
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0B1B3F] text-white flex items-center justify-center text-xl font-bold">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#0B1B3F]">
                      {familyData?.primaryCustomer?.fullName || user?.name || 'Primary Member'}
                    </h4>
                    <span className="bg-[#FFB41F] text-[#0B1B3F] text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                      Primary Account Holder
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Full account administrator • Primary billing contact
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-gray-400">Master Slot 1</span>
            </div>

            {/* Additional Family Members */}
            {familyData?.familyMembers?.map((m: any, idx: number) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#1F6BFF]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#8438FF] flex items-center justify-center text-xl font-bold">
                    👤
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#0B1B3F]">{m.name}</h4>
                      <span className="text-xs text-gray-500 font-mono">({m.mobile})</span>
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Active Member
                      </span>
                    </div>
                    {/* Permissions list */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-gray-500">
                      <span className={m.canBook ? 'text-green-700 font-medium' : 'text-gray-400 line-through'}>
                        ✓ Can Book Services
                      </span>
                      <span>•</span>
                      <span className={m.canBookEmergency ? 'text-green-700 font-medium' : 'text-gray-400 line-through'}>
                        ✓ Emergency SOS
                      </span>
                      <span>•</span>
                      <span className={m.canViewPayments ? 'text-green-700 font-medium' : 'text-gray-400 line-through'}>
                        ✓ View Invoices
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRemoveMember(m.id, m.name)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-[#E5383B] transition"
                    title="Remove Member (Frees a slot)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Empty Slots Preview */}
            {[...Array(Math.max(0, 3 - (familyData?.familyMembers?.length || 0)))].map((_, i) => (
              <div
                key={`empty-${i}`}
                onClick={() => setShowAddWizard(true)}
                className="p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#1F6BFF] hover:bg-blue-50/20 text-gray-400 hover:text-[#1F6BFF] flex items-center justify-center gap-2 cursor-pointer transition py-6"
              >
                <UserPlus className="w-4 h-4" />
                <span className="text-xs font-bold">+ Empty Household Slot (Click to Invite)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Add Family Member Wizard Modal */}
        {showAddWizard && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-xl">
              <WizardCard
                currentStep={addStep}
                totalSteps={3}
                stepTitle={
                  addStep === 1
                    ? '01. Family Member Details'
                    : addStep === 2
                    ? '02. Permissions & Privileges'
                    : '03. Invitation Dispatched'
                }
                stepSubtitle={
                  addStep === 1
                    ? 'Name and mobile number for cooperative booking access'
                    : addStep === 2
                    ? 'Configure permissions for standard booking, emergency calls, and invoices'
                    : 'Your family member has been enrolled on your shared plan'
                }
                onBack={addStep === 2 ? () => setAddStep(1) : undefined}
                onNext={handleAddNext}
                nextLabel={addStep === 3 ? 'Done' : addStep === 2 ? 'Send Invite' : 'Next Step'}
                isLoading={submitting}
              >
                {addStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Member Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Meena Krishnan"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Member Mobile Number
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="e.g. 9876543212"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>
                  </div>
                )}

                {addStep === 2 && (
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                      <div>
                        <h5 className="font-bold text-xs text-[#0B1B3F]">Can Book Standard Services</h5>
                        <p className="text-[11px] text-gray-500">Allow member to schedule plumbing, cleaning, repairs</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={canBook}
                        onChange={(e) => setCanBook(e.target.checked)}
                        className="rounded text-[#1F6BFF] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                      <div>
                        <h5 className="font-bold text-xs text-[#0B1B3F]">Can Trigger Emergency SOS</h5>
                        <p className="text-[11px] text-gray-500">24/7 priority emergency dispatch with zero surcharge</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={canBookEmergency}
                        onChange={(e) => setCanBookEmergency(e.target.checked)}
                        className="rounded text-[#FF5A1F] w-4 h-4"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50 cursor-pointer">
                      <div>
                        <h5 className="font-bold text-xs text-[#0B1B3F]">Can View Invoices & Payment Logs</h5>
                        <p className="text-[11px] text-gray-500">Access to digital GST receipts and transaction logs</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={canViewPayments}
                        onChange={(e) => setCanViewPayments(e.target.checked)}
                        className="rounded text-[#1F6BFF] w-4 h-4"
                      />
                    </label>
                  </div>
                )}

                {addStep === 3 && (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-14 h-14 rounded-full bg-green-100 text-[#1FA85A] flex items-center justify-center mx-auto text-2xl">
                      🎉
                    </div>
                    <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                      Family Member Enrolled
                    </h3>
                    <p className="text-xs text-gray-600 max-w-sm mx-auto">
                      {name} can now sign in using mobile number <strong>{mobile}</strong> and immediately access your household cooperative coverage.
                    </p>
                    <div className="p-3 bg-gray-50 rounded-xl text-xs font-mono text-gray-600 border border-gray-200">
                      Sandbox Invite Token: {inviteResult?.member?.inviteToken || 'INV-SUCCESS'}
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
