"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PackageOption {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  inclusions: { id: string; item: string }[];
  destination: {
    id: string;
    name: string;
    country: string;
    location: string;
    category: string;
    image: string;
  };
}

export default function TripPlannerPage() {
  const [packages, setPackages] = useState<PackageOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [style, setStyle] = useState("ALL");
  const [budgetPerPerson, setBudgetPerPerson] = useState(2500);
  const [days, setDays] = useState(7);
  const [travelers, setTravelers] = useState(2);
  const [selectedPkg, setSelectedPkg] = useState<PackageOption | null>(null);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const res = await fetch("/api/packages");
        if (res.ok) {
          const data: PackageOption[] = await res.json();
          setPackages(data);
          if (data.length > 0) setSelectedPkg(data[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPackages();
  }, []);

  const recommendations = packages
    .map((pkg) => {
      let score = 100;
      if (style !== "ALL" && pkg.destination.category !== style) {
        score -= 35;
      }
      if (pkg.price > budgetPerPerson) {
        score -= Math.min(40, Math.round((pkg.price - budgetPerPerson) / 25));
      }
      const dayDiff = Math.abs(pkg.duration - days);
      score -= dayDiff * 5;
      return { pkg, matchScore: Math.max(55, Math.min(99, score)) };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const activePkg = selectedPkg || recommendations[0]?.pkg || null;

  const generateDailySchedule = (pkg: PackageOption) => {
    const schedule = [];
    for (let d = 1; d <= pkg.duration; d++) {
      if (d === 1) {
        schedule.push({
          day: d,
          title: `Arrival in ${pkg.destination.location} & VIP Transfer`,
          desc: `Meet your private concierge at the airport, transfer to your accommodation in ${pkg.destination.name}, and enjoy a welcome dinner.`,
        });
      } else if (d === pkg.duration) {
        schedule.push({
          day: d,
          title: `Farewell Breakfast & Departure`,
          desc: `Leisure morning for souvenir shopping followed by private chauffeur transfer for your return journey.`,
        });
      } else {
        const inc =
          pkg.inclusions[(d - 2) % Math.max(1, pkg.inclusions.length)]?.item ||
          `Guided exploration of ${pkg.destination.name}`;
        schedule.push({
          day: d,
          title: `Day ${d}: ${inc}`,
          desc: `Full-day curated experience in ${pkg.destination.name} with local insider guide and curated dining.`,
        });
      }
    }
    return schedule;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
            ✨ Smart Itinerary Engine
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">
            AI Smart Trip & Budget Planner
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Configure your ideal travel style, budget, and duration to generate
            personalized package matches and a day-by-day itinerary.
          </p>
        </div>

        {/* Planner Controls */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              1. Travel Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            >
              <option value="ALL">🌍 Any Travel Style</option>
              <option value="BEACH">🏖️ Tropical Beach & Atolls</option>
              <option value="MOUNTAIN">🏔️ Mountain & Alpine</option>
              <option value="CITY">🌆 Iconic Metropolis</option>
              <option value="HISTORICAL">🏛️ Ancient Heritage</option>
              <option value="ADVENTURE">🧭 Wilderness Adventure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              2. Target Budget / Person:{" "}
              <span className="text-blue-600">${budgetPerPerson}</span>
            </label>
            <input
              type="range"
              min={1200}
              max={3200}
              step={100}
              value={budgetPerPerson}
              onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              3. Preferred Duration:{" "}
              <span className="text-blue-600">{days} Days</span>
            </label>
            <input
              type="range"
              min={4}
              max={10}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-blue-600 mt-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              4. Group Size
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Solo Traveler" : `Travelers (${n})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Generating smart recommendations...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ranked Matches List */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">
                Top Ranked Matches
              </h2>
              {recommendations.slice(0, 5).map(({ pkg, matchScore }) => {
                const isSelected = activePkg?.id === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkg(pkg)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-600 shadow-sm"
                        : "bg-white border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {matchScore}% Match
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {pkg.duration} Days
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 {pkg.destination.name}, {pkg.destination.country}
                    </p>
                    <div className="mt-3 flex justify-between items-baseline">
                      <span className="text-lg font-extrabold text-blue-600">
                        ${pkg.price}
                        <span className="text-xs font-normal text-gray-500">
                          /person
                        </span>
                      </span>
                      <span className="text-xs font-semibold text-gray-600">
                        Est. Total: ${(pkg.price * travelers).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Generated Day-by-Day Itinerary Preview */}
            <div className="lg:col-span-2">
              {activePkg && (
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="relative h-56">
                    <img
                      src={activePkg.destination.image}
                      alt={activePkg.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-6 text-white">
                      <div>
                        <span className="text-xs font-bold uppercase bg-blue-600 px-2.5 py-1 rounded-full">
                          Generated {activePkg.duration}-Day Blueprint
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                          {activePkg.name}
                        </h2>
                        <p className="text-sm text-gray-200">
                          📍 {activePkg.destination.name} (
                          {activePkg.destination.country}) • {travelers}{" "}
                          {travelers === 1 ? "Guest" : "Guests"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
                      <div>
                        <div className="text-xs text-gray-500 uppercase font-bold">
                          Estimated Group Total ({travelers} Travelers)
                        </div>
                        <div className="text-3xl font-extrabold text-blue-600">
                          ${(activePkg.price * travelers).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href={`/booking/${activePkg.id}`}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm"
                        >
                          Reserve This Itinerary →
                        </Link>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Day-by-Day Curated Schedule
                    </h3>
                    <div className="space-y-4">
                      {generateDailySchedule(activePkg).map((item) => (
                        <div
                          key={item.day}
                          className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            D{item.day}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

