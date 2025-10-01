import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PromotionsPage() {
  const promotions = await prisma.promotion.findMany({
    where: {
      validUntil: {
        gt: new Date(),
      },
    },
    include: {
      destination: true,
    },
    orderBy: {
      validUntil: "asc",
    },
  });

  const getDaysRemaining = (validUntil: Date) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Special Promotions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don&#39;t miss out on these limited-time offers for amazing travel
            experiences
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.map((promotion) => {
            const daysRemaining = getDaysRemaining(promotion.validUntil);

            return (
              <div
                key={promotion.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Promotion Badge */}
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 text-center">
                  <div className="text-3xl font-bold">
                    {promotion.discount}% OFF
                  </div>
                  <div className="text-sm">Limited Time Offer</div>
                </div>

                <div className="p-6">
                  {/* Destination Image */}
                  <img
                    src={promotion.destination.image}
                    alt={promotion.destination.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />

                  {/* Promotion Details */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {promotion.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{promotion.description}</p>

                  {/* Destination Info */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>📍 {promotion.destination.name}</span>
                  </div>

                  {/* Countdown Timer */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <div className="text-yellow-800 font-semibold text-sm">
                        Offer ends in {daysRemaining}{" "}
                        {daysRemaining === 1 ? "day" : "days"}
                      </div>
                      <div className="text-yellow-600 text-xs">
                        Valid until{" "}
                        {new Date(promotion.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Link
                      href={`/destinations/${promotion.destination.id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      View Destination
                    </Link>
                    <Link
                      href={`/packages?destination=${promotion.destination.id}`}
                      className="flex-1 border border-blue-600 text-blue-600 text-center py-2 rounded-lg hover:bg-blue-50 transition"
                    >
                      See Packages
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {promotions.length === 0 && (
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No current promotions
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for special offers and discounts
            </p>
            <Link
              href="/destinations"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Destinations
            </Link>
          </div>
        )}

        {/* Expired Promotions Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Looking for more deals? New promotions are added regularly. Check
            back often!
          </p>
        </div>
      </div>
    </div>
  );
}
