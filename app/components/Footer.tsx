"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-2xl font-bold text-white mb-4 inline-flex items-center gap-2"
            >
              <span>✈️</span>
              <span>TravelEase</span>
            </Link>
            <p className="text-gray-300 mb-4 leading-relaxed text-sm">
              Your all-in-one cloud travel platform for curated global
              destinations, all-inclusive packages, AI itinerary planning, and
              VIP membership perks.
            </p>
            <div className="flex space-x-3 text-sm text-gray-400">
              <Link
                href="/pricing"
                className="bg-gray-800 hover:bg-gray-700 text-blue-400 px-3 py-1.5 rounded-lg transition"
              >
                💎 Membership Plans
              </Link>
              <Link
                href="/admin"
                className="bg-gray-800 hover:bg-gray-700 text-indigo-400 px-3 py-1.5 rounded-lg transition"
              >
                📊 Admin Portal
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/destinations"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  All-Inclusive Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/promotions"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Flash Deals & Promo Codes
                </Link>
              </li>
              <li>
                <Link
                  href="/planner"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  AI Trip & Budget Planner
                </Link>
              </li>
              <li>
                <Link
                  href="/my-bookings"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Manage My Bookings
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  About TravelEase
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  24/7 Concierge Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Travel Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/destinations?category=BEACH"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  🏖️ Beach & Atoll Holidays
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations?category=MOUNTAIN"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  🏔️ Alpine & Mountain Escapes
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations?category=CITY"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  🌆 Iconic City Breaks
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations?category=HISTORICAL"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  🏛️ Cultural & Heritage Tours
                </Link>
              </li>
              <li>
                <Link
                  href="/destinations?category=ADVENTURE"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  🧭 Expedition & Adventure
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  ❤️ Saved Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <div className="space-y-2 text-sm text-gray-300 mb-4">
              <p>📍 123 Travel Street, Adventure City, AC 12345</p>
              <p>📞 +1 (555) 123-4567</p>
              <p>✉️ concierge@travelease.com</p>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">
                Weekly Member Deals Newsletter
              </h4>
              {subscribed ? (
                <div className="bg-green-900/50 border border-green-600 text-green-200 px-3 py-2 rounded-lg text-xs">
                  ✓ Subscribed! Check your inbox for your 10% welcome voucher.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors text-sm font-semibold"
                  >
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} TravelEase Cloud SaaS Inc. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center space-x-6 text-sm">
              <Link
                href="/about"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy & Terms
              </Link>
              <Link
                href="/pricing"
                className="text-gray-400 hover:text-white transition-colors"
              >
                SaaS Pricing
              </Link>
              <Link
                href="/users"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Community Directory
              </Link>
              <Link
                href="/admin"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Admin Console
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-xs">256-bit SSL Secure:</span>
              <div className="flex space-x-1.5">
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800">
                  VISA
                </span>
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800">
                  MASTERCARD
                </span>
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800">
                  STRIPE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
