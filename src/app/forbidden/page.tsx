import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-20 px-4 sm:px-6 flex items-center justify-center">
      <div className="panel-white p-8 sm:p-12 max-w-md w-full text-center shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-100 text-[#E5383B] flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="bg-red-100 text-red-800 text-xs font-black uppercase px-3 py-1 rounded-full">
          403 Access Denied
        </span>

        <h1 className="font-display text-3xl font-bold uppercase text-[#0B1B3F] tracking-tight">
          Role Guarded Route
        </h1>

        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Your current account role does not have authorization to view this cooperative portal. Please switch to an appropriate role or return to your designated dashboard.
        </p>

        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            href="/"
            className="btn-amber w-full justify-center text-xs font-bold py-3 shadow-md"
          >
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-xs font-bold text-[#1F6BFF] hover:underline py-1"
          >
            Sign in with a different account →
          </Link>
        </div>
      </div>
    </div>
  );
}
