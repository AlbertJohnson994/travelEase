"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function PricingPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">(
    "MONTHLY"
  );
  const [annualSpendEstimate, setAnnualSpendEstimate] = useState(4000);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState("");

  const handleSelectPlan = async (plan: "FREE" | "PRO" | "ELITE") => {
    if (!user) {
      router.push("/auth/login?message=Sign+in+to+activate+your+membership");
      return;
    }

    setUpgradingPlan(plan);
    setSuccessBanner("");
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, plan }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setSuccessBanner(
          `🎉 Congratulations! Your account is now on the ${plan} Membership Plan.`
        );
      }
    } catch (err) {
      console.error("Failed to update plan:", err);
    } finally {
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      id: "FREE" as const,
      name: "Explorer Pass",
      tagline: "Essential access for occasional travelers",
      monthlyPrice: 0,
      annualPrice: 0,
      discount: "0%",
      features: [
        "Access to all global destinations & packages",
        "Standard seasonal promo codes",
        "AI Trip & Budget Planner access",
        "Standard email support",
      ],
      highlight: false,
    },
    {
      id: "PRO" as const,
      name: "Voyager Pro",
      tagline: "Best value for couples & frequent vacationers",
      monthlyPrice: 19,
      annualPrice: 15,
      discount: "10% OFF",
      features: [
        "10% automatic discount on every booking",
        "Stackable with destination promo codes",
        "Free flexible date changes up to 48h",
        "Priority 24/7 live concierge support",
        "Zero platform booking fees",
      ],
      highlight: true,
    },
    {
      id: "ELITE" as const,
      name: "Nomad Elite",
      tagline: "VIP luxury perks & maximum wholesale savings",
      monthlyPrice: 49,
      annualPrice: 39,
      discount: "20% OFF",
      features: [
        "20% automatic discount on every booking",
        "Stackable with all flash deals & promo codes",
        "Complimentary airport VIP lounge access",
        "Dedicated personal travel advisor",
        "Complimentary room & cabin upgrades",
      ],
      highlight: false,
    },
  ];

  const proAnnualSavings = Math.round(annualSpendEstimate * 0.1);
  const eliteAnnualSavings = Math.round(annualSpendEstimate * 0.2);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            TravelEase Cloud Memberships
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-3 mb-4">
            Save Up to 20% on Every Trip
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join our SaaS travel club to unlock automatic member discounts that
            pay for themselves in a single booking.
          </p>

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs">
            <button
              onClick={() => setBillingCycle("MONTHLY")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                billingCycle === "MONTHLY"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("ANNUAL")}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition cursor-pointer ${
                billingCycle === "ANNUAL"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Annual Billing (Save 20%)
            </button>
          </div>
        </div>

        {successBanner && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl text-center font-bold shadow-xs">
            {successBanner}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {plans.map((p) => {
            const isCurrent = user?.plan === p.id;
            const price =
              billingCycle === "MONTHLY" ? p.monthlyPrice : p.annualPrice;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-8 flex flex-col justify-between transition ${
                  p.highlight
                    ? "bg-gradient-to-b from-blue-600 to-indigo-700 text-white shadow-xl scale-[1.02]"
                    : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className={`text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full ${
                        p.highlight
                          ? "bg-white/20 text-white"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {p.discount} Per Booking
                    </span>
                    {p.highlight && (
                      <span className="text-xs font-bold bg-amber-400 text-gray-900 px-2.5 py-0.5 rounded-full">
                        MOST POPULAR
                      </span>
                    )}
                  </div>

                  <h3 className="text-2xl font-extrabold">{p.name}</h3>
                  <p
                    className={`text-sm mt-1 ${
                      p.highlight ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {p.tagline}
                  </p>

                  <div className="my-6">
                    <span className="text-5xl font-extrabold">${price}</span>
                    <span
                      className={`text-sm ${
                        p.highlight ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {" "}
                      / month
                    </span>
                  </div>

                  <ul className="space-y-3 text-sm mb-8">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className={
                            p.highlight
                              ? "text-amber-300 font-bold"
                              : "text-emerald-600 font-bold"
                          }
                        >
                          ✓
                        </span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  disabled={isCurrent || upgradingPlan === p.id}
                  onClick={() => handleSelectPlan(p.id)}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-500 text-white cursor-default"
                      : p.highlight
                        ? "bg-white text-blue-700 hover:bg-blue-50 shadow-md"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isCurrent
                    ? "✓ Current Active Plan"
                    : upgradingPlan === p.id
                      ? "Activating Plan..."
                      : `Switch to ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive ROI Savings Calculator */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">
              💰 Interactive Member Savings Calculator
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Slide to estimate your annual family or personal travel budget
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-gray-600">Estimated Annual Travel Spend:</span>
              <span className="text-2xl text-blue-600">
                ${annualSpendEstimate.toLocaleString()} / year
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={15000}
              step={500}
              value={annualSpendEstimate}
              onChange={(e) => setAnnualSpendEstimate(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold uppercase text-blue-700">
                  With Voyager Pro (10% OFF)
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  Instant package savings
                </div>
              </div>
              <div className="text-3xl font-extrabold text-blue-700">
                +${proAnnualSavings.toLocaleString()}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold uppercase text-amber-800">
                  With Nomad Elite (20% OFF)
                </div>
                <div className="text-sm text-gray-600 mt-0.5">
                  Instant package savings + VIP Lounge
                </div>
              </div>
              <div className="text-3xl font-extrabold text-amber-700">
                +${eliteAnnualSavings.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

