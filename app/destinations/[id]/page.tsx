"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { useLocationIntel } from "@/app/components/LocationProvider";

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
  inclusions: Inclusion[];
  _count?: {
    bookings: number;
  };
}

interface PromotionItem {
  id: string;
  title: string;
  description: string;
  promoCode?: string | null;
  discount: number;
  validUntil: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    plan?: string;
  };
}

interface DestinationDetailData {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  image: string;
  price: number;
  rating: number;
  category: string;
  promotions: PromotionItem[];
  packages: PackageItem[];
  reviews: ReviewItem[];
}

export default function DestinationDetail() {
  const params = useParams();
  const router = useRouter();
  const destinationId = params.id as string;

  const { user, isWishlisted, toggleWishlist } = useAuth();
  const { intel, getRouteForCountry } = useLocationIntel();
  const [destination, setDestination] = useState<DestinationDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    async function loadDestination() {
      try {
        const res = await fetch(`/api/destinations/${destinationId}`);
        if (res.ok) {
          const data = await res.json();
          setDestination(data);
        }
      } catch (err) {
        console.error("Failed to fetch destination:", err);
      } finally {
        setLoading(false);
      }
    }
    if (destinationId) loadDestination();
  }, [destinationId]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmittingReview(true);
    setReviewSuccess("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationId,
          rating,
          comment,
          userId: user?.id,
        }),
      });
      if (res.ok) {
        const newReview = await res.json();
        setDestination((prev) =>
          prev
            ? {
                ...prev,
                reviews: [newReview, ...prev.reviews],
              }
            : prev
        );
        setComment("");
        setReviewSuccess("Thank you! Your verified review has been published.");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading destination details...</p>
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Destination Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The destination you are looking for may have been moved or removed.
          </p>
          <button
            onClick={() => router.push("/destinations")}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
          >
            Back to Destinations
          </button>
        </div>
      </div>
    );
  }

  const saved = isWishlisted(destination.id);
  const routeInfo = getRouteForCountry(destination.country);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative h-[360px] sm:h-[420px] overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 flex items-end">
          <div className="container mx-auto px-4 pb-8 sm:pb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {destination.category}
                </span>
                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  ★ {destination.rating || 4.8} (
                  {destination.reviews?.length || 0} reviews)
                </span>
                {routeInfo && (
                  <span className="bg-white/20 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-bold">
                    ✈️ {routeInfo.distanceKm.toLocaleString()} km from{" "}
                    {intel?.location.city || "You"} (~
                    {routeInfo.estimatedFlightHours}h)
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-2">
                {destination.name}
              </h1>
              <p className="text-base sm:text-lg text-gray-200">
                📍 {destination.location}, {destination.country}
              </p>
            </div>

            <button
              onClick={() => toggleWishlist(destination.id)}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white px-5 py-2.5 rounded-xl font-semibold border border-white/30 transition w-fit cursor-pointer text-sm"
            >
              {saved ? "❤️ Saved in Wishlist" : "🤍 Save Destination"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About {destination.name}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                {destination.description}
              </p>
            </div>

            {/* Interactive Google Map of Destination */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    🗺️ Interactive Destination & Tourist Sites Map
                  </h2>
                  <p className="text-xs text-gray-500">
                    Explore beaches, mountains, hotels, and landmarks around{" "}
                    {destination.location}, {destination.country}
                  </p>
                </div>
                <Link
                  href="/explore"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Open Full Tourist Radar →
                </Link>
              </div>
              <div className="h-72 sm:h-80 w-full">
                <iframe
                  title={`Map of ${destination.name}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    `${destination.location}, ${destination.country}`
                  )}&z=11&output=embed`}
                />
              </div>
            </div>

            {/* Available Packages */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Available All-Inclusive Packages
                </h2>
                <span className="text-sm text-gray-500">
                  {destination.packages.length} curated options
                </span>
              </div>

              <div className="space-y-6">
                {destination.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-blue-500 hover:shadow-md transition"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md mb-2">
                          ⏱️ {pkg.duration} Days / {pkg.duration - 1} Nights • Up
                          to {pkg.maxGuests || 10} Guests
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {pkg.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {pkg.description}
                        </p>
                      </div>
                      <div className="md:text-right shrink-0">
                        <div className="text-xs text-gray-500">Package Price</div>
                        <div className="text-3xl font-extrabold text-blue-600">
                          ${pkg.price}
                        </div>
                        <div className="text-xs text-gray-500">per traveler</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                        What&#39;s Included:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        {pkg.inclusions.map((inc) => (
                          <div key={inc.id} className="flex items-center gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{inc.item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="text-xs font-medium text-gray-500">
                        🔥 {pkg._count?.bookings || 0} travelers booked this
                        package
                      </span>
                      <Link
                        href={`/booking/${pkg.id}`}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition text-sm"
                      >
                        Book This Package →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Verified Traveler Reviews */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Verified Traveler Reviews ({destination.reviews?.length || 0})
              </h2>

              <form
                onSubmit={handleReviewSubmit}
                className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-3">
                  Share Your Experience
                </h3>
                {reviewSuccess && (
                  <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-3 py-2 rounded-lg">
                    {reviewSuccess}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Rating
                    </label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                    >
                      <option value={5}>★★★★★ (5/5)</option>
                      <option value={4}>★★★★☆ (4/5)</option>
                      <option value={3}>★★★☆☆ (3/5)</option>
                      <option value={2}>★★☆☆☆ (2/5)</option>
                      <option value={1}>★☆☆☆☆ (1/5)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-gray-600 mb-1">
                      Your Review
                    </label>
                    <input
                      type="text"
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="What did you love most about this destination?"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {submittingReview ? "Posting..." : "Post Verified Review"}
                </button>
              </form>

              <div className="space-y-4">
                {destination.reviews && destination.reviews.length > 0 ? (
                  destination.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            {rev.user?.name || "Verified Traveler"}
                          </span>
                          {rev.user?.plan && rev.user.plan !== "FREE" && (
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {rev.user.plan} MEMBER
                            </span>
                          )}
                        </div>
                        <span className="text-amber-500 text-sm font-bold">
                          {"★".repeat(rev.rating)}
                          {"☆".repeat(5 - rev.rating)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{rev.comment}</p>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No reviews yet. Be the first to review {destination.name}!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Base Destination Rate
              </div>
              <div className="text-4xl font-extrabold text-blue-600 mt-1">
                ${destination.price}
                <span className="text-sm font-normal text-gray-500">
                  {" "}
                  / person
                </span>
              </div>

              {destination.promotions.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="text-red-700 font-bold text-sm">
                    🔥 {destination.promotions[0].title}:{" "}
                    {destination.promotions[0].discount}% OFF
                  </div>
                  <p className="text-red-600 text-xs mt-1">
                    {destination.promotions[0].description}
                  </p>
                  {destination.promotions[0].promoCode && (
                    <div className="mt-2 bg-white border border-red-200 px-3 py-1.5 rounded-lg flex justify-between items-center text-xs">
                      <span className="text-gray-500">Promo Code:</span>
                      <span className="font-mono font-bold text-red-600">
                        {destination.promotions[0].promoCode}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {destination.packages.length > 0 && (
                <Link
                  href={`/booking/${destination.packages[0].id}`}
                  className="mt-5 w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  Book Top Package Now
                </Link>
              )}
            </div>

            {/* Flight Telemetry Card from Client Location */}
            {routeInfo && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300 mb-3">
                  ✈️ Your Travel Telemetry
                </h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">From:</span>
                    <span className="font-bold">
                      {intel?.location.city || "Detected City"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Arrival Hub:</span>
                    <span className="font-bold text-xs">
                      {routeInfo.airport}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Flight Distance:</span>
                    <span className="font-bold">
                      {routeInfo.distanceKm.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Air Time:</span>
                    <span className="font-bold text-emerald-400">
                      ~{routeInfo.estimatedFlightHours} hours
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Facts */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Destination Facts
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Category:</span>
                  <span className="font-semibold capitalize">
                    {destination.category.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Region:</span>
                  <span className="font-semibold">{destination.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Country:</span>
                  <span className="font-semibold">{destination.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Curated Packages:</span>
                  <span className="font-semibold">
                    {destination.packages.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
