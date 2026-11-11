import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Navebar from "./components/Navebar";
import Footer from "./components/Footer";
import { AuthProvider } from "./components/AuthProvider";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelEase Cloud - Modern Travel Booking & Itinerary SaaS",
  description:
    "Book curated global destinations, all-inclusive travel packages, AI-planned itineraries, and unlock VIP membership perks with TravelEase.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <Navebar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
