import React from 'react';
import Link from 'next/link';
import { Compass, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-bg border-t border-dark-border text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white">JournAI</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Autonomous AI Travel Assistant & Commercial Travel Booking Engine powered by Gemini 2.5, RAG, and MCP.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandbox & Test API Mode Active</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Travel Modes</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/flights" className="hover:text-sky-400 transition-colors">Flight Search & Compare</Link></li>
            <li><Link href="/hotels" className="hover:text-sky-400 transition-colors">Hotel & Resort Booking</Link></li>
            <li><Link href="/ai-agent" className="hover:text-sky-400 transition-colors">Conversational AI Planner</Link></li>
            <li><Link href="/my-trips" className="hover:text-sky-400 transition-colors">My Trips & Itineraries</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Technology Stack</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Next.js 14 & JavaScript</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> FastAPI & MongoDB</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> Google Gemini 2.5 Flash</li>
            <li className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-amber-400" /> LangChain & Vector RAG</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Integrations</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>Duffel Travel API Sandbox</li>
            <li>Razorpay Test Gateway</li>
            <li>Model Context Protocol (MCP)</li>
            <li>Web Speech Voice AI</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} JournAI Travel Agent. All rights reserved. TEST BOOKING SYSTEM.
        </div>
        <div className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>for next-gen AI travel planning</span>
        </div>
      </div>
    </footer>
  );
}
