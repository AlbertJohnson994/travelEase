"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
//import { prisma } from "@/lib/prisma";

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  destination: {
    name: string;
    location: string;
  };
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    travelers: 1,
    travelDate: "",
    transport: "AIR" as "AIR" | "LAND",
    specialRequests: "",
  });

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/packages/${params.packageId}`);
        if (response.ok) {
          const data = await response.json();
          setPackageData(data);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [params.packageId]);

  const calculateTotal = () => {
    if (!packageData) return 0;
    return packageData.price * formData.travelers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: params.packageId,
          ...formData,
          totalPrice: calculateTotal(),
        }),
      });

      if (response.ok) {
        router.push("/my-bookings?message=Booking created successfully");
      } else {
        const error = await response.json();
        alert(error.message || "Booking failed");
      }
    } catch {
      alert("Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Package not found
          </h2>
          <button
            onClick={() => router.push("/packages")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse Packages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">Book Your Trip</h1>
            <p className="text-blue-100">
              Complete your booking for {packageData.name}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Travel Details */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Travel Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Travelers
                      </label>
                      <select
                        value={formData.travelers}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelers: parseInt(e.target.value),
                          })
                        }
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "person" : "people"}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Travel Date
                      </label>
                      <input
                        type="date"
                        value={formData.travelDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            travelDate: e.target.value,
                          })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transportation Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="AIR"
                          checked={formData.transport === "AIR"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              transport: e.target.value as "AIR" | "LAND",
                            })
                          }
                          className="mr-2"
                        />
                        <span>✈️ Air Travel</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="LAND"
                          checked={formData.transport === "LAND"}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              transport: e.target.value as "AIR" | "LAND",
                            })
                          }
                          className="mr-2"
                        />
                        <span>🚗 Land Travel</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests
                  </label>
                  <textarea
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any special requirements or preferences..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg"
                >
                  {submitting ? "Processing Booking..." : "Complete Booking"}
                </button>
              </form>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 rounded-lg p-6 h-fit">
              <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-medium">{packageData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">
                    {packageData.destination.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {packageData.duration} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Travelers:</span>
                  <span className="font-medium">{formData.travelers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium capitalize">
                    {formData.transport.toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-blue-600">${calculateTotal()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  * Includes all taxes and fees
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
