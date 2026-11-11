"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { useAuth } from "./components/AuthProvider";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Promotion {
  id: string;
  title: string;
  promoCode?: string | null;
  discount: number;
  validUntil: string;
}

interface Destination {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  category: string;
  image: string;
  price: number;
  rating: number;
  promotions: Promotion[];
  _count?: {
    packages: number;
    reviews: number;
  };
}

export default function Home() {
  const [featuredDestinations, setFeaturedDestinations] = useState<
    Destination[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const router = useRouter();

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations");
        if (res.ok) {
          const data = await res.json();
          setFeaturedDestinations(data.slice(0, 6));
        }
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDestinations();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory !== "ALL") params.set("category", selectedCategory);
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    router.push(`/destinations?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Carousel + Floating Search Bar */}
      <div className="relative">
        <HeroCarousel />
        <div className="container mx-auto px-4 relative z-20 -mt-16">
          <form
            onSubmit={handleQuickSearch}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Where do you want to go?
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Maldives, Swiss Alps, Kyoto, Santorini..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Travel Style
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none text-gray-900 bg-white"
              >
                <option value="ALL">All Categories</option>
                <option value="BEACH">🏖️ Beach & Islands</option>
                <option value="MOUNTAIN">🏔️ Mountain & Alps</option>
                <option value="CITY">🌆 Iconic Cities</option>
                <option value="HISTORICAL">🏛️ Cultural & Heritage</option>
                <option value="ADVENTURE">🧭 Adventure & Trek</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
              >
                🔍 Search Trips
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live SaaS Metrics Strip */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
              <div className="text-3xl font-extrabold text-blue-600">50+</div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Curated Global Destinations
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
              <div className="text-3xl font-extrabold text-indigo-600">
                20% OFF
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Automatic Elite Member Savings
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
              <div className="text-3xl font-extrabold text-emerald-600">
                4.9 ★
              </div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                Verified Traveler Rating
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-xs border border-gray-100">
              <div className="text-3xl font-extrabold text-amber-500">24/7</div>
              <div className="text-xs font-medium text-gray-500 mt-1">
                AI Planner & Live Concierge
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Destinations Grid */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Top Picks For You
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-2 text-gray-900">
                Featured Destinations
              </h2>
              <p className="text-gray-600 mt-1">
                Handpicked luxury escapes and adventure hotspots with instant
                online booking
              </p>
            </div>
            <Link
              href="/destinations"
              className="mt-4 md:mt-0 text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
            >
              View All Destinations →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-gray-100 rounded-2xl h-96 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SaaS Membership Banner */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                TravelEase Pass Subscription
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-4 leading-tight">
                Unlock Wholesale Travel Pricing & VIP Perks
              </h2>
              <p className="text-gray-300 mt-4 leading-relaxed">
                Upgrade to{" "}
                <strong className="text-white">Voyager Pro ($19/mo)</strong> or{" "}
                <strong className="text-white">Nomad Elite ($49/mo)</strong> to
                automatically save 10%–20% on every package booking, stackable
                with seasonal promo codes.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link
                  href="/pricing"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                >
                  Compare Membership Plans
                </Link>
                <Link
                  href="/planner"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl border border-white/20 transition"
                >
                  ✨ Try AI Trip Planner
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-6">
                <div className="text-sm font-bold text-blue-300">
                  VOYAGER PRO
                </div>
                <div className="text-3xl font-extrabold mt-1">
                  $19<span className="text-sm font-normal">/mo</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-200">
                  <li>✓ 10% automatic member discount</li>
                  <li>✓ Free flexible date changes</li>
                  <li>✓ Priority 24/7 concierge chat</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-400/40 rounded-2xl p-6">
                <div className="text-sm font-bold text-amber-300">
                  NOMAD ELITE
                </div>
                <div className="text-3xl font-extrabold mt-1">
                  $49<span className="text-sm font-normal">/mo</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-gray-200">
                  <li>✓ 20% automatic member discount</li>
                  <li>✓ Airport VIP lounge passes</li>
                  <li>✓ Dedicated travel advisor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <Features />
    </div>
  );
}

function DestinationCard({ destination }: { destination: Destination }) {
  const { isWishlisted, toggleWishlist } = useAuth();
  const saved = isWishlisted(destination.id);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col">
      <div className="relative h-56">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-gray-900/75 backdrop-blur-xs text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
            {destination.category}
          </span>
          {destination.promotions.length > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
              {destination.promotions[0].discount}% OFF
            </span>
          )}
        </div>
        <button
          onClick={() => toggleWishlist(destination.id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-sm transition cursor-pointer"
          title={saved ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <span className={saved ? "text-red-500" : "text-gray-400"}>
            {saved ? "❤️" : "🤍"}
          </span>
        </button>
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2 mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {destination.name}
              </h3>
              <p className="text-xs text-gray-500">
                📍 {destination.location}, {destination.country}
              </p>
            </div>
            <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
              ★ {destination.rating || 4.8}
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {destination.description}
          </p>
        </div>

        <div>
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
            <div>
              <span className="text-xs text-gray-500 block">Starting from</span>
              <span className="text-2xl font-extrabold text-blue-600">
                ${destination.price}
              </span>
              <span className="text-xs text-gray-500"> / person</span>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              📦 {destination._count?.packages ?? 1} packages
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/destinations/${destination.id}`}
              className="bg-blue-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold text-center hover:bg-blue-700 transition"
            >
              View Details
            </Link>
            <Link
              href={`/packages?destination=${destination.id}`}
              className="border border-blue-600 text-blue-600 py-2.5 px-4 rounded-xl text-sm font-semibold text-center hover:bg-blue-50 transition"
            >
              Book Package
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroCarousel() {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80",
      title: "Explore Exotic Coral Atolls",
      subtitle:
        "All-inclusive overwater villas, private transfers, and member-only savings",
      ctaText: "Explore Beach Deals",
      ctaHref: "/destinations?category=BEACH",
    },
    {
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80",
      title: "Conquer Alpine Peaks in Style",
      subtitle:
        "First-class Glacier Express rail journeys & luxury Swiss mountain chalets",
      ctaText: "View Alpine Packages",
      ctaHref: "/destinations?category=MOUNTAIN",
    },
    {
      image:
        "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80",
      title: "Immerse in Timeless Heritage",
      subtitle:
        "Private cultural tours across Kyoto, Rome, and iconic world wonders",
      ctaText: "Plan With AI",
      ctaHref: "/planner",
    },
  ];

  return (
    <section className="w-full h-[520px]">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="w-full h-[520px] bg-cover bg-center flex items-center justify-center relative"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
              <div className="relative z-10 text-center text-white px-4 max-w-3xl pb-10">
                <span className="inline-block bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-widest px-3.5 py-1 rounded-full mb-4">
                  TravelEase Cloud Experience
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 mb-6">
                  {slide.subtitle}
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    href={slide.ctaHref}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                  >
                    {slide.ctaText}
                  </Link>
                  <Link
                    href="/packages"
                    className="bg-white/15 hover:bg-white/25 backdrop-blur-xs text-white font-semibold px-6 py-3 rounded-xl border border-white/30 transition"
                  >
                    Browse All Packages
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "✈️",
      title: "Air, Land & Sea Transport",
      desc: "Choose first-class flights, scenic rail passes, or private catamaran transfers for every package.",
    },
    {
      icon: "🤖",
      title: "AI Smart Itinerary Planner",
      desc: "Tell us your budget and travel style—get instant package matches and a day-by-day schedule.",
    },
    {
      icon: "🛡️",
      title: "Instant Confirmation & Protection",
      desc: "Real-time booking management, transparent pricing, and 1-click flexible cancellation.",
    },
  ];

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Why Travelers Choose TravelEase
          </h2>
          <p className="text-gray-600 mt-2">
            Built as a modern end-to-end travel SaaS for effortless discovery,
            booking, and itinerary management.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-2xl shadow-xs border border-gray-100 text-center hover:shadow-md transition"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">{f.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
