'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { paymentAPI, bookingAPI } from '@/services/api';
import { ShieldCheck, CheckCircle2, AlertCircle, Plane, Hotel, CreditCard } from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const bookingType = searchParams.get('type') || 'FLIGHT';
  const offerId = searchParams.get('offerId') || '';
  const amount = Number(searchParams.get('amount')) || 4200;
  
  let offerDetails = null;
  try {
    const rawDetails = searchParams.get('details');
    if (rawDetails) offerDetails = JSON.parse(rawDetails);
  } catch (e) {
    console.error('Failed to parse offer details from query', e);
  }

  const [passengerName, setPassengerName] = useState(user?.name || 'Rachit Sharma');
  const [passengerEmail, setPassengerEmail] = useState(user?.email || 'rachit@example.com');
  const [humanConfirmed, setHumanConfirmed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setError('');

    if (!humanConfirmed) {
      setError('Please explicitly check the human confirmation box before proceeding.');
      return;
    }

    setLoading(true);
    try {
      const order = await paymentAPI.createOrder({
        bookingType,
        amount,
        currency: 'INR'
      });

      const verification = await paymentAPI.verifyPayment({
        orderId: order.orderId,
        paymentId: `pay_test_${Date.now()}`,
        signature: `mock_sig_${Date.now()}`
      });

      if (!verification.verified) {
        throw new Error('Payment signature verification failed.');
      }

      let bookingRes;
      if (bookingType === 'FLIGHT') {
        bookingRes = await bookingAPI.bookFlight({
          flightDetails: offerDetails || { offerId, price: amount, airline: 'IndiGo' },
          passengerDetails: { name: passengerName, email: passengerEmail },
          amount
        });
      } else {
        bookingRes = await bookingAPI.bookHotel({
          hotelDetails: offerDetails || { offerId, price: amount, name: 'Resort' },
          guestDetails: { name: passengerName, email: passengerEmail },
          amount
        });
      }

      setBookingResult(bookingRes);
      setSuccess(true);
    } catch (err) {
      console.error('Payment checkout failed', err);
      setError(err.response?.data?.detail || err.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success && bookingResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            Booking Confirmed
          </span>
          <h2 className="text-3xl font-extrabold text-white">Payment & Booking Successful!</h2>
          
          <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Provider Booking ID:</span>
              <span className="font-mono font-bold text-sky-400">{bookingResult.providerBookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Amount Paid:</span>
              <span className="font-bold text-white">₹{bookingResult.amount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer Name:</span>
              <span className="text-white">{passengerName}</span>
            </div>
            <div className="flex justify-between border-t border-dark-border pt-2 text-amber-300">
              <span>Status:</span>
              <span className="font-bold">TEST BOOKING — NO REAL TICKET ISSUED</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/my-trips')}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-xl shadow-sky-500/30"
          >
            Go to My Trips Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Human-in-the-Loop Financial Confirmation</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Secure Checkout</h1>
        <p className="text-slate-400 text-sm">Review details and authorize test payment gateway order</p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              {bookingType === 'FLIGHT' ? <Plane className="w-4 h-4" /> : <Hotel className="w-4 h-4" />}
              {bookingType} OFFER SUMMARY
            </span>
            <span className="text-xs text-slate-400">Sandbox Test Mode</span>
          </div>

          {offerDetails ? (
            <div className="space-y-1 text-sm text-white font-bold">
              <div>{offerDetails.airline || offerDetails.name}</div>
              <div className="text-xs font-normal text-slate-400">{offerDetails.origin ? `${offerDetails.origin} ➔ ${offerDetails.destination}` : offerDetails.location}</div>
            </div>
          ) : (
            <div className="text-xs text-slate-300">Offer ID: {offerId}</div>
          )}

          <div className="pt-2 border-t border-dark-border flex justify-between items-center">
            <span className="text-xs text-slate-400">Total Payable Amount</span>
            <span className="text-2xl font-black text-white">₹{amount.toLocaleString()}</span>
          </div>
        </div>

        <form onSubmit={handleProcessPayment} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Passenger / Guest Full Name</label>
              <input
                type="text"
                required
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:border-sky-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address for E-Ticket</label>
              <input
                type="email"
                required
                value={passengerEmail}
                onChange={(e) => setPassengerEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={humanConfirmed}
                onChange={(e) => setHumanConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-sky-500 rounded"
              />
              <span className="text-xs text-slate-200 leading-relaxed font-semibold">
                I explicitly confirm that I want to proceed with this booking transaction. I understand this is running in sandbox demo mode with Razorpay test credentials.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !humanConfirmed}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authorizing & Verifying Payment...</span>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay ₹{amount.toLocaleString()} via Razorpay Sandbox</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-12 text-center text-slate-400">Loading Checkout Gateway...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
