import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface Promotion {
  id: string;
  discount: number;
  validUntil: Date;
  // Add other fields if needed
}

interface Destination {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  promotions: Promotion[];
  // Add other fields if needed
}

export default async function Home() {
  let featuredDestinations: Destination[] = [];

  try {
    featuredDestinations = await prisma.destination.findMany({
      take: 6,
      include: {
        promotions: {
          where: {
            validUntil: {
              gt: new Date(),
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching destinations:", error);
    featuredDestinations = [];
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl mb-8">
            Explore top destinations and exclusive deals curated just for you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination: Destination) => (
              <div
                key={destination.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden"
              >
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {destination.name}
                  </h3>
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
            ))}
          </div>

          {/* Empty State */}
          {featuredDestinations.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-16 w-16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No destinations available
              </h3>
              <p className="text-gray-600">
                Check back later for amazing travel destinations
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✈️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Air & Land Travel</h3>
              <p className="text-gray-600">
                Flexible travel options to suit your preferences
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Hotel Booking</h3>
              <p className="text-gray-600">
                Comfortable accommodations at great prices
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Special Packages</h3>
              <p className="text-gray-600">
                All-inclusive packages for worry-free travel
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
