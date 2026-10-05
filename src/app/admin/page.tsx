'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldCheck,
  Award,
  Calendar,
  CreditCard,
  HeartHandshake,
  TrendingUp,
  Settings,
  Download,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState<any>(null);
  const [selectedSociety, setSelectedSociety] = useState('CHN-SOC-01'); // Society switcher
  const [loading, setLoading] = useState(true);

  // Verification queues
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [pendingCerts, setPendingCerts] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdminData = async () => {
    try {
      const [statsRes, workersRes, certsRes, allocRes] = await Promise.all([
        fetch('/api/admin/stats').then((r) => r.json()),
        fetch('/api/admin/workers').then((r) => r.json()),
        fetch('/api/admin/certificates').then((r) => r.json()),
        fetch('/api/admin/allocations').then((r) => r.json()),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (workersRes.success) {
        setPendingWorkers(workersRes.workers.filter((w: any) => w.kycStatus === 'PENDING'));
      }
      if (certsRes.success) {
        setPendingCerts(certsRes.certificates.filter((c: any) => c.status === 'PENDING'));
      }
      if (allocRes.success) {
        setAllocations(allocRes.allocations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Quick verify worker
  const handleVerifyWorker = async (workerId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/workers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, action: 'VERIFY' }),
      });
      if (res.ok) {
        success('Worker Verified! 🎖️', 'KYC approved and upgraded to Level 2.');
        await fetchAdminData();
      }
    } catch {
      error('Error', 'Failed to verify worker');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick approve certificate
  const handleApproveCert = async (certificateId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/certificates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificateId, action: 'APPROVE' }),
      });
      if (res.ok) {
        success('Certificate Verified! 📜', 'Worker rank upgraded to Level 3 Certified.');
        await fetchAdminData();
      }
    } catch {
      error('Error', 'Failed to approve certificate');
    } finally {
      setActionLoading(false);
    }
  };

  // Approve workforce allocation
  const handleApproveAllocation = async (allocationId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/allocations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocationId, action: 'APPROVE' }),
      });
      if (res.ok) {
        success('Allocation Approved! 📊', 'Dispatches calibrated across society zones.');
        await fetchAdminData();
      }
    } catch {
      error('Error', 'Failed to approve allocation');
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Report Export helper
  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value\n' +
      `Total Active Workers,${stats?.verifiedWorkers || 8}\n` +
      `Pending KYC Verifications,${stats?.pendingWorkers || 1}\n` +
      `Completed Bookings,${stats?.completedBookings || 12}\n` +
      `Cooperative Welfare Reserve,₹${stats?.cooperativeWelfareFund || 2500}\n` +
      `Active Family Subscriptions,${stats?.activeSubscriptions || 4}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HOMEService_Cooperative_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Report Exported', 'CSV summary downloaded');
  };

  const tiles = [
    { title: 'Worker Verifications', count: `${pendingWorkers.length} Pending`, href: '#verification-queue', icon: Users, color: 'chip-icon-orange' },
    { title: 'Certificate Approvals', count: `${pendingCerts.length} Pending`, href: '#certificate-queue', icon: Award, color: 'chip-icon-purple' },
    { title: 'AI Demand Forecast', count: '7-Day View', href: '/admin/forecast', icon: Sparkles, color: 'chip-icon-blue' },
    { title: 'Workforce Allocation', count: `${allocations.filter(a => a.status === 'PROPOSED').length} Proposed`, href: '#allocation-queue', icon: Layers, color: 'chip-icon-green' },
    { title: 'Pricing & Commission', count: '5% / 5%', href: '/admin/settings', icon: Settings, color: 'chip-icon-blue' },
    { title: 'Reports & Export', count: 'CSV Report', onClick: handleExportCsv, icon: Download, color: 'chip-icon-green' },
  ];

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Federation society switcher as requested in Section 9 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between text-white gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-black px-2.5 py-0.5 rounded-full uppercase">
                {user?.role === 'FEDERATION_ADMIN' ? 'State Federation Portal' : 'Cooperative Society Desk'}
              </span>
              <span className="text-xs text-blue-200">Tamil Nadu Labour Dept Oversight</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-2">
              Cooperative Governance Desk
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Worker onboarding, skill certifications, AI workforce allocation & transparent ledger oversight
            </p>
          </div>

          {/* Society Switcher Dropdown */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-[#FFB41F]" />
            <div>
              <span className="text-[10px] text-blue-200 block uppercase font-bold">Active Society:</span>
              <select
                value={selectedSociety}
                onChange={(e) => {
                  setSelectedSociety(e.target.value);
                  success('Society Switched', `Active branch: ${e.target.value === 'CHN-SOC-01' ? 'Tambaram' : 'Guindy'}`);
                }}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="CHN-SOC-01" className="text-gray-900">Tambaram Artisans Society (CHN-01)</option>
                <option value="CHN-SOC-02" className="text-gray-900">Guindy Skilled Workers Society (CHN-02)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4 KPI Cards as specified in Section 9 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Active Workers */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Verified Society Artisans</span>
              <Users className="w-4 h-4 text-[#1FA85A]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#0B1B3F]">
                {stats?.verifiedWorkers || 8} Active
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {stats?.pendingWorkers || 0} pending review
              </p>
            </div>
          </div>

          {/* Card 2: Completed Jobs */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Total Jobs Dispatched</span>
              <Calendar className="w-4 h-4 text-[#1F6BFF]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#0B1B3F]">
                {stats?.totalBookings || 14}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {stats?.completedBookings || 10} successfully delivered
              </p>
            </div>
          </div>

          {/* Card 3: Active Subscriptions */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Active Family Memberships</span>
              <ShieldCheck className="w-4 h-4 text-[#8438FF]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#8438FF]">
                {stats?.activeSubscriptions || 4}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">1+3 household plans</p>
            </div>
          </div>

          {/* Card 4: Cooperative Welfare Fund */}
          <div className="panel-white p-5 border border-gray-100 shadow-soft flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-2">
              <span>Mutual Aid Welfare Fund (5%)</span>
              <HeartHandshake className="w-4 h-4 text-[#FF5A1F]" />
            </div>
            <div>
              <span className="font-display text-3xl font-black text-[#FF5A1F]">
                ₹{stats?.cooperativeWelfareFund || 2500}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">Dedicated artisan reserve</p>
            </div>
          </div>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tiles.map((t, idx) => {
            const Icon = t.icon;
            if (t.onClick) {
              return (
                <button
                  key={idx}
                  onClick={t.onClick}
                  className="panel-white p-6 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition duration-200 text-left flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-4 w-full">
                    <div className={`chip-icon ${t.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {t.count}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-[#0B1B3F] group-hover:text-[#1F6BFF] transition">
                      {t.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Download consolidated reports</p>
                  </div>
                </button>
              );
            }
            return (
              <Link
                key={idx}
                href={t.href!}
                className="panel-white p-6 border border-gray-100 shadow-soft hover:shadow-card hover:-translate-y-1 transition duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`chip-icon ${t.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {t.count}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-base text-[#0B1B3F] group-hover:text-[#1F6BFF] transition">
                    {t.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Open management console</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Verification Queue Section (Workers & Certificates) */}
        <div id="verification-queue" className="space-y-6">
          {/* Section 1: Worker KYC Queue */}
          <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                Pending Worker KYC Applications ({pendingWorkers.length})
              </h3>
              <span className="text-xs text-gray-400">Section 9 Verification Queue</span>
            </div>

            {pendingWorkers.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                All worker applications have been verified.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 mt-2">
                {pendingWorkers.map((w) => (
                  <div key={w.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0B1B3F]">{w.fullName}</h4>
                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          PENDING KYC
                        </span>
                      </div>
                      <p className="text-gray-500 mt-0.5">
                        Trade: {w.primaryCategory} • Experience: {w.experienceYears} Years • ID: {w.kycDocType} ({w.kycDocNumberEncrypted})
                      </p>
                      <p className="text-gray-400 text-[11px]">{w.address}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleVerifyWorker(w.id)}
                        disabled={actionLoading}
                        className="bg-[#1FA85A] hover:bg-green-700 text-white font-bold px-4 py-2 rounded-full transition text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify & Activate (Level 2)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Certificate Review Queue */}
          <div id="certificate-queue" className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                Pending Trade Certificate Approvals ({pendingCerts.length})
              </h3>
              <span className="text-xs text-gray-400">Upgrades Worker to Level 3 Certified</span>
            </div>

            {pendingCerts.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">
                No certificates awaiting council validation.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 mt-2">
                {pendingCerts.map((c) => (
                  <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#0B1B3F]">{c.certificateTitle}</h4>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          Artisan: {c.worker?.fullName}
                        </span>
                      </div>
                      <p className="text-gray-500 mt-0.5">
                        Issuing Authority: {c.issuingAuthority} • Current Rank: Level {c.worker?.currentLevel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveCert(c.id)}
                        disabled={actionLoading}
                        className="bg-[#1F6BFF] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-full transition text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Approve & Upgrade Rank</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Workforce Allocation Queue */}
          <div id="allocation-queue" className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                AI Workforce Allocation Recommendations
              </h3>
              <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded">
                Never Auto-Reassigned • Council Discretion
              </span>
            </div>

            <div className="divide-y divide-gray-100 mt-2">
              {allocations.map((a) => (
                <div key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#0B1B3F]">{a.service?.name}</span>
                      <span className="bg-blue-100 text-[#1F6BFF] text-[10px] font-bold px-2 py-0.5 rounded">
                        Shift {a.recommendedWorkersCount} Artisans
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        a.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 leading-relaxed max-w-xl">
                      <strong>AI Rationale:</strong> {a.reason}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      From: {a.fromZone?.name} → To: {a.toZone?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {a.status === 'PROPOSED' && (
                      <button
                        onClick={() => handleApproveAllocation(a.id)}
                        disabled={actionLoading}
                        className="bg-[#1FA85A] hover:bg-green-700 text-white font-bold px-4 py-2 rounded-full transition text-xs shadow-sm"
                      >
                        Approve Allocation
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
