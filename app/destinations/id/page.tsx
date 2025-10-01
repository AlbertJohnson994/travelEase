import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DestinationDetail({ params }: PageProps) {
  const destination = await prisma.destination.findUnique({
    where: { id: params.id },
    include: {
      promotions: {
        where: {
          validUntil: {
            gt: new Date(),
          },
        },
      },
      packages: {
        include: {
          _count: {
            select: {
              bookings: true,
            },
          },
          inclusions: true,
        },
      },
    },
  });

  if (!destination) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Image */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{destination.name}</h1>
            <p className="text-xl">
              {destination.location}, {destination.country}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">
                About {destination.name}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {destination.description}
              </p>
            </div>

            {/* Packages Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Available Packages</h2>
              <div className="space-y-4">
                {destination.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">{pkg.name}</h3>
                        <p className="text-gray-600 mt-1">{pkg.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          ${pkg.price}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pkg.duration} days
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium mb-2">Includes:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {pkg.inclusions.slice(0, 3).map(
                            (
                              inclusion // Changed from includes to inclusions
                            ) => (
                              <li key={inclusion.id}>✓ {inclusion.item}</li> // Changed to inclusion.item
                            )
                          )}
                          {pkg.inclusions.length > 3 && ( // Changed from includes to inclusions
                            <li className="text-blue-600">
                              + {pkg.inclusions.length - 3} more
                            </li> // Changed from includes to inclusions
                          )}
                        </ul>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-2">
                          {pkg._count.bookings} bookings
                        </div>
                        <Link
                          href={`/booking/${pkg.id}`}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {destination.packages.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No packages available for this destination yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Starting From</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                ${destination.price}
              </div>
              <p className="text-gray-600 text-sm">Per person</p>

              {destination.promotions.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-red-600 font-semibold">
                    Special Offer: {destination.promotions[0].discount}% OFF
                  </div>
                  <div className="text-red-500 text-sm">
                    Valid until{" "}
                    {new Date(
                      destination.promotions[0].validUntil
                    ).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Destination Facts</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">
                    {destination.category.toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{destination.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium">{destination.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Packages:</span>
                  <span className="font-medium">
                    {destination.packages.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Our travel experts are here to help you plan your perfect trip.
              </p>
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
