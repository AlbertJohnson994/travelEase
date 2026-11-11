"use client";

import React, { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const { setUser } = useAuth();

  const submitCredentials = async (email: string, password: string) => {
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.user) {
        setUser(data.user);
        router.push(data.user.role === "ADMIN" ? "/admin" : "/profile");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Invalid credentials");
      }
    } catch {
      setErrorMsg("Network error while signing in.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCredentials(formData.email, formData.password);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
            ✈️
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Welcome Back to TravelEase
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Sign in to manage bookings and access member discounts
          </p>
        </div>

        {message && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-medium">
            ✓ {message}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* 1-Click Instant Demo Accounts */}
        <div className="mb-6 bg-blue-50/70 border border-blue-100 rounded-xl p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-2">
            ⚡ Instant 1-Click Demo Login
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                submitCredentials("alex@travelease.com", "travel123")
              }
              className="bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 py-2 px-3 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              👤 Customer (PRO)
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                submitCredentials("admin@travelease.com", "admin123")
              }
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              🛡️ SaaS Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="alex@travelease.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 focus:border-blue-500 focus:outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&#39;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 font-semibold hover:text-blue-500"
          >
            Create free account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading sign in...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
