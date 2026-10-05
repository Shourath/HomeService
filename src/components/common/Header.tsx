'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Phone,
  ArrowRight,
  Globe,
  Bell,
  Menu,
  X,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageCode } from '@/i18n/config';
import { useAuth } from './AuthContext';
import { DemoAccountsDrawer } from './DemoAccountsDrawer';

export function Header() {
  const { language, setLanguage, t, languages } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoDrawerOpen, setDemoDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <>
      <header className="sticky top-0 z-40 w-full shell-gradient border-b border-white/10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 flex items-center justify-center text-[#FFB41F] shadow-md group-hover:scale-105 transition">
                <ShieldCheck className="w-7 h-7 text-[#FFB41F]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-2xl tracking-wider uppercase font-bold text-white">
                    HOME<span className="text-[#FFB41F]">Service</span>
                  </span>
                  <span className="bg-[#1FA85A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest">
                    COOP
                  </span>
                </div>
                <span className="text-[11px] text-blue-200 tracking-tight -mt-1 font-medium">
                  Labour Welfare Cooperative
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-white/90 hover:text-white transition">
                {t.nav.home}
              </Link>
              <Link href="/services" className="text-white/90 hover:text-white transition">
                {t.nav.services}
              </Link>
              <Link href="/membership" className="text-white/90 hover:text-white transition">
                {t.nav.membership}
              </Link>
              <Link href="/family" className="text-white/90 hover:text-white transition">
                {t.nav.family}
              </Link>

              {user?.role === 'WORKER' && (
                <Link href="/provider" className="text-[#FFB41F] font-bold hover:text-white transition">
                  {t.nav.provider_portal}
                </Link>
              )}
              {(user?.role === 'COOPERATIVE_ADMIN' || user?.role === 'FEDERATION_ADMIN') && (
                <Link href="/admin" className="text-[#FFB41F] font-bold hover:text-white transition">
                  {t.nav.admin_portal}
                </Link>
              )}
              {user?.role === 'CUSTOMER' && (
                <Link href="/customer" className="text-[#FFB41F] font-bold hover:text-white transition">
                  My Dashboard
                </Link>
              )}
            </nav>

            {/* Right Tools: Phone Pill, Lang Switcher, Demo Button, Amber CTA */}
            <div className="hidden md:flex items-center gap-3">
              {/* Phone pill */}
              <a
                href="tel:18004259675"
                className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm transition"
              >
                <Phone className="w-3.5 h-3.5 text-[#FFB41F]" />
                <span>1800-425-WORK</span>
              </a>

              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1.5 backdrop-blur-sm transition"
                  title="Switch Language"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-200" />
                  <span>{currentLangObj.nativeName}</span>
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white text-[#0B1B3F] rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l.code as LanguageCode);
                          setLangMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-blue-50 transition ${
                          language === l.code ? 'font-bold text-[#1F6BFF] bg-blue-50/70' : 'text-gray-700'
                        }`}
                      >
                        <span>{l.nativeName}</span>
                        <span className="text-gray-400 text-[10px]">{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Demo Accounts Drawer Trigger */}
              <button
                onClick={() => setDemoDrawerOpen(true)}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold px-3.5 py-2 rounded-full flex items-center gap-1.5 shadow-sm transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFB41F]" />
                <span>{t.nav.demo_accounts}</span>
              </button>

              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white relative transition"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#FF5A1F] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white text-[#0B1B3F] rounded-2xl shadow-2xl border border-gray-100 p-3 z-50 animate-in fade-in">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          Notifications ({unreadCount})
                        </span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-[11px] text-[#1F6BFF] hover:underline font-semibold"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 mt-1">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-gray-500 p-4 text-center">No notifications yet</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.isRead ? 'opacity-70' : 'bg-blue-50/50'}`}>
                              <p className="font-semibold text-gray-900">{n.title}</p>
                              <p className="text-gray-600 text-[11px] mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Avatar / Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href={
                      user.role === 'WORKER'
                        ? '/provider'
                        : user.role.includes('ADMIN')
                        ? '/admin'
                        : '/customer'
                    }
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 rounded-full pl-2 pr-3.5 py-1.5 text-xs font-semibold text-white transition"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#FFB41F] text-[#0B1B3F] flex items-center justify-center font-bold text-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="truncate max-w-[100px]">{user.name || user.role}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition"
                    title={t.nav.logout}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition"
                >
                  {t.nav.sign_in}
                </Link>
              )}

              {/* Primary Amber Pill CTA with circular orange arrow */}
              <Link
                href="/book"
                className="btn-amber text-sm font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition group"
              >
                <span>{t.hero.cta_book}</span>
                <span className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center group-hover:translate-x-0.5 transition">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            {/* Mobile hamburger menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setDemoDrawerOpen(true)}
                className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-full"
              >
                Demo
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-white/10 text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0A2A8C] border-b border-white/15 px-4 pt-3 pb-6 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-white font-medium"
            >
              {t.nav.home}
            </Link>
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-white font-medium"
            >
              {t.nav.services}
            </Link>
            <Link
              href="/membership"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-white font-medium"
            >
              {t.nav.membership}
            </Link>
            <Link
              href="/family"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-white font-medium"
            >
              {t.nav.family}
            </Link>
            <Link
              href="/emergency"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#FF5A1F] font-bold"
            >
              {t.emergency.button}
            </Link>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href={user.role === 'WORKER' ? '/provider' : user.role.includes('ADMIN') ? '/admin' : '/customer'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary w-full text-center"
                  >
                    Dashboard ({user.name || user.role})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white/70 py-2 text-xs text-center"
                  >
                    {t.nav.logout}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center"
                >
                  {t.nav.sign_in}
                </Link>
              )}

              <Link
                href="/book"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-amber w-full justify-between"
              >
                <span>{t.hero.cta_book}</span>
                <span className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Demo Accounts Drawer */}
      <DemoAccountsDrawer
        isOpen={demoDrawerOpen}
        onClose={() => setDemoDrawerOpen(false)}
      />
    </>
  );
}
