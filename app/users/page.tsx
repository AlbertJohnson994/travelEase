"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface MemberUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  plan: "FREE" | "PRO" | "ELITE";
  createdAt: string;
  _count?: {
    bookings: number;
    reviews: number;
  };
}

export default function UsersCommunityPage() {
  const [users, setUsers] = useState<MemberUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          setUsers(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              TravelEase Members
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
              Traveler Community & Subscribers
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Active platform members, subscription tiers, and verified trip
              counts
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition w-fit"
          >
            Manage in SaaS Admin →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading members...
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-lg">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{u.name}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            u.plan === "ELITE"
                              ? "bg-amber-100 text-amber-800"
                              : u.plan === "PRO"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {u.plan}
                        </span>
                        {u.role === "ADMIN" && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-gray-600">
                    <div>
                      <span className="font-bold text-gray-900">
                        {u._count?.bookings || 0}
                      </span>{" "}
                      Trips Booked
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">
                        {u._count?.reviews || 0}
                      </span>{" "}
                      Reviews
                    </div>
                    <div className="text-gray-400">
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
