'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function ProviderAvailabilityPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [schedule, setSchedule] = useState(
    DAYS.map((day, idx) => ({
      day,
      enabled: idx < 6, // Mon - Sat enabled
      start: '08:00',
      end: '18:00',
    }))
  );

  const toggleDay = (idx: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const updateTime = (idx: number, field: 'start' | 'end', val: string) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: val } : d))
    );
  };

  const handleSave = () => {
    success('Schedule Saved', 'Working hours and dispatch schedule updated.');
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Artisan Availability
            </span>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-black mt-1">
              Working Hours & Schedule
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Set the days and time slots when the cooperative matching algorithm can dispatch jobs to you
            </p>
          </div>

          <Link
            href="/provider"
            className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition self-start sm:self-auto"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="panel-white p-6 sm:p-10 border border-gray-100 shadow-2xl space-y-6">
          <div className="space-y-3">
            {schedule.map((item, idx) => (
              <div
                key={item.day}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.enabled
                    ? 'border-[#1F6BFF]/30 bg-blue-50/40'
                    : 'border-gray-200 bg-gray-50/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={() => toggleDay(idx)}
                    className="w-4 h-4 rounded text-[#1F6BFF] focus:ring-[#1F6BFF]"
                  />
                  <span className="font-bold text-sm text-[#0B1B3F]">{item.day}</span>
                </div>

                {item.enabled ? (
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="time"
                      value={item.start}
                      onChange={(e) => updateTime(idx, 'start', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={item.end}
                      onChange={(e) => updateTime(idx, 'end', e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">Day Off (No dispatches)</span>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">Automatic calendar synchronization</span>
            <button onClick={handleSave} className="btn-amber text-xs sm:text-sm font-bold shadow-md">
              Save Schedule Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
