"use client";

import React from "react";
import Link from "next/link";
import NearbyExplorerSection from "../components/NearbyExplorerSection";
import { useLocationIntel } from "../components/LocationProvider";

export default function ExplorePage() {
  const { intel } = useLocationIntel();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full Nearby Explorer */}
      <NearbyExplorerSection compact={false} />

      {/* Global Flight Distance & Route Planner Table from Client Location */}
      <section className="py-12 container mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Live Departure Telemetry
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                Flight Distances & Travel Info From{" "}
                <span className="text-blue-600">
                  {intel?.location.city || "Your Current Location"}
                </span>
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Calculated using great-circle Haversine telemetry from your
                live coordinates to our top international destinations
              </p>
            </div>
            <Link
              href="/packages"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition w-fit"
            >
              Browse All Packages →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                  <th className="py-3 px-2">Destination Country</th>
                  <th className="py-3 px-2">Arrival Hub Airport</th>
                  <th className="py-3 px-2">Distance (km / mi)</th>
                  <th className="py-3 px-2">Est. Flight Duration</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(intel?.routeMetrics || []).map((rm) => (
                  <tr key={rm.country} className="hover:bg-gray-50">
                    <td className="py-3.5 px-2 font-bold text-gray-900">
                      🌍 {rm.country}
                    </td>
                    <td className="py-3.5 px-2 text-gray-600 font-mono text-xs">
                      ✈️ {rm.airport}
                    </td>
                    <td className="py-3.5 px-2 text-gray-700 font-medium">
                      {rm.distanceKm.toLocaleString()} km (
                      {rm.distanceMiles.toLocaleString()} mi)
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-xs">
                        ⏱️ ~{rm.estimatedFlightHours} hours
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <Link
                        href={`/destinations?search=${encodeURIComponent(
                          rm.country
                        )}`}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs underline"
                      >
                        Explore {rm.country} →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

