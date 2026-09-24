'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookingAPI } from '@/services/api';
import { Luggage, Plane, Hotel, CheckCircle2, Ticket, ArrowRight, User as UserIcon } from 'lucide-react';

export default function MyTripsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      bookingAPI.getUserBookings()
        .then((data) => setBookings(data || []))
        .catch((err) => console.error('Failed to load user bookings', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold mb-2">
            <Luggage className="w-4 h-4 text-sky-400" />
            <span>Traveler Dashboard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">My Trips & Booking Passes</h1>
          <p className="text-slate-400 text-sm mt-1">View your confirmed flight e-tickets, hotel vouchers, and AI itineraries</p>
        </div>

        <Link
          href="/ai-agent"
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 w-fit"
        >
          <span>Plan New Trip with AI</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Bookings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-sky-400" /> Confirmed Booking Receipts
          </h2>
          <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full font-medium">
            Sandbox Test Receipts
          </span>
        </div>

        {loading ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
            Fetching your booking history...
          </div>
        ) : !user ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4">
            <UserIcon className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Sign In to View Trips</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Please log in to your account to view saved itineraries and booking history.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-sm"
            >
              Log In Now
            </Link>
          </div>
        ) : bookings.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-white/10 space-y-4">
            <Luggage className="w-12 h-12 text-sky-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Bookings Yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              You haven't completed any flight or hotel bookings yet. Search flights or use our AI agent to start planning!
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/flights" className="px-4 py-2 rounded-xl bg-sky-500 text-white font-semibold text-xs">
                Search Flights
              </Link>
              <Link href="/hotels" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs">
                Search Hotels
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden group">
                
                <div className="flex items-center justify-between border-b border-dark-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      {booking.type === 'FLIGHT' ? <Plane className="w-4 h-4" /> : <Hotel className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">{booking.type} BOOKING</span>
                      <div className="text-[11px] text-slate-400">{new Date(booking.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{booking.status}</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking ID:</span>
                    <span className="font-mono font-bold text-sky-400">{booking.providerBookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Provider:</span>
                    <span className="text-slate-200 uppercase font-semibold">{booking.provider}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Passenger / Guest:</span>
                    <span className="text-white font-semibold">{booking.customerDetails?.name || user.name}</span>
                  </div>
                  <div className="flex justify-between border-t border-dark-border pt-2 text-sm">
                    <span className="text-slate-400">Total Paid:</span>
                    <span className="font-black text-white">₹{booking.amount?.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold text-center">
                  TEST BOOKING — NO REAL TICKET ISSUED
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
