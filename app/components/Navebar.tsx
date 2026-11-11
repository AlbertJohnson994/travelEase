"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useLocationIntel } from "./LocationProvider";

export default function Navebar() {
  const pathname = usePathname();
  const { user, logout, wishlist } = useAuth();
  const { intel, setShowPromptModal } = useLocationIntel();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/explore", label: "📍 Near Me & Maps", badge: "LIVE" },
    { href: "/destinations", label: "Destinations" },
    { href: "/packages", label: "Packages" },
    { href: "/promotions", label: "Deals" },
    { href: "/planner", label: "AI Planner" },
    { href: "/pricing", label: "Memberships" },
    { href: "/my-bookings", label: "My Bookings" },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const getPlanBadgeStyle = (plan?: string) => {
    if (plan === "ELITE")
      return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    if (plan === "PRO")
      return "bg-gradient-to-r from-blue-600 to-indigo-600 text-white";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      {/* Top Location & Promo Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white text-xs py-2 px-4">
        <div className="container mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPromptModal(true)}
              className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full font-semibold transition cursor-pointer"
              title="Click to update location permissions"
            >
              <span>📍</span>
              <span>
                {intel?.location.city
                  ? `${intel.location.city}, ${intel.location.countryCode || intel.location.country}`
                  : "Detect Location"}
              </span>
              {intel?.weather && (
                <span className="text-blue-200 ml-1">
                  {intel.weather.icon} {intel.weather.temperatureC}°C
                </span>
              )}
            </button>
            <span className="hidden md:inline text-slate-300">
              • Save up to 20% with TravelEase Membership
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/explore"
              className="underline hover:text-blue-200 font-semibold"
            >
              Tourist Radar →
            </Link>
            <Link
              href="/admin"
              className="bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full font-medium transition"
            >
              📊 SaaS Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Main Responsive Navbar */}
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              ✈️
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TravelEase
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200">
                Cloud
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-2.5">
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-lg transition"
              title="Saved Trips"
            >
              <svg
                className="w-5 h-5"
                fill={wishlist.length > 0 ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-900 leading-none">
                      {user.name.split(" ")[0]}
                    </div>
                    <span
                      className={`inline-block mt-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded ${getPlanBadgeStyle(
                        user.plan
                      )}`}
                    >
                      {user.plan || "FREE"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-gray-600 hover:text-red-600 px-2.5 py-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-xs sm:text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-xs transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet Hamburger Button */}
          <div className="flex items-center space-x-2 xl:hidden">
            <button
              onClick={() => setShowPromptModal(true)}
              className="p-2 text-xs font-bold bg-blue-50 text-blue-700 rounded-lg"
              title="Location Settings"
            >
              📍
            </button>
            <Link
              href="/wishlist"
              className="relative p-2 text-gray-600 hover:text-red-500 rounded-lg text-sm"
            >
              ❤️
              {wishlist.length > 0 && (
                <span className="ml-0.5 text-xs font-bold text-red-600">
                  ({wishlist.length})
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100"
              aria-label="Toggle Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Menu Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-gray-100 space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
            >
              📊 SaaS Admin Dashboard
            </Link>
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2 md:hidden">
              {user ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-xl bg-gray-50 text-sm font-semibold text-gray-900 flex justify-between items-center"
                  >
                    <span>👤 {user.name}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${getPlanBadgeStyle(
                        user.plan
                      )}`}
                    >
                      {user.plan}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
