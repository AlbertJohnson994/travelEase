"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";

interface DestinationItem {
  id: string;
  name: string;
  description: string;
  location: string;
  country: string;
  image: string;
  price: number;
  category: string;
}

interface PackageItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  destination: {
    id: string;
    name: string;
    image: string;
    country: string;
  };
}

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useAuth();
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      try {
        const [dRes, pRes] = await Promise.all([
          fetch("/api/destinations"),
          fetch("/api/packages"),
        ]);
        if (dRes.ok) setDestinations(await dRes.json());
        if (pRes.ok) setPackages(await pRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const savedDestinations = destinations.filter((d) => wishlist.includes(d.id));
  const savedPackages = packages.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">
            ❤️ My Saved Wishlist ({wishlist.length})
          </h1>
          <p className="text-gray-600 mt-1">
            Keep track of your favorite destinations and packages for quick
            booking
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading saved trips...
          </div>
        ) : savedDestinations.length === 0 && savedPackages.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-xs border border-gray-100">
            <div className="text-4xl mb-3">🤍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Click the heart icon on any destination or travel package to save
              it here.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/destinations"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700"
              >
                Explore Destinations
              </Link>
              <Link
                href="/packages"
                className="border border-blue-600 text-blue-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-50"
              >
                Browse Packages
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {savedDestinations.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Saved Destinations ({savedDestinations.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {savedDestinations.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <img
                        src={d.image}
                        alt={d.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-900">
                            {d.name}
                          </h3>
                          <button
                            onClick={() => toggleWishlist(d.id)}
                            className="text-xs text-red-600 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          📍 {d.location}, {d.country}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xl font-extrabold text-blue-600">
                            ${d.price}
                          </span>
                          <Link
                            href={`/destinations/${d.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            View Destination
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {savedPackages.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Saved Packages ({savedPackages.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {savedPackages.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <img
                        src={p.destination.image}
                        alt={p.name}
                        className="w-full h-44 object-cover"
                      />
                      <div className="p-5">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg text-gray-900">
                            {p.name}
                          </h3>
                          <button
                            onClick={() => toggleWishlist(p.id)}
                            className="text-xs text-red-600 font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">
                          📍 {p.destination.name} • {p.duration} Days
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <span className="text-xl font-extrabold text-blue-600">
                            ${p.price}
                          </span>
                          <Link
                            href={`/booking/${p.id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                          >
                            Book Package
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

