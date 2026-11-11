"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PromotionItem {
  id: string;
  title: string;
  description: string;
  promoCode?: string | null;
  discount: number;
  validUntil: string;
  destination: {
    id: string;
    name: string;
    image: string;
    location: string;
    country: string;
    price: number;
  };
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPromos() {
      try {
        const res = await fetch("/api/promotions");
        if (res.ok) {
          const data = await res.json();
          setPromotions(data);
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPromos();
  }, []);

  const getDaysRemaining = (validUntil: string) => {
    const today = new Date();
    const validDate = new Date(validUntil);
    const diffTime = validDate.getTime() - today.getTime();
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full">
            Verified Flash Offers
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 mt-2 mb-3">
            Special Promotions & Promo Codes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Copy a promo code below or click straight through to automatically
            apply discounts at checkout—stackable with Voyager Pro & Nomad Elite
            memberships!
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl h-96 animate-pulse shadow-xs"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {promotions.map((promotion) => {
              const daysRemaining = getDaysRemaining(promotion.validUntil);
              const code =
                promotion.promoCode || `SAVE${Math.round(promotion.discount)}`;
              const discountedPrice = Math.round(
                promotion.destination.price * (1 - promotion.discount / 100)
              );

              return (
                <div
                  key={promotion.id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition flex flex-col"
                >
                  {/* Promotion Header */}
                  <div className="bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 text-white p-4 flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-extrabold">
                        {promotion.discount}% OFF
                      </div>
                      <div className="text-xs text-red-100">
                        Limited Time Deal
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-wider block text-red-100">
                        Promo Code
                      </span>
                      <button
                        onClick={() => handleCopyCode(promotion.id, code)}
                        className="mt-0.5 bg-white text-red-600 font-mono font-bold text-xs px-3 py-1.5 rounded-lg shadow-xs hover:bg-red-50 transition cursor-pointer"
                      >
                        {copiedId === promotion.id ? "✓ COPIED!" : `📋 ${code}`}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="relative h-44 mb-4 rounded-xl overflow-hidden">
                        <img
                          src={promotion.destination.image}
                          alt={promotion.destination.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2.5 py-1 rounded-lg text-xs">
                          <span className="line-through text-gray-400 mr-1.5">
                            ${promotion.destination.price}
                          </span>
                          <span className="font-bold text-emerald-400">
                            ${discountedPrice}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {promotion.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {promotion.description}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>
                          📍 {promotion.destination.name},{" "}
                          {promotion.destination.country}
                        </span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                          ⏳ {daysRemaining} days left
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Link
                          href={`/packages?destination=${promotion.destination.id}`}
                          className="flex-1 bg-blue-600 text-white text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          Claim Deal
                        </Link>
                        <Link
                          href={`/destinations/${promotion.destination.id}`}
                          className="flex-1 border border-blue-600 text-blue-600 text-center py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition"
                        >
                          Destination
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
