'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { travelAPI } from '@/services/api';
import { Plane, Filter, Clock, Luggage, ShieldCheck, ChevronRight, AlertCircle } from 'lucide-react';

function FlightSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [from, setFrom] = useState(searchParams.get('from') || 'Delhi (DEL)');
  const [to, setTo] = useState(searchParams.get('to') || 'Goa (GOI)');
  const [date, setDate] = useState(searchParams.get('date') || '2026-10-12');
  const [passengers, setPassengers] = useState(Number(searchParams.get('passengers')) || 1);
  const [cabinClass, setCabinClass] = useState('economy');
  const [sortBy, setSortBy] = useState('cheapest');
  const [stopsFilter, setStopsFilter] = useState('all');
  const [maxPrice, setMaxPrice] = useState(20000);

  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      const data = await travelAPI.searchFlights({
        origin: from,
        destination: to,
        departureDate: date,
        passengers,
        cabinClass,
        sortBy,
        stopsFilter,
        maxPrice,
      });
      setFlights(data.flights || []);
    } catch (err) {
      console.error('Failed to search flights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, [sortBy, stopsFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFlights();
  };

  const handleBookClick = (flight) => {
    setSelectedFlight(flight);
  };

  const handleProceedToCheckout = () => {
    if (!selectedFlight) return;
    const query = new URLSearchParams({
      type: 'FLIGHT',
      offerId: selectedFlight.id,
      amount: selectedFlight.price.toString(),
      details: JSON.stringify(selectedFlight)
    }).toString();
    router.push(`/checkout?${query}`);
  };

  return (
    <div className="space-y-8">
      {/* Search Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">From</label>
            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Departure Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Passengers</label>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            >
              <option value={1} className="bg-dark-card">1 Passenger</option>
              <option value={2} className="bg-dark-card">2 Passengers</option>
              <option value={4} className="bg-dark-card">4 Passengers</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition-all"
          >
            Update Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6 glass-panel p-5 rounded-2xl border border-white/10 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <Filter className="w-4 h-4 text-sky-400" />
              <span>Filters & Sorting</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">Sort Flights By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs outline-none"
            >
              <option value="cheapest" className="bg-dark-card">Cheapest Price</option>
              <option value="fastest" className="bg-dark-card">Fastest Duration</option>
              <option value="expensive" className="bg-dark-card">Highest Price</option>
              <option value="departure" className="bg-dark-card">Departure Time</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">Stops</label>
            <div className="space-y-1.5">
              {[
                { id: 'all', label: 'All Flights' },
                { id: 'direct', label: 'Non-stop Direct Only' },
                { id: '1stop', label: '1 Stop' },
              ].map((opt) => (
                <label key={opt.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="stops"
                    checked={stopsFilter === opt.id}
                    onChange={() => setStopsFilter(opt.id)}
                    className="accent-sky-500"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Max Price</span>
              <span className="text-sky-400 font-bold">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="3000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>

        {/* Flight Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Available Flight Offers <span className="text-sm font-normal text-slate-400">({flights.length} offers)</span>
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              Live Real-Time Pricing
            </span>
          </div>

          {loading ? (
            <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-300 text-sm">Searching available flights with Duffel Engine...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-white font-semibold text-base">No flights match your filters</p>
              <p className="text-slate-400 text-xs">Try increasing max price or resetting stop filters.</p>
            </div>
          ) : (
            flights.map((flight) => (
              <div key={flight.id} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-sm">
                      {flight.airlineCode || 'FL'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{flight.airline}</span>
                        <span className="text-xs text-slate-400 px-2 py-0.5 rounded bg-dark-bg border border-dark-border">{flight.flightNumber}</span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span>{flight.cabinClass}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Luggage className="w-3.5 h-3.5 text-sky-400" /> {flight.baggage}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-white">{flight.departureTime?.split('T')[1]?.substring(0, 5)}</div>
                      <div className="text-xs text-slate-400 font-semibold">{flight.origin}</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-400" /> {flight.duration}
                      </div>
                      <div className="w-24 h-[2px] bg-sky-500/40 my-1 relative">
                        <Plane className="w-3.5 h-3.5 text-sky-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-card rounded-full" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-medium">
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
                      </div>
                    </div>

                    <div>
                      <div className="text-lg font-bold text-white">{flight.arrivalTime?.split('T')[1]?.substring(0, 5)}</div>
                      <div className="text-xs text-slate-400 font-semibold">{flight.destination}</div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-dark-border">
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">₹{flight.price?.toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400">Total for {passengers} traveler(s)</div>
                    </div>
                    <button
                      onClick={() => handleBookClick(flight)}
                      className="mt-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1"
                    >
                      <span>Select Flight</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Flight Confirmation Modal */}
      {selectedFlight && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-400" /> Flight Selection Summary
              </h3>
              <button
                onClick={() => setSelectedFlight(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="font-bold text-white">{selectedFlight.airline} ({selectedFlight.flightNumber})</span>
                <span className="text-sky-400 font-semibold text-xs px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30">
                  {selectedFlight.cabinClass}
                </span>
              </div>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>{selectedFlight.origin} ➔ {selectedFlight.destination}</span>
                <span>{selectedFlight.duration} ({selectedFlight.stops === 0 ? 'Direct' : '1-stop'})</span>
              </div>
              <div className="text-xs text-slate-400 border-t border-dark-border pt-2 flex justify-between">
                <span>Baggage Allowance:</span>
                <span className="text-slate-200">{selectedFlight.baggage}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>TEST BOOKING — Requires explicit human confirmation before Razorpay test payment.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs text-slate-400">Total Price</div>
                <div className="text-2xl font-black text-white">₹{selectedFlight.price?.toLocaleString()}</div>
              </div>
              <button
                onClick={handleProceedToCheckout}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/30 transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlightsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
          Loading Flight Search Engine...
        </div>
      }>
        <FlightSearchContent />
      </Suspense>
    </div>
  );
}
