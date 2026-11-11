"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    plan: "FREE" as "FREE" | "PRO" | "ELITE",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        router.push("/profile");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Signup failed");
      }
    } catch {
      setErrorMsg("Network error while creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
            ✈️
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Create Your TravelEase Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Join thousands of travelers & unlock instant member perks
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="Alex Rivera"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 234-5678"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password (min. 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Membership Tier
            </label>
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
              <option value="FREE">Explorer Pass (Free - 0% discount)</option>
              <option value="PRO">
                Voyager Pro ($19/mo - 10% automatic discount)
              </option>
              <option value="ELITE">
                Nomad Elite ($49/mo - 20% automatic discount + VIP)
              </option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Creating Account..." : "Get Started Now"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 font-semibold hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
