'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Phone, KeyRound, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';
import { DemoAccountsDrawer } from '@/components/common/DemoAccountsDrawer';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser, loginDemo } = useAuth();
  const { success, error, warning } = useToast();

  const [activeTab, setActiveTab] = useState<'PASSWORD' | 'OTP'>('PASSWORD');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtpBanner, setDemoOtpBanner] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [demoDrawerOpen, setDemoDrawerOpen] = useState(false);

  // Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      error('Required Fields', 'Please enter your mobile/email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        error('Login Failed', data.error || 'Invalid credentials');
        return;
      }

      success('Welcome Back!', `Signed in as ${data.user.name}`);
      window.location.href = data.redirectUrl || '/';
    } catch {
      error('Connection Error', 'Failed to reach authentication server');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOtp = async () => {
    if (!identifier || identifier.length < 6) {
      warning('Invalid Input', 'Please enter a valid 10-digit mobile number or email');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, purpose: 'LOGIN' }),
      });
      const data = await res.json();

      if (!res.ok) {
        error('OTP Error', data.error || 'Failed to dispatch OTP');
        return;
      }

      setOtpSent(true);
      setDemoOtpBanner(data.demoCode);
      setResendTimer(30);

      // Countdown timer for 30s resend
      const interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      success('Demo OTP Sent', `Code dispatched to sandbox channel: ${data.demoCode}`);
    } catch {
      error('Error', 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      warning('Invalid Code', 'Please enter the 6-digit OTP code');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, code: otpCode, purpose: 'LOGIN' }),
      });
      const data = await res.json();

      if (!res.ok) {
        error('Verification Failed', data.error || 'Invalid OTP code');
        return;
      }

      if (!data.userExists) {
        warning('Account Not Found', 'No account associated with this number. Please complete sign up.');
        router.push(`/auth/signup?mobile=${encodeURIComponent(identifier)}`);
        return;
      }

      success('Verified!', 'Logged in successfully via OTP');
      window.location.href = data.redirectUrl || '/';
    } catch {
      error('Connection Error', 'Failed to verify OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Top Header Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold text-blue-100 uppercase tracking-widest border border-white/20 mb-3">
            <ShieldCheck className="w-4 h-4 text-[#FFB41F]" />
            <span>Cooperative Secure Portal</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black text-white">
            Sign In to HOMEService
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm mt-1">
            Access your household bookings, family privileges, or worker portal
          </p>
        </div>

        {/* 1-Click Demo Accounts Quick Trigger */}
        <div className="bg-[#FFB41F]/15 border border-[#FFB41F]/40 backdrop-blur-md rounded-2xl p-4 mb-6 text-xs text-white">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[#FFB41F] font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Instant 1-Click Demo Logins:
            </span>
            <button
              type="button"
              onClick={() => setDemoDrawerOpen(true)}
              className="text-[11px] text-[#FFB41F] hover:underline font-bold"
            >
              All 8 Personas →
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => loginDemo('customer1')}
              className="bg-white/10 hover:bg-[#FFB41F] hover:text-[#0B1B3F] text-white border border-white/20 p-2.5 rounded-xl font-bold text-left transition flex items-center gap-2 group"
            >
              <span className="text-base">👨🏽‍💼</span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-[11px]">Customer</span>
                <span className="block text-[10px] text-blue-200 group-hover:text-blue-900 truncate">Aravind (Subscribed)</span>
              </div>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loginDemo('kumar_plumber')}
              className="bg-white/10 hover:bg-[#FFB41F] hover:text-[#0B1B3F] text-white border border-white/20 p-2.5 rounded-xl font-bold text-left transition flex items-center gap-2 group"
            >
              <span className="text-base">👨🏽‍🔧</span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-[11px]">Plumber</span>
                <span className="block text-[10px] text-blue-200 group-hover:text-blue-900 truncate">Kumar (Level 4)</span>
              </div>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loginDemo('rajesh_electrician')}
              className="bg-white/10 hover:bg-[#FFB41F] hover:text-[#0B1B3F] text-white border border-white/20 p-2.5 rounded-xl font-bold text-left transition flex items-center gap-2 group"
            >
              <span className="text-base">⚡</span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-[11px]">Electrician</span>
                <span className="block text-[10px] text-blue-200 group-hover:text-blue-900 truncate">Rajesh (Level 5)</span>
              </div>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => loginDemo('coop_admin')}
              className="bg-white/10 hover:bg-[#FFB41F] hover:text-[#0B1B3F] text-white border border-white/20 p-2.5 rounded-xl font-bold text-left transition flex items-center gap-2 group"
            >
              <span className="text-base">🏛️</span>
              <div className="min-w-0">
                <span className="block truncate font-bold text-[11px]">Coop Admin</span>
                <span className="block text-[10px] text-blue-200 group-hover:text-blue-900 truncate">Tambaram Society</span>
              </div>
            </button>
          </div>
        </div>

        {/* White Login Card */}
        <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-2xl">
          {/* Tabs: Password vs OTP */}
          <div className="flex bg-gray-100 p-1 rounded-full mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('PASSWORD')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'PASSWORD'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('OTP')}
              className={`flex-1 py-2.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                activeTab === 'OTP'
                  ? 'bg-white text-[#0B1B3F] shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Instant OTP Login</span>
            </button>
          </div>

          {/* Sandbox DEMO OTP Banner */}
          {demoOtpBanner && (
            <div className="mb-6 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                <span className="font-bold">DEMO OTP CODE:</span>
                <span className="font-mono text-base font-black tracking-widest text-[#0B1B3F]">
                  {demoOtpBanner}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOtpCode(demoOtpBanner)}
                className="text-[11px] bg-amber-200 hover:bg-amber-300 font-bold px-2 py-0.5 rounded text-amber-900"
              >
                Auto-fill
              </button>
            </div>
          )}

          {activeTab === 'PASSWORD' ? (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number or Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or customer@homeservice.coop"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF] focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('OTP')}
                    className="text-[11px] font-semibold text-[#1F6BFF] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF] focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Note: 5 consecutive failures triggers a 15-min safety lockout.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-amber w-full justify-center text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In with Password'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF] focus:border-transparent"
                  />
                  <button
                    type="button"
                    disabled={isLoading || resendTimer > 0}
                    onClick={handleSendOtp}
                    className="bg-blue-50 text-[#1F6BFF] hover:bg-blue-100 font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 shrink-0"
                  >
                    {resendTimer > 0 ? `Resend (${resendTimer}s)` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full text-center font-mono tracking-widest text-lg px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1F6BFF] focus:border-transparent"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 text-center">
                    Code valid for 5 minutes • Max 3 attempts
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !otpSent}
                className="btn-amber w-full justify-center text-sm font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify OTP & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Bottom Link to Sign Up */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-600 space-y-2">
            <p>
              Don't have an account yet?{' '}
              <Link href="/auth/signup" className="font-bold text-[#1F6BFF] hover:underline">
                Create Customer Account
              </Link>
            </p>
            <p>
              Are you a skilled worker?{' '}
              <Link href="/provider/register" className="font-bold text-[#FF5A1F] hover:underline">
                Register as Service Provider
              </Link>
            </p>
          </div>
        </div>
      </div>

      <DemoAccountsDrawer
        isOpen={demoDrawerOpen}
        onClose={() => setDemoDrawerOpen(false)}
      />
    </div>
  );
}
