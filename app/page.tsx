"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Promotion {
  id: number;
  discount: number;
  validUntil: Date;
}

interface Destination {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  promotions: Promotion[];
}

export default function Home() {
  const [featuredDestinations, setFeaturedDestinations] = useState<
    Destination[]
  >([]);

  useEffect(() => {
    async function fetchDestinations() {
      try {
        const res = await fetch("/api/destinations"); // 🔹 your API endpoint
        if (res.ok) {
          const data = await res.json();
          setFeaturedDestinations(data);
        } else {
          throw new Error("Failed to load destinations");
        }
      } catch (error) {
        console.error(error);

        // 🔹 fallback tourist data
        setFeaturedDestinations([
          {
            id: 1,
            name: "Paris, France",
            description:
              "The city of lights, love, and the iconic Eiffel Tower.",
            image:
              "https://images.unsplash.com/photo-1543349689-9b2f0da37a5f?auto=format&fit=crop&w=1200&q=80",
            price: 999,
            promotions: [],
          },
          {
            id: 2,
            name: "Tokyo, Japan",
            description: "Modern meets tradition in Japan’s bustling capital.",
            image:
              "https://images.unsplash.com/photo-1505066836043-9f0b6d8a237f?auto=format&fit=crop&w=1200&q=80",
            price: 1299,
            promotions: [{ id: 1, discount: 20, validUntil: new Date() }],
          },
          {
            id: 3,
            name: "Rio de Janeiro, Brazil",
            description:
              "Beaches, samba, and the world-famous Christ the Redeemer.",
            image:
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
            price: 899,
            promotions: [],
          },
          {
            id: 4,
            name: "Santorini, Greece",
            description:
              "Whitewashed houses and blue domes over the Aegean Sea.",
            image:
              "https://images.unsplash.com/photo-1505739772040-0f34a35c6c8f?auto=format&fit=crop&w=1200&q=80",
            price: 1199,
            promotions: [],
          },
          {
            id: 5,
            name: "New York, USA",
            description:
              "The city that never sleeps, full of culture and landmarks.",
            image:
              "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
            price: 1099,
            promotions: [],
          },
        ]);
      }
    }

    fetchDestinations();
  }, []);

  return (
    <div>
      {/* 🔹 Carousel Section */}
      <HeroCarousel />

      {/* Destinations Grid */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12">Featured Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <Features />
    </div>
  );
}

/* 🔹 Destination Card */
function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <img
        src={destination.image}
        alt={destination.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{destination.name}</h3>
        <p className="text-gray-600 mb-4">
          {destination.description.slice(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${destination.price}
          </span>
          {destination.promotions.length > 0 && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              {destination.promotions[0].discount}% OFF
            </span>
          )}
        </div>
        <Link
          href={`/destinations/${destination.id}`}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded block text-center hover:bg-blue-700 transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

/* 🔹 Swiper Carousel */
function HeroCarousel() {
  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80",
      title: "Explore Exotic Beaches",
      subtitle: "Relax and enjoy paradise destinations",
    },
    {
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
      title: "Discover Urban Wonders",
      subtitle: "From skylines to hidden gems",
    },
    {
      image:
        "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=1600&q=80",
      title: "Cultural Adventures",
      subtitle: "Immerse yourself in local traditions",
    },
  ];

  return (
    <section className="w-full h-[500px]">
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop
        className="h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div
              className="w-full h-[500px] bg-cover bg-center flex items-center justify-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="bg-black bg-opacity-40 w-full h-full flex flex-col items-center justify-center text-white">
                <h2 className="text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-xl">{slide.subtitle}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}

/* 🔹 Features Section */
function Features() {
  const features = [
    {
      icon: "✈️",
      title: "Air & Land Travel",
      desc: "Flexible travel options to suit your preferences",
    },
    {
      icon: "🏨",
      title: "Hotel Booking",
      desc: "Comfortable accommodations at great prices",
    },
    {
      icon: "🎁",
      title: "Special Packages",
      desc: "All-inclusive packages for worry-free travel",
    },
  ];

  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, idx) => (
            <div key={idx} className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{f.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
