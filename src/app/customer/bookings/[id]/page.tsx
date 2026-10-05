'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  CreditCard,
  Star,
  Download,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/components/common/AuthContext';
import { useToast } from '@/components/common/ToastContext';

const TIMELINE_STEPS = [
  { key: 'REQUESTED', label: 'Requested' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'ON_THE_WAY', label: 'On The Way' },
  { key: 'ARRIVED', label: 'Arrived' },
  { key: 'SERVICE_STARTED', label: 'Service Started' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CUSTOMER_CONFIRMED', label: 'Customer Confirmed' },
  { key: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { key: 'RATED', label: 'Rated' },
];

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { success, error, warning } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Finish Wizard state (steps 1 to 4)
  // Step 1: Confirm completion
  // Step 2: Pay
  // Step 3: Invoice PDF
  // Step 4: Rate
  const [finishStep, setFinishStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'WALLET'>('UPI');
  const [upiId, setUpiId] = useState('customer@okaxis');

  // Rating state
  const [qualityScore, setQualityScore] = useState(5);
  const [professionalismScore, setProfessionalismScore] = useState(5);
  const [timelinessScore, setTimelinessScore] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${params.id}`);
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // 3s polling for live job status updates as requested in Section 4
    const interval = setInterval(fetchBooking, 3000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (loading) {
    return (
      <div className="shell-gradient min-h-[calc(100vh-80px)] py-16 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[#FFB41F] rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="shell-gradient min-h-[calc(100vh-80px)] py-16 flex items-center justify-center text-white">
        <div className="panel-white p-8 max-w-md text-center text-[#0B1B3F]">
          <AlertCircle className="w-12 h-12 text-[#E5383B] mx-auto mb-3" />
          <h2 className="font-display text-2xl font-bold uppercase">Booking Not Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">The requested booking ID does not exist.</p>
          <Link href="/customer" className="btn-amber text-xs font-bold px-6 py-2.5">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Find index of current status in timeline
  const currentStatusIndex = TIMELINE_STEPS.findIndex((s) => s.key === booking.status);

  // Check if job completed by worker and customer needs to complete finish wizard
  const isReadyForFinishWizard =
    booking.status === 'COMPLETED' ||
    booking.status === 'CUSTOMER_CONFIRMED' ||
    booking.status === 'PAYMENT_COMPLETED' ||
    booking.status === 'RATED';

  // Step 1: Customer Confirms Job Completion
  const handleConfirmCompletion = async () => {
    try {
      setSubmittingAction(true);
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CUSTOMER_CONFIRMED',
          note: 'Customer inspected and confirmed completed craftsmanship',
        }),
      });
      if (res.ok) {
        success('Work Confirmed!', 'Proceeding to secure demo payment');
        await fetchBooking();
        setFinishStep(2);
      }
    } catch {
      error('Error', 'Failed to confirm completion');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Step 2: Pay (Demo)
  const handleProcessPayment = async () => {
    try {
      setSubmittingAction(true);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          paymentMethod,
          upiId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success('Payment Successful! 💰', 'Demo payment completed & GST invoice issued');
        await fetchBooking();
        setFinishStep(3);
      } else {
        error('Payment Failed', data.error || 'Failed to process payment');
      }
    } catch {
      error('Error', 'Failed to complete payment');
    } finally {
      setSubmittingAction(false);
    }
  };

  // Step 3: Generate and Download PDF Invoice
  const handleDownloadInvoicePdf = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(11, 27, 63);
      doc.text('HOMEService Cooperative', 20, 25);

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Labour Welfare Cooperative Federation Ltd. (Demo)', 20, 32);
      doc.text('Tax Invoice / Official Digital Receipt', 20, 37);

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 42, 190, 42);

      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);
      doc.text(`Invoice No: INV-${booking.bookingNumber}`, 20, 52);
      doc.text(`Booking No: ${booking.bookingNumber}`, 20, 59);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 66);
      doc.text(`Status: PAID (SANDBOX DEMO)`, 20, 73);

      doc.text(`Customer: ${booking.customer.fullName}`, 120, 52);
      doc.text(`Address: ${booking.customerAddress.slice(0, 30)}...`, 120, 59);
      doc.text(`Worker: ${booking.worker?.fullName || 'Assigned Artisan'}`, 120, 66);

      doc.line(20, 80, 190, 80);

      doc.setFontSize(12);
      doc.text('Description', 20, 90);
      doc.text('Amount (INR)', 150, 90);

      doc.setFontSize(10);
      doc.text(`${booking.service.name} (Labor & Service Charge)`, 20, 102);
      doc.text(`₹${booking.totalAmount - booking.platformFee - booking.cooperativeShare}`, 155, 102);

      doc.text(`Platform Infrastructure Fee (5%)`, 20, 110);
      doc.text(`₹${booking.platformFee}`, 155, 110);

      doc.text(`Cooperative Mutual Aid & Welfare (5%)`, 20, 118);
      doc.text(`₹${booking.cooperativeShare}`, 155, 118);

      doc.line(20, 126, 190, 126);

      doc.setFontSize(14);
      doc.text('Total Paid: ', 110, 138);
      doc.text(`₹${booking.totalAmount}`, 155, 138);

      doc.setFontSize(9);
      doc.setTextColor(130, 130, 130);
      doc.text('This is a computer generated cooperative invoice (Demo Environment).', 20, 160);
      doc.text('90%+ of this payment is credited directly to the member artisan.', 20, 166);

      doc.save(`Invoice_${booking.bookingNumber}.pdf`);
      success('PDF Downloaded', 'Official cooperative GST receipt saved');
    } catch {
      error('PDF Error', 'Failed to generate PDF document');
    }
  };

  // Step 4: Submit Rating
  const handleRateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmittingAction(true);
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          qualityScore,
          professionalismScore,
          timelinessScore,
          comment,
        }),
      });
      if (res.ok) {
        success('Review Submitted! ⭐️', 'Thank you for supporting cooperative workers');
        await fetchBooking();
      } else {
        error('Rating Error', 'Failed to record rating');
      }
    } catch {
      error('Error', 'Failed to submit rating');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="shell-gradient min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-white gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFB41F] text-[#0B1B3F] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
                {booking.isEmergency ? '🚨 SOS Emergency' : 'Standard Booking'}
              </span>
              <span className="text-xs text-blue-200">ID: #{booking.bookingNumber}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight font-bold mt-1">
              {booking.service.name}
            </h1>
            <p className="text-blue-100 text-xs mt-0.5">
              Scheduled: {booking.scheduledDate} at {booking.scheduledTime}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/customer"
              className="bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-semibold px-4 py-2.5 rounded-full backdrop-blur-md transition"
            >
              Back to My Bookings
            </Link>
          </div>
        </div>

        {/* Status Card & Worker Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Live Status & Vertical Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <div className="panel-white p-6 sm:p-8 border border-gray-100 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1FA85A] animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                    Live Dispatch Status
                  </span>
                </div>
                <span className="bg-blue-50 text-[#1F6BFF] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {booking.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Vertical Timeline */}
              <div className="mt-6 relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                {TIMELINE_STEPS.map((stepItem, idx) => {
                  const isDone = currentStatusIndex >= idx;
                  const isCurrent = currentStatusIndex === idx;

                  // Find timestamp from statusHistory if available
                  const historyEntry = booking.statusHistory?.find(
                    (h: any) => h.status === stepItem.key
                  );

                  return (
                    <div key={stepItem.key} className="relative flex items-start gap-4">
                      {/* Step Circle Indicator */}
                      <div
                        className={`absolute -left-6 mt-0.5 w-4 h-4 rounded-full border-2 transition-all ${
                          isCurrent
                            ? 'bg-[#FF5A1F] border-white ring-4 ring-[#FF5A1F]/30'
                            : isDone
                            ? 'bg-[#1FA85A] border-white'
                            : 'bg-white border-gray-300'
                        }`}
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#FF5A1F]'
                                : isDone
                                ? 'text-[#0B1B3F]'
                                : 'text-gray-400'
                            }`}
                          >
                            {stepItem.label}
                          </h4>
                          {historyEntry && (
                            <span className="text-[11px] text-gray-400 font-mono">
                              {new Date(historyEntry.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          )}
                        </div>
                        {historyEntry?.note && (
                          <p className="text-xs text-gray-500 mt-0.5">{historyEntry.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finish Wizard (Steps 1 to 4) when completed */}
            {isReadyForFinishWizard && (
              <div className="panel-white p-6 sm:p-8 border-2 border-[#1FA85A]/40 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#1FA85A] text-white flex items-center justify-center font-bold text-xs">
                      {finishStep}
                    </span>
                    <h3 className="font-display text-xl font-bold uppercase text-[#0B1B3F]">
                      Job Completion & Payment Wizard
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase">
                    Step {finishStep} of 4
                  </span>
                </div>

                {/* Sub-step 1: Confirm Completion */}
                {finishStep === 1 && (
                  <div className="py-6 space-y-4">
                    <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-xs text-green-900 leading-relaxed">
                      Worker has marked work completed on premises. Please inspect the craftsmanship and tap below to confirm satisfactory delivery.
                    </div>
                    <button
                      onClick={handleConfirmCompletion}
                      disabled={submittingAction}
                      className="btn-amber w-full justify-center text-sm font-bold shadow-md hover:scale-[1.01] transition"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-800" />
                      <span>Confirm Work Completed Satisfactorily</span>
                    </button>
                  </div>
                )}

                {/* Sub-step 2: Pay via Sandbox Gateway */}
                {finishStep === 2 && (
                  <div className="py-6 space-y-5">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <span className="font-bold">Total Payable: ₹{booking.totalAmount}</span>
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded">
                        SANDBOX DEMO
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {(['UPI', 'CARD', 'NET_BANKING', 'WALLET'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                            paymentMethod === method
                              ? 'border-[#1F6BFF] bg-blue-50 text-[#1F6BFF]'
                              : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          {method === 'UPI' ? 'UPI (GPay / PhonePe)' : method}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'UPI' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                          UPI ID
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                        />
                      </div>
                    )}

                    <button
                      onClick={handleProcessPayment}
                      disabled={submittingAction}
                      className="btn-amber w-full justify-center text-sm font-bold shadow-md hover:scale-[1.01] transition"
                    >
                      <span>Pay ₹{booking.totalAmount} via Demo {paymentMethod}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Sub-step 3: GST Invoice & PDF Download */}
                {finishStep === 3 && (
                  <div className="py-6 space-y-5">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-2">
                      <div className="flex justify-between font-bold text-[#0B1B3F]">
                        <span>Official Invoice Issued</span>
                        <span className="text-[#1FA85A]">PAID ✓</span>
                      </div>
                      <p className="text-gray-600">
                        Invoice ID: #{booking.invoices?.[0]?.invoiceNumber || `INV-${booking.bookingNumber}`}
                      </p>
                      <p className="text-gray-600">
                        Total Amount: ₹{booking.totalAmount}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleDownloadInvoicePdf}
                        className="btn-amber flex-1 justify-center text-xs sm:text-sm font-bold shadow-md"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download GST Invoice (PDF)</span>
                      </button>
                      <button
                        onClick={() => setFinishStep(4)}
                        className="px-5 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-bold text-[#0B1B3F]"
                      >
                        Next: Rate Worker →
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-step 4: Rate & Review */}
                {finishStep === 4 && (
                  <form onSubmit={handleRateJob} className="py-6 space-y-4">
                    <h4 className="font-bold text-sm text-[#0B1B3F]">
                      Rate Your Cooperative Artisan
                    </h4>

                    {/* Criteria 1: Quality */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Work Quality & Precision</span>
                      <div className="flex gap-1 text-[#FFB41F]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setQualityScore(star)}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= qualityScore ? 'fill-[#FFB41F]' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Criteria 2: Professionalism */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Professionalism & Courtesy</span>
                      <div className="flex gap-1 text-[#FFB41F]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setProfessionalismScore(star)}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= professionalismScore ? 'fill-[#FFB41F]' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Criteria 3: Timeliness */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-medium">Punctuality & Timeliness</span>
                      <div className="flex gap-1 text-[#FFB41F]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setTimelinessScore(star)}
                            className={`w-5 h-5 cursor-pointer ${
                              star <= timelinessScore ? 'fill-[#FFB41F]' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Feedback / Review Comment
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Write a few words to encourage your local cooperative worker..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F6BFF]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAction}
                      className="btn-amber w-full justify-center text-sm font-bold shadow-md hover:scale-[1.01] transition"
                    >
                      <span>Submit Rating & Complete Job</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Worker Card & Price Breakdown */}
          <div className="space-y-6">
            {/* Assigned Worker Profile Card */}
            {booking.worker ? (
              <div className="panel-white p-6 border border-gray-100 shadow-xl">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">
                  Assigned Cooperative Artisan
                </span>

                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl font-bold text-[#1F6BFF]">
                    👨🏽‍🔧
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#0B1B3F]">{booking.worker.fullName}</h3>
                    <p className="text-xs text-gray-500">
                      Level {booking.worker.currentLevel} Verified Artisan
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{booking.worker.ratingAvg}★</span>
                      <span className="text-gray-400 font-normal">
                        ({booking.worker.totalJobsCompleted} jobs)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2.5 text-xs">
                  <p className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-[#1F6BFF]" />
                    <span className="font-semibold text-[#0B1B3F]">{booking.worker.mobile}</span>
                  </p>
                  <p className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck className="w-4 h-4 text-[#1FA85A]" />
                    <span>Verified by Tambaram Society</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="panel-white p-6 border border-gray-100 shadow-xl text-center">
                <Clock className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                <h4 className="font-bold text-sm text-[#0B1B3F]">Broadcasting to Workers</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Nearby cooperative artisans in your zone are being notified. First acceptance confirms job.
                </p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="panel-white p-6 border border-gray-100 shadow-xl space-y-3 text-xs">
              <h4 className="font-bold text-sm text-[#0B1B3F] uppercase tracking-wider">
                Financial Breakdown
              </h4>
              <div className="flex justify-between text-gray-600">
                <span>Net Worker Pay</span>
                <span>₹{booking.workerEarnings}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Operational Fee (5%)</span>
                <span>₹{booking.platformFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Society Mutual Aid Share (5%)</span>
                <span>₹{booking.cooperativeShare}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-sm text-[#0B1B3F]">
                <span>Total Amount</span>
                <span className="font-display text-lg text-[#1F6BFF]">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
