'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plane, Hotel, Bot, LogOut, Menu, X, Sparkles, Compass, Luggage } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: Compass },
    { name: 'Flights', href: '/flights', icon: Plane },
    { name: 'Hotels', href: '/hotels', icon: Hotel },
    { name: 'AI Assistant', href: '/ai-agent', icon: Bot, highlight: true },
    { name: 'My Trips', href: '/my-trips', icon: Luggage },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-dark-bg/85 border-b border-dark-border text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-[2px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
            <div className="w-full h-full bg-dark-bg rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-sky-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-sky-300">
              JournAI
            </span>
            <span className="hidden sm:inline-block ml-1.5 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
              Agentic
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-dark-card/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-dark-border">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.highlight) {
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/30'
                      : 'bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-sky-300 animate-pulse" />
                  <span>{link.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth / Profile section */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-card border border-dark-border text-sm font-medium text-slate-200">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={logout}
                title="Log out"
                className="p-2.5 rounded-full bg-dark-card border border-dark-border hover:bg-red-500/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-all"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium rounded-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-md shadow-sky-500/20 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-dark-card border border-dark-border text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-6 bg-dark-bg/95 border-b border-dark-border space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5 text-sky-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-dark-border flex flex-col gap-2">
            {user ? (
              <>
                <div className="px-4 py-2 text-sm text-slate-400">Signed in as <span className="text-white font-semibold">{user.name}</span></div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-dark-card border border-dark-border text-slate-200 font-medium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center rounded-xl bg-sky-500 text-white font-medium shadow-md shadow-sky-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
