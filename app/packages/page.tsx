"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

interface Inclusion {
  id: string;
  item: string;
}

interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxGuests: number;
  destinationId: string;
  destination: {
    id: string;
    name: string;
    image: string;
    location: string;
    country: string;
    category?: string;
    promotions?: { discount: number; promoCode?: string | null }[];
  };
  inclusions: Inclusion[];
  _count: {
    bookings: number;
  };
}

function PackagesContent() {
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "ALL";

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDest, setSelectedDest] = useState(initialDest);
  const [durationFilter, setDurationFilter] = useState<"ALL" | "SHORT" | "MEDIUM" | "LONG">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isWishlisted, toggleWishlist } = useAuth();

  useEffect(() => {
    const dest = searchParams.get("destination");
    if (dest) setSelectedDest(dest);
  }, [searchParams]);

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        }
      } catch (err) {
        console.error("Failed to fetch packages:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  const uniqueDestinations = Array.from(
    new Map(packages.map((p) => [p.destination.id, p.destination])).values()
  );

  const filteredPackages = packages.filter((pkg) => {
    if (selectedDest !== "ALL" && pkg.destination.id !== selectedDest) {
      return false;
    }
    if (durationFilter === "SHORT" && pkg.duration > 5) return false;
    if (durationFilter === "MEDIUM" && (pkg.duration < 6 || pkg.duration > 7))
      return false;
    if (durationFilter === "LONG" && pkg.duration < 8) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        pkg.name.toLowerCase().includes(q) ||
        pkg.description.toLowerCase().includes(q) ||
        pkg.destination.name.toLowerCase().includes(q) ||
        pkg.destination.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const memberDiscount =
    user?.plan === "ELITE" ? 20 : user?.plan === "PRO" ? 10 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            All-Inclusive Experiences
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">
            Curated Travel Packages
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Handcrafted itineraries with luxury stays, guided excursions, and
            transfers included
          </p>
          {memberDiscount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
              💎 Your {user?.plan} Membership automatically applies an extra{" "}
              {memberDiscount}% OFF at checkout!
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Search Packages
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search villa, train, trek, culinary..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Filter by Destination
            </label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
            >
              <option value="ALL">All Destinations ({packages.length})</option>
              {uniqueDestinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
              Trip Duration
            </label>
            <select
              value={durationFilter}
              onChange={(e) =>
                setDurationFilter(
                  e.target.value as "ALL" | "SHORT" | "MEDIUM" | "LONG"
                )
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
            >
              <option value="ALL">Any Duration</option>
              <option value="SHORT">Short Escapes (1–5 Days)</option>
              <option value="MEDIUM">Weeklong Trips (6–7 Days)</option>
              <option value="LONG">Extended Expeditions (8+ Days)</option>
            </select>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-96 animate-pulse shadow-xs"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map((pkg) => {
              const saved = isWishlisted(pkg.id);
              const promoDiscount =
                pkg.destination.promotions?.[0]?.discount || 0;
              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col"
                >
                  <div className="relative h-52">
                    <img
                      src={pkg.destination.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                        ⏱️ {pkg.duration} Days
                      </span>
                      {promoDiscount > 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {promoDiscount}% OFF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleWishlist(pkg.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm cursor-pointer"
                    >
                      {saved ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-blue-600 mb-1">
                        📍 {pkg.destination.name} ({pkg.destination.country})
                      </div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {pkg.name}
                        </h3>
                        <div className="text-right shrink-0">
                          <span className="text-2xl font-extrabold text-blue-600">
                            ${pkg.price}
                          </span>
                          <span className="block text-[10px] text-gray-400">
                            per person
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pkg.description}
                      </p>

                      <div className="bg-gray-50 rounded-xl p-3.5 mb-5">
                        <h4 className="font-bold mb-2 text-xs uppercase text-gray-500">
                          Package Includes:
                        </h4>
                        <ul className="text-xs text-gray-700 space-y-1.5">
                          {pkg.inclusions.slice(0, 4).map((inclusion) => (
                            <li
                              key={inclusion.id}
                              className="flex items-start gap-1.5"
                            >
                              <span className="text-emerald-600 font-bold">
                                ✓
                              </span>
                              <span>{inclusion.item}</span>
                            </li>
                          ))}
                          {pkg.inclusions.length > 4 && (
                            <li className="text-blue-600 font-semibold pt-1">
                              + {pkg.inclusions.length - 4} more inclusions
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>👥 Max {pkg.maxGuests || 10} travelers</span>
                        <span>🔥 {pkg._count?.bookings || 0} bookings</span>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/booking/${pkg.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Book Now
                        </Link>
                        <Link
                          href={`/destinations/${pkg.destination.id}`}
                          className="flex-1 border border-blue-600 text-blue-600 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                        >
                          Destination
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPackages.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No packages match your criteria
            </h3>
            <p className="text-gray-600 mb-6">
              Reset your filters to view all all-inclusive travel packages.
            </p>
            <button
              onClick={() => {
                setSelectedDest("ALL");
                setDurationFilter("ALL");
                setSearchQuery("");
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 cursor-pointer"
            >
              Show All Packages
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading packages...
        </div>
      }
    >
      <PackagesContent />
    </Suspense>
  );
}
