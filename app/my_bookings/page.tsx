import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function MyBookingsPage() {
  // TODO: Replace with actual user ID from session
  const userId = "temp-user-id";

  const bookings = await prisma.booking.findMany({
    where: {
      userId: userId,
    },
    include: {
      package: {
        include: {
          destination: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600">
              Manage your travel bookings and view booking history
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {bookings.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-6 hover:bg-gray-50 transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {booking.package.name}
                            </h3>
                            <p className="text-gray-600 mt-1">
                              {booking.package.destination.name} •{" "}
                              {booking.package.duration} days
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Travel Date:</span>
                            <br />
                            {new Date(booking.travelDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Travelers:</span>
                            <br />
                            {booking.travelers}{" "}
                            {booking.travelers === 1 ? "person" : "people"}
                          </div>
                          <div>
                            <span className="font-medium">Transport:</span>
                            <br />
                            <span className="capitalize">
                              {booking.transport.toLowerCase()}
                            </span>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div className="mt-3">
                            <span className="font-medium text-sm text-gray-700">
                              Special Requests:
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6 lg:text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          ${booking.totalPrice}
                        </div>
                        <div className="text-sm text-gray-500">
                          Booked on{" "}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={`/booking/${booking.packageId}`}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm"
                          >
                            View Details
                          </Link>
                          {booking.status === "PENDING" && (
                            <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-sm">
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No bookings yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start planning your next adventure!
                </p>
                <Link
                  href="/destinations"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Explore Destinations
                </Link>
              </div>
            )}
          </div>

          {bookings.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {bookings.length}
                </div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <div className="text-2xl font-bold text-green-600">
                  {bookings.filter((b) => b.status === "CONFIRMED").length}
                </div>
                <div className="text-sm text-gray-600">Confirmed</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {bookings.filter((b) => b.status === "PENDING").length}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow text-center">
                <div className="text-2xl font-bold text-red-600">
                  {bookings.filter((b) => b.status === "CANCELLED").length}
                </div>
                <div className="text-sm text-gray-600">Cancelled</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
