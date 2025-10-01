import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    include: {
      destination: true,
      inclusions: true, // Changed from includes to inclusions
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Travel Packages
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All-inclusive packages for worry-free travel experiences
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={pkg.destination.image}
                  alt={pkg.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {pkg.duration} days
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {pkg._count.bookings} booked
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {pkg.name}
                  </h3>
                  <span className="text-2xl font-bold text-blue-600">
                    ${pkg.price}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span>📍 {pkg.destination.name}</span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium mb-2 text-sm text-gray-700">
                    Includes:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {pkg.inclusions.slice(0, 3).map((inclusion) => (
                      <li key={inclusion.id}>✓ {inclusion.item}</li>
                    ))}
                    {pkg.inclusions.length > 3 && (
                      <li className="text-blue-600 text-sm">
                        + {pkg.inclusions.length - 3} more inclusions
                      </li>
                    )}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/booking/${pkg.id}`}
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Book Now
                  </Link>
                  <Link
                    href={`/destinations/${pkg.destination.id}`}
                    className="flex-1 border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 transition"
                  >
                    View Destination
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {packages.length === 0 && (
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No packages available
            </h3>
            <p className="text-gray-600">
              Check back later for new travel packages
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
