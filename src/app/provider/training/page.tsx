'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Award, CheckCircle2, Clock, Play, ArrowRight } from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

export default function ProviderTrainingPage() {
  const { user } = useAuth();
  const { success } = useToast();

  const [courses, setCourses] = useState([
    {
      id: 'course-1',
      title: 'Occupational Safety & High Voltage Protocols',
      authority: 'Central Labour Institute / NSDC',
      duration: '4 Hours',
      modules: 6,
      status: 'COMPLETED',
      score: 94,
      certId: 'NSDC-SAF-2026-88',
    },
    {
      id: 'course-2',
      title: 'Advanced Diagnostic Faucets & Hydrostatic Testing',
      authority: 'Tamil Nadu Artisans Guild',
      duration: '6 Hours',
      modules: 8,
      status: 'ENROLLED',
      score: null,
      certId: null,
    },
    {
      id: 'course-3',
      title: 'Customer Etiquette & Household Service Standards',
      authority: 'Labour Cooperative Federation',
      duration: '2 Hours',
      modules: 4,
      status: 'AVAILABLE',
      score: null,
      certId: null,
    },
    {
      id: 'course-4',
      title: 'Smart Home IoT & Hybrid Inverter Installation',
      authority: 'Skill India Mission',
      duration: '8 Hours',
      modules: 10,
      status: 'AVAILABLE',
      score: null,
      certId: null,
    },
  ]);

  const handleEnroll = (id: string, title: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'ENROLLED' } : c))
    );
    success('Enrolled!', `You are now enrolled in "${title}". Free cooperative training access granted.`);
  };

  const handleComplete = (id: string, title: string) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: 'COMPLETED', score: 92, certId: `NSDC-${Math.floor(1000 + Math.random() * 9000)}` }
          : c
      )
    );
    success('Assessment Passed! 📜', `Certificate generated for "${title}". Your rank qualification has been updated.`);
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <span className="text-[#FFB41F] text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full">
              Skills Advancement
            </span>
            <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight font-black mt-1">
              Cooperative Technical Training
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
              Govt NSDC / ITI accredited courses to upgrade your artisan rank from Level 1 up to Level 5
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl border border-gray-200 bg-gray-50/50 hover:bg-white transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-200/60 px-2 py-0.5 rounded">
                      {c.authority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        c.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : c.status === 'ENROLLED'
                          ? 'bg-blue-100 text-[#1F6BFF]'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#0B1B3F] mt-1">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {c.duration} • {c.modules} Interactive Video Modules
                  </p>

                  {c.status === 'COMPLETED' && (
                    <div className="mt-3 p-2 bg-green-50 rounded-xl text-[11px] text-green-900 border border-green-200 flex items-center justify-between">
                      <span>Assessment Score: {c.score}%</span>
                      <span className="font-mono font-bold">{c.certId}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-200/80">
                  {c.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleEnroll(c.id, c.title)}
                      className="btn-amber w-full justify-center text-xs font-bold py-2.5"
                    >
                      <span>Enroll in Course (Free)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {c.status === 'ENROLLED' && (
                    <button
                      onClick={() => handleComplete(c.id, c.title)}
                      className="bg-[#1F6BFF] hover:bg-blue-700 text-white font-bold text-xs w-full py-2.5 rounded-full transition flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Take Assessment & Certify</span>
                    </button>
                  )}

                  {c.status === 'COMPLETED' && (
                    <div className="text-center text-xs font-bold text-[#1FA85A] flex items-center justify-center gap-1 py-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Artisan Certified ✓</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
