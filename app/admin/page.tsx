"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStatsData {
  kpis: {
    totalBookingRevenue: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalUsers: number;
    paidSubscribers: number;
    totalDestinations: number;
    totalPackages: number;
    activePromotions: number;
    openSupportTickets: number;
  };
  users: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
    plan: "FREE" | "PRO" | "ELITE";
    createdAt: string;
    _count: { bookings: number };
  }[];
  destinations: {
    id: string;
    name: string;
    location: string;
    country: string;
    category: string;
    price: number;
    rating: number;
    _count: { packages: number; reviews: number };
  }[];
  packages: {
    id: string;
    name: string;
    price: number;
    duration: number;
    destination: { id: string; name: string; country: string };
    _count: { bookings: number };
  }[];
  bookings: {
    id: string;
    travelDate: string;
    travelers: number;
    totalPrice: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    transport: string;
    createdAt: string;
    user: { id: string; name: string; email: string; plan: string };
    package: {
      id: string;
      name: string;
      destination: { id: string; name: string; category: string };
    };
  }[];
  promotions: {
    id: string;
    title: string;
    promoCode?: string | null;
    discount: number;
    validUntil: string;
    destination: { id: string; name: string };
  }[];
  messages: {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
  }[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "bookings" | "catalog" | "promotions" | "users"
  >("overview");
  const [bannerMsg, setBannerMsg] = useState("");

  // New Destination Form State
  const [newDest, setNewDest] = useState({
    name: "",
    location: "",
    country: "",
    category: "BEACH",
    price: "1350",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    description: "",
  });

  // New Package Form State
  const [newPkg, setNewPkg] = useState({
    name: "",
    destinationId: "",
    price: "1950",
    duration: "6",
    inclusions:
      "5-Star Resort Stay, Daily Breakfast & Dinner, Airport Chauffeur, Guided Excursion",
    description: "",
  });

  // New Promotion Form State
  const [newPromo, setNewPromo] = useState({
    title: "",
    promoCode: "",
    discount: "20",
    validUntil: "2027-12-31",
    destinationId: "",
    description: "",
  });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const json: AdminStatsData = await res.json();
        setData(json);
        if (json.destinations.length > 0) {
          setNewPkg((prev) => ({
            ...prev,
            destinationId: prev.destinationId || json.destinations[0].id,
          }));
          setNewPromo((prev) => ({
            ...prev,
            destinationId: prev.destinationId || json.destinations[0].id,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showToast = (msg: string) => {
    setBannerMsg(msg);
    setTimeout(() => setBannerMsg(""), 4000);
  };

  const handleBookingStatus = async (
    bookingId: string,
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED"
  ) => {
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      showToast(`Booking #${bookingId.slice(-6)} updated to ${status}`);
      fetchStats();
    }
  };

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/destinations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newDest),
    });
    if (res.ok) {
      showToast(`Destination "${newDest.name}" created!`);
      setNewDest({
        name: "",
        location: "",
        country: "",
        category: "BEACH",
        price: "1350",
        image:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        description: "",
      });
      fetchStats();
    }
  };

  const handleDeleteDestination = async (id: string) => {
    const res = await fetch(`/api/destinations/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Destination removed.");
      fetchStats();
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPkg),
    });
    if (res.ok) {
      showToast(`Package "${newPkg.name}" published!`);
      setNewPkg((prev) => ({
        ...prev,
        name: "",
        description: "",
      }));
      fetchStats();
    }
  };

  const handleDeletePackage = async (id: string) => {
    const res = await fetch(`/api/packages/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Package removed.");
      fetchStats();
    }
  };

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/promotions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPromo),
    });
    if (res.ok) {
      showToast(`Promotion "${newPromo.title}" launched!`);
      setNewPromo((prev) => ({
        ...prev,
        title: "",
        promoCode: "",
        description: "",
      }));
      fetchStats();
    }
  };

  const handleDeletePromotion = async (id: string) => {
    const res = await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Promotion deleted.");
      fetchStats();
    }
  };

  const handleUserPlanChange = async (
    id: string,
    plan: "FREE" | "PRO" | "ELITE"
  ) => {
    const res = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, plan }),
    });
    if (res.ok) {
      showToast(`User subscription updated to ${plan}`);
      fetchStats();
    }
  };

  const handleTicketStatus = async (id: string, status: string) => {
    const res = await fetch("/api/contact", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      showToast(`Support ticket marked ${status}`);
      fetchStats();
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    await fetch("/api/admin/stats", { method: "POST" });
    await fetchStats();
    showToast("Demo database re-seeded with fresh SaaS data!");
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">
            Loading SaaS Admin Control Center...
          </p>
        </div>
      </div>
    );
  }

  const { kpis } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top Admin Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full">
              TravelEase Cloud Operations
            </span>
            <h1 className="text-3xl font-extrabold mt-2">
              SaaS Admin Control Center
            </h1>
            <p className="text-gray-300 text-sm mt-1">
              Real-time revenue metrics, booking approvals, catalog CRUD, promo
              codes & customer support
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleResetDemo}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              🔄 Reset Demo Data
            </button>
            <Link
              href="/destinations"
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              View Live Storefront →
            </Link>
          </div>
        </div>

        {bannerMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-xl font-semibold text-sm shadow-xs">
            ✓ {bannerMsg}
          </div>
        )}

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              Booking GMV
            </div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">
              ${kpis.totalBookingRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {kpis.totalBookings} total reservations
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              SaaS Pass MRR
            </div>
            <div className="text-2xl font-extrabold text-indigo-600 mt-1">
              ${kpis.monthlyRecurringRevenue.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              ARR: ${kpis.annualRecurringRevenue.toLocaleString()}/yr
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              Subscribers
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {kpis.paidSubscribers} / {kpis.totalUsers}
            </div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-1">
              PRO & ELITE members
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              Destinations
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mt-1">
              {kpis.totalDestinations}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              {kpis.totalPackages} active packages
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              Active Promos
            </div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">
              {kpis.activePromotions}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Live discount campaigns
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
            <div className="text-xs font-bold uppercase text-gray-400">
              Support Inbox
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">
              {kpis.openSupportTickets}
            </div>
            <div className="text-[11px] text-gray-500 mt-1">
              Open customer inquiries
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-3">
          {[
            { id: "overview", label: "📊 Overview & Analytics" },
            {
              id: "bookings",
              label: `🧾 Bookings (${data.bookings.length})`,
            },
            {
              id: "catalog",
              label: `🌍 Destinations & Packages (${data.destinations.length})`,
            },
            {
              id: "promotions",
              label: `🎁 Promotions (${data.promotions.length})`,
            },
            {
              id: "users",
              label: `👥 Users & Support (${data.users.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(
                  tab.id as
                    | "overview"
                    | "bookings"
                    | "catalog"
                    | "promotions"
                    | "users"
                )
              }
              className={`px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Recent Customer Bookings
                </h2>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Manage All →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                      <th className="py-3">Customer</th>
                      <th className="py-3">Package</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.bookings.slice(0, 6).map((b) => (
                      <tr key={b.id}>
                        <td className="py-3">
                          <div className="font-bold text-gray-900">
                            {b.user.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.user.email}
                          </div>
                        </td>
                        <td className="py-3">
                          <div className="font-medium text-gray-800">
                            {b.package.name}
                          </div>
                          <div className="text-xs text-gray-400">
                            {b.package.destination.name} • {b.travelers} guests
                          </div>
                        </td>
                        <td className="py-3 font-bold text-blue-600">
                          ${b.totalPrice.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900">
                Pipeline Health
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                  <span className="font-semibold text-emerald-800">
                    Confirmed Trips
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {kpis.confirmedBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                  <span className="font-semibold text-amber-800">
                    Pending Approval
                  </span>
                  <span className="font-extrabold text-amber-700">
                    {kpis.pendingBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="font-semibold text-blue-800">
                    Completed Trips
                  </span>
                  <span className="font-extrabold text-blue-700">
                    {kpis.completedBookings}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-xl">
                  <span className="font-semibold text-red-800">Cancelled</span>
                  <span className="font-extrabold text-red-700">
                    {kpis.cancelledBookings}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              All Customer Reservations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-xs uppercase text-gray-400">
                    <th className="py-3">Ref</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Package & Destination</th>
                    <th className="py-3">Travel Date</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-3.5 font-mono text-xs text-gray-500">
                        #{b.id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3.5">
                        <div className="font-bold text-gray-900">
                          {b.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.user.email} ({b.user.plan})
                        </div>
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-gray-900">
                          {b.package.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {b.package.destination.name} • {b.travelers} guests •{" "}
                          {b.transport}
                        </div>
                      </td>
                      <td className="py-3.5 text-xs">
                        {new Date(b.travelDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 font-extrabold text-blue-600">
                        ${b.totalPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleBookingStatus(b.id, "CONFIRMED")}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => handleBookingStatus(b.id, "COMPLETED")}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleBookingStatus(b.id, "CANCELLED")}
                          className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DESTINATIONS & PACKAGES CRUD */}
        {activeTab === "catalog" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Create Destination Form */}
              <form
                onSubmit={handleCreateDestination}
                className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  ➕ Add New Destination
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Destination Name (e.g. Bali Escape)"
                    value={newDest.name}
                    onChange={(e) =>
                      setNewDest({ ...newDest, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Country (e.g. Indonesia)"
                    value={newDest.country}
                    onChange={(e) =>
                      setNewDest({ ...newDest, country: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="City / Region (e.g. Ubud & Seminyak)"
                    value={newDest.location}
                    onChange={(e) =>
                      setNewDest({ ...newDest, location: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <select
                    value={newDest.category}
                    onChange={(e) =>
                      setNewDest({ ...newDest, category: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
                  >
                    <option value="BEACH">BEACH</option>
                    <option value="MOUNTAIN">MOUNTAIN</option>
                    <option value="CITY">CITY</option>
                    <option value="HISTORICAL">HISTORICAL</option>
                    <option value="ADVENTURE">ADVENTURE</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Base Price ($)"
                    value={newDest.price}
                    onChange={(e) =>
                      setNewDest({ ...newDest, price: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newDest.image}
                    onChange={(e) =>
                      setNewDest({ ...newDest, image: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
                <textarea
                  rows={2}
                  required
                  placeholder="Destination description..."
                  value={newDest.description}
                  onChange={(e) =>
                    setNewDest({ ...newDest, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Create Destination
                </button>
              </form>

              {/* Create Package Form */}
              <form
                onSubmit={handleCreatePackage}
                className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4"
              >
                <h3 className="text-lg font-bold text-gray-900">
                  📦 Add New Travel Package
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Package Title"
                    value={newPkg.name}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, name: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <select
                    value={newPkg.destinationId}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, destinationId: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
                  >
                    {data.destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="Price ($)"
                    value={newPkg.price}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, price: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                  <input
                    type="number"
                    required
                    placeholder="Duration (Days)"
                    value={newPkg.duration}
                    onChange={(e) =>
                      setNewPkg({ ...newPkg, duration: e.target.value })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Comma-separated inclusions"
                  value={newPkg.inclusions}
                  onChange={(e) =>
                    setNewPkg({ ...newPkg, inclusions: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
                <textarea
                  rows={2}
                  required
                  placeholder="Package description..."
                  value={newPkg.description}
                  onChange={(e) =>
                    setNewPkg({ ...newPkg, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 cursor-pointer"
                >
                  Publish Package
                </button>
              </form>
            </div>

            {/* Catalog List */}
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Active Destinations ({data.destinations.length}) & Packages (
                {data.packages.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.destinations.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 border border-gray-200 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900">
                        {d.name}{" "}
                        <span className="text-xs text-blue-600">
                          (${d.price})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {d.location}, {d.country} • {d.category} •{" "}
                        {d._count.packages} packages
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDestination(d.id)}
                      className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.packages.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900">
                        📦 {p.name}{" "}
                        <span className="text-xs text-indigo-600">
                          (${p.price} • {p.duration}d)
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {p.destination.name} • {p._count.bookings} bookings
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePackage(p.id)}
                      className="text-xs text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROMOTIONS */}
        {activeTab === "promotions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form
              onSubmit={handleCreatePromotion}
              className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6 space-y-4 h-fit"
            >
              <h3 className="text-lg font-bold text-gray-900">
                🎁 Launch Flash Promotion
              </h3>
              <input
                type="text"
                required
                placeholder="Campaign Title"
                value={newPromo.title}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Promo Code (e.g. SUMMER25)"
                  value={newPromo.promoCode}
                  onChange={(e) =>
                    setNewPromo({ ...newPromo, promoCode: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm uppercase"
                />
                <input
                  type="number"
                  required
                  placeholder="Discount %"
                  value={newPromo.discount}
                  onChange={(e) =>
                    setNewPromo({ ...newPromo, discount: e.target.value })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <select
                value={newPromo.destinationId}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, destinationId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white"
              >
                {data.destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                required
                value={newPromo.validUntil}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, validUntil: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <textarea
                rows={2}
                required
                placeholder="Promotion terms & description..."
                value={newPromo.description}
                onChange={(e) =>
                  setNewPromo({ ...newPromo, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 cursor-pointer"
              >
                Launch Promotion
              </button>
            </form>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Active Promotions & Discount Codes
              </h3>
              <div className="space-y-3">
                {data.promotions.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 border border-gray-200 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-red-100 text-red-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                          {p.discount}% OFF
                        </span>
                        <span className="font-bold text-gray-900">
                          {p.title}
                        </span>
                        {p.promoCode && (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {p.promoCode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Destination: {p.destination.name} • Valid until{" "}
                        {new Date(p.validUntil).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePromotion(p.id)}
                      className="text-xs text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USERS & SUPPORT INBOX */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Registered Users & SaaS Plans
              </h3>
              <div className="space-y-3">
                {data.users.map((u) => (
                  <div
                    key={u.id}
                    className="p-4 border border-gray-200 rounded-xl flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-gray-900">
                        {u.name}{" "}
                        <span className="text-xs text-gray-400">
                          ({u.role})
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {u.email} • {u._count.bookings} bookings
                      </div>
                    </div>
                    <select
                      value={u.plan}
                      onChange={(e) =>
                        handleUserPlanChange(
                          u.id,
                          e.target.value as "FREE" | "PRO" | "ELITE"
                        )
                      }
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                    >
                      <option value="FREE">FREE</option>
                      <option value="PRO">PRO ($19/mo)</option>
                      <option value="ELITE">ELITE ($49/mo)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Concierge Support Tickets ({data.messages.length})
              </h3>
              <div className="space-y-4">
                {data.messages.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 border border-gray-200 rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full mr-2 ${
                            m.status === "OPEN"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {m.status}
                        </span>
                        <span className="font-bold text-sm text-gray-900">
                          {m.subject}
                        </span>
                      </div>
                      {m.status === "OPEN" && (
                        <button
                          onClick={() => handleTicketStatus(m.id, "RESOLVED")}
                          className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-semibold cursor-pointer"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{m.message}</p>
                    <div className="text-[11px] text-gray-400 mt-2">
                      From: {m.name} ({m.email})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

