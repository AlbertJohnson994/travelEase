"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

interface BookingItem {
  id: string;
  packageId: string;
  travelDate: string;
  travelers: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  transport: "AIR" | "LAND" | "SEA";
  paymentMethod?: string;
  paymentStatus?: string;
  specialRequests?: string | null;
  createdAt: string;
  package: {
    id: string;
    name: string;
    duration: number;
    price: number;
    destination: {
      id: string;
      name: string;
      image: string;
      location: string;
      country?: string;
    };
    inclusions?: { id: string; item: string }[];
  };
}

function MyBookingsContent() {
  const searchParams = useSearchParams();
  const flashMessage = searchParams.get("message");
  const { user } = useAuth();

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async () => {
    try {
      const url = user?.id
        ? `/api/bookings?userId=${user.id}`
        : "/api/bookings";
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to load bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const handleStatusChange = async (
    bookingId: string,
    newStatus: "CANCELLED" | "CONFIRMED"
  ) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId ? { ...b, status: newStatus } : b
          )
        );
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      }
    } catch (err) {
      console.error("Error updating booking:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredBookings = bookings.filter((b) =>
    statusFilter === "ALL" ? true : b.status === statusFilter
  );

  const totalSpend = bookings
    .filter((b) => b.status !== "CANCELLED")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Flash Banner */}
        {flashMessage && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 rounded-2xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 font-semibold">
              <span>🎉</span>
              <span>{flashMessage}</span>
            </div>
            <span className="text-xs text-emerald-600 font-medium">
              Instant E-Ticket Ready
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              My Trips & Bookings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your upcoming itineraries, download e-tickets, or modify
              reservations
            </p>
          </div>
          <Link
            href="/packages"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition w-fit"
          >
            + Book New Trip
          </Link>
        </div>

        {/* Summary KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Total Trips
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {bookings.length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Confirmed
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {bookings.filter((b) => b.status === "CONFIRMED").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Pending
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {bookings.filter((b) => b.status === "PENDING").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Completed
            </div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              {bookings.filter((b) => b.status === "COMPLETED").length}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 col-span-2 md:col-span-1">
            <div className="text-xs font-semibold text-gray-500 uppercase">
              Active Spend
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">
              ${totalSpend.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "CONFIRMED", "PENDING", "COMPLETED", "CANCELLED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              Loading your bookings...
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-gray-50/70 transition flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <img
                      src={booking.package.destination.image}
                      alt={booking.package.destination.name}
                      className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          REF #{booking.id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {booking.package.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📍 {booking.package.destination.name} •{" "}
                        {booking.package.duration} Days
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 text-xs text-gray-600">
                        <div>
                          <span className="text-gray-400 block">
                            Departure Date:
                          </span>
                          <span className="font-semibold text-gray-800">
                            {new Date(booking.travelDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Travelers:</span>
                          <span className="font-semibold text-gray-800">
                            {booking.travelers}{" "}
                            {booking.travelers === 1 ? "Guest" : "Guests"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Transport:</span>
                          <span className="font-semibold text-gray-800">
                            {booking.transport}
                          </span>
                        </div>
                      </div>

                      {booking.specialRequests && (
                        <p className="mt-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                          📝 Note: {booking.specialRequests}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:text-right flex flex-row lg:flex-col justify-between items-end border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                    <div>
                      <div className="text-2xl font-extrabold text-blue-600">
                        ${booking.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        Booked{" "}
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        🎫 View E-Ticket
                      </button>
                      {(booking.status === "PENDING" ||
                        booking.status === "CONFIRMED") && (
                        <button
                          disabled={updatingId === booking.id}
                          onClick={() =>
                            handleStatusChange(booking.id, "CANCELLED")
                          }
                          className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                        >
                          {updatingId === booking.id
                            ? "Updating..."
                            : "Cancel Trip"}
                        </button>
                      )}
                      {booking.status === "CANCELLED" && (
                        <button
                          disabled={updatingId === booking.id}
                          onClick={() =>
                            handleStatusChange(booking.id, "CONFIRMED")
                          }
                          className="px-3.5 py-2 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Re-Activate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-4">
              <div className="text-4xl mb-3">🧳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No bookings found
              </h3>
              <p className="text-gray-600 mb-6">
                Ready for your next getaway? Explore our curated packages.
              </p>
              <Link
                href="/packages"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition inline-block"
              >
                Explore Travel Packages
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* E-Ticket / Itinerary Receipt Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">
                  Official TravelEase E-Ticket
                </span>
                <h3 className="text-xl font-extrabold mt-2">
                  {selectedBooking.package.name}
                </h3>
                <p className="text-xs text-blue-100">
                  Confirmation #{selectedBooking.id.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-white/80 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="text-xs text-gray-400 block">
                    Destination
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.package.destination.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  <span className="font-bold text-emerald-600">
                    {selectedBooking.status}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Departure Date
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Date(selectedBooking.travelDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Duration & Guests
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.package.duration} Days •{" "}
                    {selectedBooking.travelers} Guests
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Transport</span>
                  <span className="font-bold text-gray-900">
                    {selectedBooking.transport}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">
                    Total Paid
                  </span>
                  <span className="font-extrabold text-blue-600">
                    ${selectedBooking.totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedBooking.package.inclusions &&
                selectedBooking.package.inclusions.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">
                      Confirmed Package Inclusions:
                    </h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {selectedBooking.package.inclusions.map((inc) => (
                        <li key={inc.id}>✓ {inc.item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  🖨️ Print Itinerary
                </button>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading bookings...
        </div>
      }
    >
      <MyBookingsContent />
    </Suspense>
  );
}

