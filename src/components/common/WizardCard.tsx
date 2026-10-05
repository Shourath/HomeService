'use client';

import React, { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface WizardCardProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle?: string;
  onBack?: () => void;
  onNext?: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isLoading?: boolean;
  children: ReactNode;
}

export function WizardCard({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  onBack,
  onNext,
  isNextDisabled = false,
  nextLabel = 'Next Step',
  backLabel = 'Back',
  isLoading = false,
  children,
}: WizardCardProps) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      {/* Progress pill above panel */}
      <div className="flex items-center justify-between text-xs font-bold text-blue-100 uppercase tracking-wider mb-3 px-3">
        <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-blue-200">{progressPercent}% Completed</span>
      </div>

      {/* Progress Bar Line */}
      <div className="w-full bg-white/20 h-2 rounded-full mb-6 overflow-hidden backdrop-blur-sm">
        <div
          className="h-full bg-[#FFB41F] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* White Panel */}
      <div className="bg-white rounded-panel p-6 sm:p-10 shadow-2xl border border-gray-100 relative">
        {/* Step Header */}
        <div className="mb-8 pb-4 border-b border-gray-100">
          <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase text-[#0B1B3F] tracking-tight">
            {stepTitle}
          </h2>
          {stepSubtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">{stepSubtitle}</p>
          )}
        </div>

        {/* Form Body */}
        <div className="min-h-[280px]">{children}</div>

        {/* Action Buttons: Desktop & Mobile */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between gap-4">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{backLabel}</span>
            </button>
          ) : (
            <div />
          )}

          {onNext && (
            <button
              type="button"
              onClick={onNext}
              disabled={isNextDisabled || isLoading}
              className="btn-amber text-xs sm:text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:pointer-events-none group"
            >
              <span>{isLoading ? 'Processing...' : nextLabel}</span>
              <span className="w-7 h-7 rounded-full bg-[#FF5A1F] text-white flex items-center justify-center group-hover:translate-x-0.5 transition">
                {currentStep === totalSteps ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
