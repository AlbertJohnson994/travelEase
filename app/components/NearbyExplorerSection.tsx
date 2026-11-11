"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocationIntel, NearbyPlace } from "./LocationProvider";

export default function NearbyExplorerSection({
  compact = false,
}: {
  compact?: boolean;
}) {
  const {
    intel,
    loadingLocation,
    permissionState,
    setShowPromptModal,
    requestLiveGeolocation,
    searchLocationByCity,
  } = useLocationIntel();

  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [cityInput, setCityInput] = useState("");
  const [focusedPlace, setFocusedPlace] = useState<NearbyPlace | null>(null);

  const handleCitySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityInput.trim()) return;
    setFocusedPlace(null);
    await searchLocationByCity(cityInput);
  };

  const places = intel?.nearbyPlaces || [];
  const filteredPlaces =
    selectedCategory === "ALL"
      ? places
      : places.filter((p) => p.category === selectedCategory);

  const displayPlaces = compact ? filteredPlaces.slice(0, 6) : filteredPlaces;

  const mapLat = focusedPlace?.lat ?? intel?.location.lat ?? 40.4168;
  const mapLon = focusedPlace?.lon ?? intel?.location.lon ?? -3.7038;
  const mapQuery = focusedPlace
    ? `${focusedPlace.title} ${intel?.location.city || ""}`
    : `${intel?.location.city || ""}, ${intel?.location.country || ""}`;

  const categories = [
    { id: "ALL", label: "All Sites", icon: "🌍" },
    { id: "BEACH", label: "Beaches & Coast", icon: "🏖️" },
    { id: "MOUNTAIN", label: "Mountains & Peaks", icon: "🏔️" },
    { id: "HISTORICAL", label: "Historical & Museums", icon: "🏛️" },
    { id: "NATURE", label: "Parks & Nature", icon: "🌲" },
    { id: "ATTRACTION", label: "Landmarks", icon: "🎡" },
  ];

  return (
    <section className="py-10 sm:py-16 bg-gradient-to-b from-slate-50 to-white border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        {/* Top Location Status Bar */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 md:p-8 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  LIVE GEOLOCATION & TOURIST RADAR
                </span>
                {permissionState !== "granted" && (
                  <button
                    onClick={() => setShowPromptModal(true)}
                    className="text-xs bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full font-semibold hover:bg-amber-500/30 transition cursor-pointer"
                  >
                    🔔 Location Prompt Settings
                  </button>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                {loadingLocation ? (
                  "Detecting Your Location & Nearby Sites..."
                ) : (
                  <>
                    Exploring Around{" "}
                    <span className="text-blue-400">
                      {intel?.location.city || "Your Location"}
                      {intel?.location.country
                        ? `, ${intel.location.country}`
                        : ""}
                    </span>
                  </>
                )}
              </h2>

              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                Discover nearby tourist attractions, beaches, mountains,
                historical landmarks, live local weather, and exact flight times
                from your current coordinates (
                <span className="font-mono text-blue-300">
                  {mapLat.toFixed(3)}°, {mapLon.toFixed(3)}°
                </span>
                ).
              </p>
            </div>

            {/* Weather + GPS Trigger */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {intel?.weather && (
                <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-3xl">{intel.weather.icon}</span>
                  <div>
                    <div className="text-xl font-extrabold leading-none">
                      {intel.weather.temperatureC}°C
                    </div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      {intel.weather.condition} • 💨{" "}
                      {intel.weather.windSpeedKmh} km/h
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => requestLiveGeolocation("always")}
                disabled={loadingLocation}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-3.5 rounded-xl text-xs sm:text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>📍</span>
                <span>
                  {loadingLocation ? "Locating..." : "Use My Current Location"}
                </span>
              </button>
            </div>
          </div>

          {/* Search Any City or Region Bar */}
          <form
            onSubmit={handleCitySearch}
            className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="Or type any city/region to explore its beaches, mountains & tourist sites (e.g. Barcelona, Rio, Cape Town, Zurich)..."
              className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={loadingLocation}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition cursor-pointer shrink-0"
            >
              🔍 Explore Area
            </button>
          </form>
        </div>

        {/* Category Filter Pills (Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const count =
              cat.id === "ALL"
                ? places.length
                : places.filter((p) => p.category === cat.id).length;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setFocusedPlace(null);
                }}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                    active
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main Responsive Split Grid: Interactive Map + Tourist Sites Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Google Map Panel */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden lg:sticky lg:top-24">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="truncate pr-2">
                <div className="text-[10px] uppercase tracking-wider text-blue-300 font-bold">
                  Interactive Satellite & Street Radar
                </div>
                <div className="text-sm font-bold truncate">
                  {focusedPlace
                    ? `📌 ${focusedPlace.title}`
                    : `📍 ${intel?.location.city || "Current Area"} Overview`}
                </div>
              </div>
              {focusedPlace && (
                <button
                  onClick={() => setFocusedPlace(null)}
                  className="text-xs bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg font-semibold shrink-0 cursor-pointer"
                >
                  Reset Map
                </button>
              )}
            </div>

            <div className="relative w-full h-72 sm:h-80 lg:h-96 bg-gray-100">
              <iframe
                title="Interactive Tourist & Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  mapQuery
                )}&ll=${mapLat},${mapLon}&z=${
                  focusedPlace ? 15 : 12
                }&output=embed`}
              />
            </div>

            {/* Flight Route Quick Bar from Current Location */}
            {intel?.routeMetrics && intel.routeMetrics.length > 0 && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <div className="text-xs font-bold uppercase text-gray-500 mb-2.5">
                  ✈️ Direct Flight Estimates From{" "}
                  {intel.location.city || "You"}:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {intel.routeMetrics.slice(0, 4).map((rm) => (
                    <div
                      key={rm.country}
                      className="bg-white p-2.5 rounded-xl border border-gray-200 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-gray-900">
                          {rm.country}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {rm.distanceKm.toLocaleString()} km
                        </div>
                      </div>
                      <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        ~{rm.estimatedFlightHours}h
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Nearby Tourist Sites, Beaches & Mountains Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {displayPlaces.map((place) => {
                const isSelected = focusedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    className={`bg-white rounded-2xl border overflow-hidden transition flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20 shadow-lg"
                        : "border-gray-200 shadow-xs hover:shadow-md"
                    }`}
                  >
                    <div>
                      <div className="relative h-44">
                        <img
                          src={place.image}
                          alt={place.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                            {place.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-white/95 text-gray-900 text-xs font-extrabold px-2.5 py-1 rounded-lg shadow-xs">
                          📍 {place.distanceKm} km away
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                          {place.title}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-3 leading-relaxed">
                          {place.summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-2 flex gap-2">
                      <button
                        onClick={() => setFocusedPlace(place)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        }`}
                      >
                        🗺️ Show on Map
                      </button>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold transition"
                      >
                        🧭 Route
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {compact && (
              <div className="mt-6 text-center sm:text-right">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition"
                >
                  <span>🌍 Open Full Interactive Tourist & Beach Radar</span>
                  <span>→</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

