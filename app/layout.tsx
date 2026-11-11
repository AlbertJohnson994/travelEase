import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Navebar from "./components/Navebar";
import Footer from "./components/Footer";
import { AuthProvider } from "./components/AuthProvider";
import { LocationProvider } from "./components/LocationProvider";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelEase Cloud - Modern Travel Booking, Maps & Itinerary SaaS",
  description:
    "Discover nearby tourist sites, beaches, mountains, live weather, and book curated global travel packages with TravelEase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased overflow-x-hidden`}
      >
        <AuthProvider>
          <LocationProvider>
            <Navebar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </LocationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
