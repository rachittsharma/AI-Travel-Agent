'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { travelAPI } from '@/services/api';
import { Hotel, Filter, Star, MapPin, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [city, setCity] = useState(searchParams.get('city') || 'Goa');
  const [checkin, setCheckin] = useState(searchParams.get('checkin') || '2026-10-12');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [rooms, setRooms] = useState(1);
  const [nights, setNights] = useState(3);

  const [sortBy, setSortBy] = useState('recommended');
  const [minRating, setMinRating] = useState(4.0);
  const [maxPrice, setMaxPrice] = useState(40000);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await travelAPI.searchHotels({
        city,
        guests,
        rooms,
        nights,
        minRating,
        maxPrice,
        sortBy,
      });
      setHotels(data.hotels || []);
    } catch (err) {
      console.error('Failed to search hotels', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [sortBy, minRating]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHotels();
  };

  const handleBookClick = (hotel) => {
    setSelectedHotel(hotel);
  };

  const handleProceedToCheckout = () => {
    if (!selectedHotel) return;
    const query = new URLSearchParams({
      type: 'HOTEL',
      offerId: selectedHotel.id,
      amount: selectedHotel.totalPrice.toString(),
      details: JSON.stringify(selectedHotel)
    }).toString();
    router.push(`/checkout?${query}`);
  };

  return (
    <div className="space-y-8">
      {/* Search Header Bar */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
              placeholder="Goa, Manali, Jaipur, etc."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Check-in Date</label>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Nights</label>
            <select
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            >
              <option value={1} className="bg-dark-card">1 Night</option>
              <option value={3} className="bg-dark-card">3 Nights</option>
              <option value={5} className="bg-dark-card">5 Nights</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Guests & Rooms</label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm outline-none focus:border-sky-500"
            >
              <option value={1} className="bg-dark-card">1 Guest, 1 Room</option>
              <option value={2} className="bg-dark-card">2 Guests, 1 Room</option>
              <option value={4} className="bg-dark-card">4 Guests, 2 Rooms</option>
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
              <span>Filter Hotels</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-white text-xs outline-none"
            >
              <option value="recommended" className="bg-dark-card">Recommended</option>
              <option value="rating" className="bg-dark-card">Guest Rating (High to Low)</option>
              <option value="cheapest" className="bg-dark-card">Price (Low to High)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">Min Rating</label>
            <div className="flex gap-2">
              {[3.5, 4.0, 4.5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinRating(star)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                    minRating === star
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-dark-bg border-dark-border text-slate-400'
                  }`}
                >
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>{star}+</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400">Max Total Price</span>
              <span className="text-sky-400 font-bold">₹{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </div>
        </div>

        {/* Hotel Results List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Available Hotels in {city} <span className="text-sm font-normal text-slate-400">({hotels.length} properties)</span>
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
              Verified Inventory
            </span>
          </div>

          {loading ? (
            <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-300 text-sm">Searching verified hotels & luxury resorts...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
              <p className="text-white font-semibold text-base">No hotels match your filters</p>
              <p className="text-slate-400 text-xs">Try lowering minimum rating or increasing max budget.</p>
            </div>
          ) : (
            hotels.map((hotel) => (
              <div key={hotel.id} className="glass-card rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row group">
                <div className="relative md:w-64 h-48 md:h-auto overflow-hidden flex-shrink-0">
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md text-amber-300 text-xs font-bold flex items-center gap-1 border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{hotel.rating}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{hotel.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                      <span>{hotel.location}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {hotel.amenities?.map((amenity, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-slate-300">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-dark-border flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">₹{hotel.pricePerNight?.toLocaleString()} / night</div>
                      <div className="text-xl font-extrabold text-white">₹{hotel.totalPrice?.toLocaleString()} <span className="text-xs font-normal text-slate-400">total ({nights} nights)</span></div>
                    </div>

                    <button
                      onClick={() => handleBookClick(hotel)}
                      className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1"
                    >
                      <span>Select Room</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Hotel Selection Modal */}
      {selectedHotel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full glass-panel p-6 rounded-3xl border border-white/20 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Hotel className="w-5 h-5 text-sky-400" /> Hotel Booking Summary
              </h3>
              <button
                onClick={() => setSelectedHotel(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-base">{selectedHotel.name}</h4>
                  <p className="text-xs text-slate-400">{selectedHotel.location}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-3 h-3 fill-amber-400" /> {selectedHotel.rating}
                </div>
              </div>

              <div className="text-xs text-slate-300 border-t border-dark-border pt-2 flex justify-between">
                <span>Room Type:</span>
                <span className="font-semibold text-white">{selectedHotel.roomType}</span>
              </div>
              <div className="text-xs text-slate-300 flex justify-between">
                <span>Stay Duration:</span>
                <span>{nights} Nights ({guests} Guests)</span>
              </div>
              <div className="text-xs text-emerald-400 pt-1">
                ✓ {selectedHotel.cancellationPolicy}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>TEST BOOKING — Requires explicit human confirmation before Razorpay test payment.</span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-xs text-slate-400">Total Price ({nights} nights)</div>
                <div className="text-2xl font-black text-white">₹{selectedHotel.totalPrice?.toLocaleString()}</div>
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

export default function HotelsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-400 text-sm">
          Loading Hotel Search Engine...
        </div>
      }>
        <HotelSearchContent />
      </Suspense>
    </div>
  );
}
