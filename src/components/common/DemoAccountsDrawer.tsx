'use client';

import React from 'react';
import { X, UserCheck, Shield, Wrench, HardHat, Sparkles, Building2, Users } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface DemoAccountsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DemoAccountsDrawer({ isOpen, onClose }: DemoAccountsDrawerProps) {
  const { loginDemo, isLoading } = useAuth();
  const { success, error } = useToast();

  if (!isOpen) return null;

  const accounts = [
    {
      id: 'customer1',
      name: 'Aravind Krishnan',
      role: 'CUSTOMER',
      badge: 'Subscribed 1+3 Family Plan',
      badgeColor: 'bg-green-100 text-green-800 border-green-300',
      description: 'Primary customer with active Annual Family Membership & 2 enrolled family members.',
      icon: Users,
    },
    {
      id: 'customer2',
      name: 'Lakshmi Narayanan',
      role: 'CUSTOMER',
      badge: 'Individual (Unsubscribed)',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      description: 'New household customer ready to explore services or buy family plan.',
      icon: UserCheck,
    },
    {
      id: 'family_member',
      name: 'Meena Krishnan',
      role: 'FAMILY_MEMBER',
      badge: 'Family Slot 2/4',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'Enrolled household family member with booking and emergency privileges.',
      icon: Users,
    },
    {
      id: 'kumar_plumber',
      name: 'Kumar Selvam',
      role: 'WORKER',
      badge: 'Level 4 Advanced (Plumber)',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: '8 yrs exp, 426 jobs, 4.8★ rating, certified artisan with mutual aid insurance.',
      icon: Wrench,
    },
    {
      id: 'rajesh_electrician',
      name: 'Rajesh Subramanian',
      role: 'WORKER',
      badge: 'Level 5 Expert (Electrician)',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      description: '10 yrs exp, 580 jobs, 4.9★, state wireman licensed expert.',
      icon: HardHat,
    },
    {
      id: 'unverified_worker',
      name: 'Ravi Shankar',
      role: 'WORKER (Unverified)',
      badge: 'Level 1 Pending KYC',
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      description: 'Newly registered tradesperson awaiting cooperative verification & approval.',
      icon: Sparkles,
    },
    {
      id: 'coop_admin',
      name: 'Tambaram Society Desk',
      role: 'COOPERATIVE_ADMIN',
      badge: 'Society Admin Portal',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: 'Verifies worker KYC, validates skill certificates, monitors jobs & disputes.',
      icon: Building2,
    },
    {
      id: 'federation_admin',
      name: 'State Federation Desk',
      role: 'FEDERATION_ADMIN',
      badge: 'Federation Overseer',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      description: 'State-level cooperative federation oversight, AI demand forecasting & multi-society switcher.',
      icon: Shield,
    },
  ];

  const handleLogin = async (accId: string, name: string) => {
    const ok = await loginDemo(accId);
    if (ok) {
      success('Logged In Successfully', `Switched to demo account: ${name}`);
      onClose();
    } else {
      error('Login Failed', 'Could not authenticate demo account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 bg-[#0B1B3F] text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                1-Click Access
              </span>
              <span className="text-xs text-blue-200">Sandbox Environment</span>
            </div>
            <h3 className="text-xl font-display uppercase tracking-wide mt-1 text-white">
              Try Demo Accounts
            </h3>
            <p className="text-xs text-blue-200 mt-0.5">
              Select any persona to immediately test authentic roles and real database states.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-[#F7F8DC]/40">
          {accounts.map((acc) => {
            const Icon = acc.icon;
            return (
              <div
                key={acc.id}
                className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all hover:border-[#1F6BFF]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1F6BFF] flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B1B3F] text-sm flex items-center gap-2">
                        {acc.name}
                      </h4>
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border mt-0.5 ${acc.badgeColor}`}>
                        {acc.badge}
                      </span>
                    </div>
                  </div>
                  <button
                    disabled={isLoading}
                    onClick={() => handleLogin(acc.id, acc.name)}
                    className="shrink-0 bg-[#FFB41F] hover:bg-[#e69e12] text-[#0B1B3F] text-xs font-bold px-3.5 py-2 rounded-full shadow-sm hover:shadow transition disabled:opacity-50"
                  >
                    Login
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed bg-gray-50/70 p-2 rounded-lg">
                  {acc.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-200 bg-white text-xs text-center text-gray-500">
          All accounts operate in verified sandbox mode with pre-seeded history and simulated payments.
        </div>
      </div>
    </div>
  );
}
