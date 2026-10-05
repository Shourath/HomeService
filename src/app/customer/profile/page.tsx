'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, MapPin, Phone, Mail, Globe, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function CustomerProfilePage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [fullName, setFullName] = useState(user?.name || 'Aravind Krishnan');
  const [mobile, setMobile] = useState(user?.mobile || '9876543210');
  const [email, setEmail] = useState(user?.email || 'aravind@homeservice.coop');
  const [address, setAddress] = useState(user?.customer?.address || 'Flat 4B, Shanthi Niketan Apt, GST Road, Tambaram East, Chennai');
  const [city, setCity] = useState(user?.customer?.city || 'Chennai');
  const [pinCode, setPinCode] = useState(user?.customer?.pinCode || '600045');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Saved', 'Personal details and primary service address updated.');
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Account Settings
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Customer Profile
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Household address, emergency contact and language preferences
            </p>
          </div>

          <Link
            href="/customer"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSave} className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                disabled
                value={mobile}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Primary Service Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                City / Zone
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Verified by Tambaram Cooperative Society</span>
            <button type="submit" className="btn-amber text-xs sm:text-sm font-bold shadow-md">
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
