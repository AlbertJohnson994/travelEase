"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  promotions: {
    id: string;
    discount: number;
    promoCode?: string | null;
  }[];
  _count: {
    packages: number;
    reviews: number;
  };
}

function DestinationsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");

  const { isWishlisted, toggleWishlist } = useAuth();

  useEffect(() => {
    const cat = searchParams.get("category");
    const q = searchParams.get("search");
    if (cat) setSelectedCategory(cat);
    if (q !== null) setSearchQuery(q);
  }, [searchParams]);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const res = await fetch("/api/destinations");
        if (res.ok) {
          const data = await res.json();
          setDestinations(data);
        }
      } catch (err) {
        console.error("Error loading destinations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDestinations();
  }, []);

  const categories = [
    { value: "ALL", label: "All Destinations", icon: "🌍" },
    { value: "BEACH", label: "Beach", icon: "🏖️" },
    { value: "MOUNTAIN", label: "Mountain", icon: "🏔️" },
    { value: "CITY", label: "City", icon: "🌆" },
    { value: "HISTORICAL", label: "Historical", icon: "🏛️" },
    { value: "ADVENTURE", label: "Adventure", icon: "🧭" },
  ];

  const filteredDestinations = destinations
    .filter((d) => {
      if (selectedCategory !== "ALL" && d.category !== selectedCategory) {
        return false;
      }
      if (d.price > maxPrice) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return (b.rating || 4.8) - (a.rating || 4.8);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Global Catalog
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">
            Explore Destinations
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Filter by travel style, budget, or country to find your next
            unforgettable escape
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Search Destination or Country
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., Japan, Maldives, Zermatt..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Max Starting Price: <span className="text-blue-600">${maxPrice}</span>
              </label>
              <input
                type="range"
                min={800}
                max={3000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 mt-2 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as
                      | "featured"
                      | "price-asc"
                      | "price-desc"
                      | "rating"
                  )
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-sm bg-white"
              >
                <option value="featured">✨ Featured First</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="price-asc">💲 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => {
              const count =
                cat.value === "ALL"
                  ? destinations.length
                  : destinations.filter((d) => d.category === cat.value).length;
              const active = selectedCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-xs px-1.5 py-0.2 rounded-full ${
                      active ? "bg-blue-500 text-white" : "bg-white text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-96 animate-pulse shadow-sm"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination) => {
              const saved = isWishlisted(destination.id);
              return (
                <div
                  key={destination.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col"
                >
                  <div className="relative h-52">
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                        {destination.category}
                      </span>
                      {destination.promotions.length > 0 && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          {destination.promotions[0].discount}% OFF
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => toggleWishlist(destination.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm cursor-pointer"
                      title="Save to Wishlist"
                    >
                      {saved ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {destination.name}
                        </h3>
                        <span className="text-2xl font-extrabold text-blue-600">
                          ${destination.price}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-3 border-t border-gray-100">
                        <span>
                          📍 {destination.location}, {destination.country}
                        </span>
                        <span className="font-semibold text-amber-600">
                          ★ {destination.rating || 4.8} ({destination._count?.reviews || 0})
                        </span>
                        <span>📦 {destination._count?.packages || 0} pkgs</span>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href={`/destinations/${destination.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/packages?destination=${destination.id}`}
                          className="flex-1 border border-blue-600 text-blue-600 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                        >
                          See Packages
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
        {!loading && filteredDestinations.length === 0 && (
          <div className="bg-white rounded-2xl shadow-xs p-12 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No destinations match your filters
            </h3>
            <p className="text-gray-600 mb-6">
              Try resetting your search query, category, or price range filter.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("ALL");
                setSearchQuery("");
                setMaxPrice(3000);
              }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading destinations...
        </div>
      }
    >
      <DestinationsContent />
    </Suspense>
  );
}
