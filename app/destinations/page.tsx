import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    include: {
      promotions: {
        where: {
          validUntil: {
            gt: new Date(),
          },
        },
      },
      packages: true,
      _count: {
        select: {
          packages: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const categories = [
    { value: "ALL", label: "All Destinations", count: destinations.length },
    {
      value: "BEACH",
      label: "Beach",
      count: destinations.filter((d) => d.category === "BEACH").length,
    },
    {
      value: "MOUNTAIN",
      label: "Mountain",
      count: destinations.filter((d) => d.category === "MOUNTAIN").length,
    },
    {
      value: "CITY",
      label: "City",
      count: destinations.filter((d) => d.category === "CITY").length,
    },
    {
      value: "HISTORICAL",
      label: "Historical",
      count: destinations.filter((d) => d.category === "HISTORICAL").length,
    },
    {
      value: "ADVENTURE",
      label: "Adventure",
      count: destinations.filter((d) => d.category === "ADVENTURE").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Destinations
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing places around the world with our curated travel
            destinations
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category.value}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              {category.label} ({category.count})
            </button>
          ))}
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {destination.category.toLowerCase()}
                  </span>
                </div>
                {destination.promotions.length > 0 && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {destination.promotions[0].discount}% OFF
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {destination.name}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${destination.price}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>
                    📍 {destination.location}, {destination.country}
                  </span>
                  <span>📦 {destination._count.packages} packages</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/destinations/${destination.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/packages?destination=${destination.id}`}
                    className="flex-1 border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 transition"
                  >
                    See Packages
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {destinations.length === 0 && (
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
              No destinations found
            </h3>
            <p className="text-gray-600">
              Check back later for new destinations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
