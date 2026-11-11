"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";

export default function Profile() {
  const { user, loading: authLoading, setUser, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "FREE" as "FREE" | "PRO" | "ELITE",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        plan: user.plan || "FREE",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          ...formData,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setEditing(false);
        setStatusMsg("Profile and membership settings saved to database!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-8 rounded-2xl shadow-md max-w-md w-full">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign In to View Your Profile
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Access your personal travel dashboard, membership tier, and saved
            itineraries.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 cursor-pointer"
          >
            Go to Sign In (Includes 1-Click Demo)
          </button>
        </div>
      </div>
    );
  }

  const discountRate =
    user.plan === "ELITE" ? 20 : user.plan === "PRO" ? 10 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {statusMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-semibold">
            ✓ {statusMsg}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl font-extrabold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold">{user.name}</h1>
                  <p className="text-blue-100 text-sm">{user.email}</p>
                </div>
              </div>
              <div className="sm:text-right">
                <span className="inline-block bg-white text-blue-700 font-extrabold text-xs px-3 py-1 rounded-full uppercase">
                  {user.plan} PASS • {user.role}
                </span>
                <div className="text-blue-100 text-xs mt-1">
                  {discountRate}% Automatic Booking Discount
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Info */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Account & Membership Settings
                  </h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-100 transition cursor-pointer"
                  >
                    {editing ? "Cancel" : "✏️ Edit Profile"}
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Full Name
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold">
                        {user.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Email Address
                    </label>
                    {editing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      Phone Number
                    </label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm"
                      />
                    ) : (
                      <div className="text-gray-900 font-semibold">
                        {user.phone || "Not provided"}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                      SaaS Membership Tier
                    </label>
                    {editing ? (
                      <select
                        value={formData.plan}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plan: e.target.value as "FREE" | "PRO" | "ELITE",
                          })
                        }
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 bg-white text-sm"
                      >
                        <option value="FREE">
                          Explorer (Free - 0% discount)
                        </option>
                        <option value="PRO">
                          Voyager Pro ($19/mo - 10% automatic discount)
                        </option>
                        <option value="ELITE">
                          Nomad Elite ($49/mo - 20% automatic discount)
                        </option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-600">
                          {user.plan} PLAN ({discountRate}% OFF all bookings)
                        </span>
                        <Link
                          href="/pricing"
                          className="text-xs font-semibold text-indigo-600 underline"
                        >
                          Compare Plans →
                        </Link>
                      </div>
                    )}
                  </div>

                  {editing && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: Stats & Quick Links */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="text-base font-bold text-gray-900 mb-4">
                    Account Overview
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Role:</span>
                      <span className="font-bold">{user.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Active Plan:</span>
                      <span className="font-bold text-blue-600">
                        {user.plan}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Discount:</span>
                      <span className="font-bold text-emerald-600">
                        {discountRate}% OFF
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/70 rounded-2xl p-6 border border-blue-100">
                  <h3 className="text-base font-bold text-gray-900 mb-3">
                    Quick Navigation
                  </h3>
                  <div className="space-y-2 text-sm font-semibold">
                    <Link
                      href="/my-bookings"
                      className="block text-blue-600 hover:text-blue-800 py-1.5"
                    >
                      📋 View My Bookings
                    </Link>
                    <Link
                      href="/planner"
                      className="block text-blue-600 hover:text-blue-800 py-1.5"
                    >
                      🤖 AI Smart Trip Planner
                    </Link>
                    <Link
                      href="/pricing"
                      className="block text-blue-600 hover:text-blue-800 py-1.5"
                    >
                      💎 Manage SaaS Subscription
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="block text-indigo-600 hover:text-indigo-800 py-1.5"
                      >
                        📊 Open SaaS Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="w-full text-left text-red-600 hover:text-red-700 py-1.5 cursor-pointer"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
