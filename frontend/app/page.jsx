'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Plane, Hotel, Bot, Search, Users, MapPin, ArrowRight, ShieldCheck, DollarSign, Compass, Zap } from 'lucide-react';

const CITIES = [
  'Delhi (DEL)',
  'Lucknow (LKO)',
  'Mumbai (BOM)',
  'Bangalore (BLR)',
  'Goa (GOI)',
  'Jaipur (JAI)',
  'Manali',
  'Kerala (COK)',
  'Kolkata (CCU)',
  'Chennai (MAA)',
  'Hyderabad (HYD)',
  'Pune (PNQ)',
  'Ahmedabad (AMD)',
  'Chandigarh (IXC)',
  'Shimla',
  'Udaipur (UDR)'
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('ai');
  const [fromCity, setFromCity] = useState('Delhi (DEL)');
  const [toCity, setToCity] = useState('Goa (GOI)');
  const [dates, setDates] = useState('2026-10-12');
  const [travelers, setTravelers] = useState(1);
  const [budget, setBudget] = useState('30000');

  const popularDestinations = [
    {
      name: 'Goa',
      tagline: 'Beaches, Nightlife & Colonial Architecture',
      price: '₹4,200',
      image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
      badge: 'Popular'
    },
    {
      name: 'Manali',
      tagline: 'Snowy Himalayan Peaks & Solang Adventure',
      price: '₹5,800',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
      badge: 'Adventure'
    },
    {
      name: 'Jaipur',
      tagline: 'Royal Forts, Palaces & Rajasthani Delicacies',
      price: '₹3,500',
      image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800&auto=format&fit=crop&q=80',
      badge: 'Heritage'
    },
    {
      name: 'Kerala',
      tagline: 'Palm-fringed Backwaters & Munnar Tea Estates',
      price: '₹6,400',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&auto=format&fit=crop&q=80',
      badge: 'Nature'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/10">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>Autonomous AI Travel Assistant & Commercial Booking Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Plan & Book Trips <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
              From Any City To Any Destination
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Search flights, compare luxury and budget hotels, or let our Gemini 2.5 AI agent craft custom itineraries, manage budgets, and execute bookings seamlessly.
          </p>
        </div>

        {/* Dual Mode Tab Selector & Search Hero Card */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-panel rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/10 relative">
            
            {/* Tab switch */}
            <div className="flex items-center justify-center gap-2 p-1.5 bg-dark-bg/80 rounded-2xl border border-dark-border mb-6 max-w-md mx-auto">
              <button
                onClick={() => setActiveTab('ai')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'ai'
                    ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Travel Agent</span>
              </button>

              <button
                onClick={() => setActiveTab('flights')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'flights'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Plane className="w-4 h-4" />
                <span>Manual Flights</span>
              </button>

              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                  activeTab === 'hotels'
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hotel className="w-4 h-4" />
                <span>Manual Hotels</span>
              </button>
            </div>

            {/* AI Agent Mode Form / Prompt Launcher */}
            {activeTab === 'ai' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-200 text-xs sm:text-sm flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Ask anything in natural language: </span>
                    "Plan a 4-day trip from {fromCity} to {toCity} under ₹30,000 for 2 people."
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Present City (From)</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-200 text-sm">
                      <MapPin className="w-4 h-4 text-sky-400 flex-shrink-0" />
                      <select
                        value={fromCity}
                        onChange={(e) => setFromCity(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full text-xs sm:text-sm cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c} className="bg-dark-card text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City (To)</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-200 text-sm">
                      <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <select
                        value={toCity}
                        onChange={(e) => setToCity(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full text-xs sm:text-sm cursor-pointer"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c} className="bg-dark-card text-white">{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Max Budget (₹)</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-200 text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="bg-transparent border-none outline-none text-white w-full text-xs sm:text-sm"
                        placeholder="Budget in INR"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Travelers</label>
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-slate-200 text-sm">
                      <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(Number(e.target.value))}
                        className="bg-transparent border-none outline-none text-white w-full text-xs sm:text-sm cursor-pointer"
                      >
                        <option value={1} className="bg-dark-card text-white">1 Traveler</option>
                        <option value={2} className="bg-dark-card text-white">2 Travelers</option>
                        <option value={4} className="bg-dark-card text-white">4 Travelers (Group)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/ai-agent?origin=${encodeURIComponent(fromCity)}&destination=${encodeURIComponent(toCity)}&budget=${budget}&travelers=${travelers}`}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 transition-all group"
                >
                  <Bot className="w-5 h-5 text-sky-200" />
                  <span>Launch AI Agent Planning ({fromCity.split(' ')[0]} ➔ {toCity.split(' ')[0]})</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}

            {/* Manual Flights Form */}
            {activeTab === 'flights' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">From</label>
                    <select
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-dark-card">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">To</label>
                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-dark-card">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Departure</label>
                    <input
                      type="date"
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Passengers</label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    >
                      <option value={1} className="bg-dark-card">1 Passenger</option>
                      <option value={2} className="bg-dark-card">2 Passengers</option>
                      <option value={4} className="bg-dark-card">4 Passengers</option>
                    </select>
                  </div>
                </div>

                <Link
                  href={`/flights?from=${encodeURIComponent(fromCity)}&to=${encodeURIComponent(toCity)}&date=${dates}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Flights</span>
                </Link>
              </div>
            )}

            {/* Manual Hotels Form */}
            {activeTab === 'hotels' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Destination City</label>
                    <select
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-dark-card">{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={dates}
                      onChange={(e) => setDates(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Guests</label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full px-3 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-white text-sm"
                    >
                      <option value={1} className="bg-dark-card">1 Guest</option>
                      <option value={2} className="bg-dark-card">2 Guests</option>
                      <option value={4} className="bg-dark-card">4 Guests</option>
                    </select>
                  </div>
                </div>

                <Link
                  href={`/hotels?city=${encodeURIComponent(toCity.split(' ')[0])}&checkin=${dates}`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>Search Hotels</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Trending Destinations</h2>
            <p className="text-slate-400 text-sm">Explore curated trip guides backed by our RAG vector knowledge base</p>
          </div>
          <Link href="/ai-agent" className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1">
            <span>Explore All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularDestinations.map((dest) => (
            <div key={dest.name} className="glass-card rounded-2xl overflow-hidden group">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md text-sky-400 text-xs font-semibold border border-sky-500/30">
                  {dest.badge}
                </div>
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-dark-bg/90 backdrop-blur-md text-white text-xs font-bold">
                  From {dest.price}
                </div>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">{dest.name}</h3>
                <p className="text-slate-400 text-xs line-clamp-2">{dest.tagline}</p>
                <Link
                  href={`/ai-agent?destination=${dest.name}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Plan with AI Agent</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-dark-card/40 border-y border-dark-border px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">Why JournAI Agentic Platform?</h2>
            <p className="text-slate-400 text-sm mt-2">Engineered with modern full-stack standards and human-in-the-loop safety</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-sky-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Autonomous Agentic Reasoning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Powered by Gemini 2.5 Flash and LangChain tools. Converts natural language queries into real API searches for flights, hotels, weather, and places.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-sky-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Human-in-the-Loop Confirmation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                No automatic charges. Financial actions require explicit user approval, Razorpay sandbox payment authorization, and backend verification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-dark-card border border-dark-border hover:border-sky-500/40 transition-all space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Model Context Protocol (MCP)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Standalone MCP Server exposes travel tools (`search_flights`, `search_hotels`, `get_weather`, `book_flight`) with clean standard protocols.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
