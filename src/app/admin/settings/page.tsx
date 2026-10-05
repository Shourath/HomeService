'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, ShieldCheck, CheckCircle2, Coins, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [customerAnnualFamilyPrice, setCustomerAnnualFamilyPrice] = useState(1499);
  const [workerAnnualMembershipPrice, setWorkerAnnualMembershipPrice] = useState(499);
  const [platformFeePct, setPlatformFeePct] = useState(5.0);
  const [cooperativeSharePct, setCooperativeSharePct] = useState(5.0);
  const [emergencySurchargePct, setEmergencySurchargePct] = useState(20.0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.config) {
          setCustomerAnnualFamilyPrice(data.config.customerAnnualFamilyPrice);
          setWorkerAnnualMembershipPrice(data.config.workerAnnualMembershipPrice);
          setPlatformFeePct(data.config.platformFeePct);
          setCooperativeSharePct(data.config.cooperativeSharePct);
          setEmergencySurchargePct(data.config.emergencySurchargePct);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerAnnualFamilyPrice,
          workerAnnualMembershipPrice,
          platformFeePct,
          cooperativeSharePct,
          emergencySurchargePct,
        }),
      });

      if (res.ok) {
        success('Settings Saved', 'Cooperative rates and fee split updated across the platform.');
      } else {
        error('Error', 'Failed to update settings');
      }
    } catch {
      error('Network Error', 'Failed to reach server');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Federation Governance
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Platform & Pricing Settings
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Configure annual membership dues, transparent platform fee %, and cooperative mutual aid reserve
            </p>
          </div>

          <Link
            href="/admin"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Admin Console
          </Link>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-6">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F]">
              Membership Pricing Dues
            </h3>
            <p className="text-xs text-gray-500">Configures values displayed on public landing page and checkout</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Customer Annual Family Plan (1+3) Price (₹)
              </label>
              <input
                type="number"
                min={0}
                max={50000}
                value={customerAnnualFamilyPrice}
                onChange={(e) => setCustomerAnnualFamilyPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Default: ₹1,499 / Year</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Worker Annual Cooperative Membership Price (₹)
              </label>
              <input
                type="number"
                min={0}
                max={50000}
                value={workerAnnualMembershipPrice}
                onChange={(e) => setWorkerAnnualMembershipPrice(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Default: ₹499 / Year</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-display text-2xl font-bold uppercase text-[#0B1B3F] mb-1">
              Transparent Fee & Revenue Split
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              90%+ of customer fee goes directly into the artisan's pocket
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Platform Tech Fee (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={20}
                  value={platformFeePct}
                  onChange={(e) => setPlatformFeePct(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Cloud infrastructure & dispatch</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Cooperative Mutual Aid (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={20}
                  value={cooperativeSharePct}
                  onChange={(e) => setCooperativeSharePct(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Worker health & accidental fund</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Emergency Surcharge (%)
                </label>
                <input
                  type="number"
                  step="1"
                  min={0}
                  max={50}
                  value={emergencySurchargePct}
                  onChange={(e) => setEmergencySurchargePct(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">Zero for Family Members</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-amber text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition"
          >
            <span>{saving ? 'Updating Rates...' : 'Save Settings & Update Ledgers'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
