"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { useLocationIntel } from "@/app/components/LocationProvider";

interface PackageData {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  maxGuests: number;
  inclusions: { id: string; item: string }[];
  destination: {
    id: string;
    name: string;
    location: string;
    country: string;
    image: string;
    promotions?: {
      id: string;
      title: string;
      promoCode?: string | null;
      discount: number;
    }[];
  };
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    intel,
    mapsLibraryEnabled,
    enableMapsLibrary,
    disableMapsLibrary,
    requestLiveGeolocation,
    getRouteForCountry,
  } = useLocationIntel();

  const packageId = params.packageId as string;

  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState(0);
  const [promoStatus, setPromoStatus] = useState("");
  const [departureCity, setDepartureCity] = useState("");

  const defaultFutureDate = new Date(Date.now() + 14 * 86400000)
    .toISOString()
    .split("T")[0];

  const [formData, setFormData] = useState({
    travelers: 2,
    travelDate: defaultFutureDate,
    transport: "AIR" as "AIR" | "LAND" | "SEA",
    paymentMethod: "CARD" as "CARD" | "PAYPAL" | "INVOICE",
    specialRequests: "",
  });

  useEffect(() => {
    if (intel?.location.city) {
      setDepartureCity(
        `${intel.location.city}${intel.location.country ? `, ${intel.location.country}` : ""}`
      );
    }
  }, [intel?.location.city, intel?.location.country]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${packageId}`);
        if (response.ok) {
          const data: PackageData = await response.json();
          setPackageData(data);
          if (
            data.destination.promotions &&
            data.destination.promotions.length > 0
          ) {
            const topPromo = data.destination.promotions[0];
            setAppliedPromoDiscount(topPromo.discount);
            if (topPromo.promoCode) {
              setPromoInput(topPromo.promoCode);
              setPromoStatus(
                `Auto-applied ${topPromo.title} (${topPromo.discount}% OFF)`
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) fetchPackage();
  }, [packageId]);

  const handleApplyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    const destPromo = packageData?.destination.promotions?.find(
      (p) => p.promoCode?.toUpperCase() === code
    );
    if (destPromo) {
      setAppliedPromoDiscount(destPromo.discount);
      setPromoStatus(`Applied ${destPromo.title} (${destPromo.discount}% OFF)`);
      return;
    }

    const builtinCodes: Record<string, number> = {
      WELCOME10: 10,
      MALDIVES20: 20,
      ALPS15: 15,
      JAPAN25: 25,
      AEGEAN18: 18,
    };

    if (builtinCodes[code]) {
      setAppliedPromoDiscount(builtinCodes[code]);
      setPromoStatus(`Promo code ${code} applied (${builtinCodes[code]}% OFF)!`);
    } else {
      setPromoStatus("Invalid promo code. Try WELCOME10 or destination code.");
    }
  };

  const memberDiscountPercent =
    user?.plan === "ELITE" ? 20 : user?.plan === "PRO" ? 10 : 0;

  const subtotal = packageData ? packageData.price * formData.travelers : 0;
  const promoSavings = Math.round((subtotal * appliedPromoDiscount) / 100);
  const afterPromo = subtotal - promoSavings;
  const memberSavings = Math.round((afterPromo * memberDiscountPercent) / 100);
  const finalTotal = Math.max(100, afterPromo - memberSavings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const enrichedRequests = departureCity
      ? `[Departure: ${departureCity}] ${formData.specialRequests}`.trim()
      : formData.specialRequests;

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          userId: user?.id,
          ...formData,
          specialRequests: enrichedRequests,
          totalPrice: finalTotal,
        }),
      });

      if (response.ok) {
        router.push("/my-bookings?message=Booking+confirmed+successfully");
      } else {
        const error = await response.json();
        setErrorMsg(error.error || error.message || "Booking failed");
      }
    } catch {
      setErrorMsg("Network error while creating booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Package not found
          </h2>
          <button
            onClick={() => router.push("/packages")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 font-semibold"
          >
            Browse Packages
          </button>
        </div>
      </div>
    );
  }

  const routeInfo = getRouteForCountry(packageData.destination.country);

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Google Maps & Location Library Status Banner / Consent Toggle */}
        <div className="mb-6 bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl shrink-0">
              🗺️
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                Google Maps & Live Geolocation Integration
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                This page uses the Google Maps library & browser geolocation to
                calculate your departure route and load the booking form.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => requestLiveGeolocation("always")}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer"
            >
              📍 Detect My Location
            </button>
            {mapsLibraryEnabled ? (
              <button
                type="button"
                onClick={disableMapsLibrary}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Disable Maps
              </button>
            ) : (
              <button
                type="button"
                onClick={enableMapsLibrary}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer"
              >
                Enable Google Maps
              </button>
            )}
          </div>
        </div>

        {/* If user disabled Google Maps library, show the exact prompt notice */}
        {!mapsLibraryEnabled ? (
          <div className="bg-slate-950 text-white rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto border border-slate-800 my-8">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto mb-5">
              📍
            </div>
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed mb-6 font-medium">
              This page requires the Google Maps library to load the booking
              form. If you choose not to enable it, the form will not be
              displayed.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={enableMapsLibrary}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition cursor-pointer text-sm"
              >
                ✓ Enable Google Maps & Load Booking Form
              </button>
              <button
                onClick={() => router.push("/packages")}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-5 py-3 rounded-xl border border-slate-700 transition cursor-pointer text-sm"
              >
                Back to Packages
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  Instant Cloud Reservation
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-2">
                  Complete Your Booking
                </h1>
                <p className="text-blue-100 mt-1 text-sm sm:text-base">
                  {packageData.name} • {packageData.destination.name} (
                  {packageData.duration} Days)
                </p>
              </div>
              <Link
                href={`/destinations/${packageData.destination.id}`}
                className="text-xs font-semibold bg-white/15 hover:bg-white/25 px-4 py-2 rounded-xl transition"
              >
                ← Back to Destination
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-5 sm:p-8">
              {/* Booking Form */}
              <div className="lg:col-span-2">
                {errorMsg && (
                  <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Departure Location & Route */}
                  <div className="bg-blue-50/60 rounded-2xl p-5 sm:p-6 border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <h3 className="text-lg font-bold text-gray-900">
                        1. Your Departure Location & Route
                      </h3>
                      <button
                        type="button"
                        onClick={() => requestLiveGeolocation("always")}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer w-fit"
                      >
                        📍 Auto-Detect My GPS Location
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                          Departure City / Airport
                        </label>
                        <input
                          type="text"
                          value={departureCity}
                          onChange={(e) => setDepartureCity(e.target.value)}
                          placeholder="Detected City or Airport"
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                          Destination Arrival Hub
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={`${packageData.destination.location}, ${packageData.destination.country}${routeInfo ? ` (${routeInfo.airport})` : ""}`}
                          className="w-full rounded-xl border border-gray-200 bg-gray-100 px-3.5 py-2.5 text-sm text-gray-700"
                        />
                      </div>
                    </div>

                    {routeInfo && (
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-white p-3.5 rounded-xl border border-blue-100 text-center text-xs">
                        <div>
                          <span className="text-gray-400 block">Distance</span>
                          <span className="font-extrabold text-gray-900 text-sm">
                            {routeInfo.distanceKm.toLocaleString()} km
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">
                            Est. Flight Time
                          </span>
                          <span className="font-extrabold text-blue-600 text-sm">
                            ~{routeInfo.estimatedFlightHours} hrs
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">
                            Local Weather
                          </span>
                          <span className="font-extrabold text-gray-900 text-sm">
                            {intel?.weather.icon} {intel?.weather.temperatureC}
                            °C
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Travel Details */}
                  <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      2. Guests & Travel Schedule
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of Travelers
                        </label>
                        <select
                          value={formData.travelers}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              travelers: parseInt(e.target.value),
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
                          required
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Traveler" : "Travelers"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Departure Date
                        </label>
                        <input
                          type="date"
                          value={formData.travelDate}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              travelDate: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Transport Mode */}
                    <div className="mt-5">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Preferred Transport Mode
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            value: "AIR",
                            label: "✈️ Air Travel",
                            desc: "Direct Flights",
                          },
                          {
                            value: "LAND",
                            label: "🚆 Land / Rail",
                            desc: "Scenic Express",
                          },
                          {
                            value: "SEA",
                            label: "🛥️ Sea / Cruise",
                            desc: "Yacht / Ferry",
                          },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                transport: opt.value as "AIR" | "LAND" | "SEA",
                              })
                            }
                            className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                              formData.transport === opt.value
                                ? "border-blue-600 bg-blue-50 text-blue-800"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            <div className="font-bold text-sm">{opt.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {opt.desc}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Payment Method & Promo Code */}
                  <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      3. Payment Method & Promo Code
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                      {[
                        { value: "CARD", label: "💳 Credit Card" },
                        { value: "PAYPAL", label: "🅿️ PayPal Express" },
                        { value: "INVOICE", label: "🏢 Corporate Invoice" },
                      ].map((pm) => (
                        <button
                          key={pm.value}
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentMethod: pm.value as
                                | "CARD"
                                | "PAYPAL"
                                | "INVOICE",
                            })
                          }
                          className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                            formData.paymentMethod === pm.value
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          {pm.label}
                        </button>
                      ))}
                    </div>

                    {/* Promo Code Input */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1.5">
                        Have a Promo Code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="e.g. WELCOME10, MALDIVES20"
                          className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm uppercase"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 cursor-pointer"
                        >
                          Apply
                        </button>
                      </div>
                      {promoStatus && (
                        <p className="text-xs text-emerald-600 font-medium mt-1.5">
                          ✓ {promoStatus}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Special Requests */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Special Requests & Dietary Preferences
                    </label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specialRequests: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
                      placeholder="Room preferences, dietary needs, honeymoon setup, airport pickup notes..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 font-bold text-base sm:text-lg shadow-md cursor-pointer transition"
                  >
                    {submitting
                      ? "Confirming Reservation..."
                      : `Confirm & Pay $${finalTotal.toLocaleString()}`}
                  </button>
                </form>
              </div>

              {/* Booking Summary + Embedded Google Map Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-5">
                  <img
                    src={packageData.destination.image}
                    alt={packageData.destination.name}
                    className="w-full h-36 object-cover rounded-xl"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Reservation Summary
                    </h3>
                    <p className="text-xs text-gray-500">
                      📍 {packageData.destination.name},{" "}
                      {packageData.destination.country}
                    </p>
                  </div>

                  <div className="space-y-2.5 text-sm border-t border-b border-gray-200 py-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Departure:</span>
                      <span className="font-semibold text-right">
                        {departureCity || "Auto-Detected"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Package:</span>
                      <span className="font-semibold text-right">
                        {packageData.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">
                        {packageData.duration} Days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Base (${packageData.price} × {formData.travelers}):
                      </span>
                      <span className="font-semibold">
                        ${subtotal.toLocaleString()}
                      </span>
                    </div>

                    {promoSavings > 0 && (
                      <div className="flex justify-between text-emerald-600 font-medium">
                        <span>Promo Discount ({appliedPromoDiscount}%):</span>
                        <span>-${promoSavings.toLocaleString()}</span>
                      </div>
                    )}

                    {memberSavings > 0 ? (
                      <div className="flex justify-between text-indigo-600 font-medium">
                        <span>
                          {user?.plan} Member Perk ({memberDiscountPercent}%):
                        </span>
                        <span>-${memberSavings.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-800">
                        💡{" "}
                        <Link href="/pricing" className="underline font-bold">
                          Upgrade to Voyager Pro
                        </Link>{" "}
                        to save an extra ${Math.round(afterPromo * 0.1)} on this
                        booking!
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900">
                        Total Due:
                      </span>
                      <span className="text-3xl font-extrabold text-blue-600">
                        ${finalTotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ Includes all resort taxes, transfers & free cancellation
                      up to 48h before departure.
                    </p>
                  </div>
                </div>

                {/* Live Embedded Google Maps Destination & Route Preview */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-slate-900 text-white px-4 py-3 text-xs font-bold flex justify-between items-center">
                    <span>
                      🗺️ Destination Map: {packageData.destination.location}
                    </span>
                    <Link
                      href={`/explore`}
                      className="text-blue-300 hover:underline"
                    >
                      Full Radar →
                    </Link>
                  </div>
                  <div className="h-56 w-full">
                    <iframe
                      title="Destination Google Map"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        `${packageData.destination.location}, ${packageData.destination.country}`
                      )}&z=11&output=embed`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
