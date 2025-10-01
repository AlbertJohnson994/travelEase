import React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import Navebar from "./components/Navebar";
import Footer from "./components/Footer";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TravelEase - Your Perfect Travel Companion",
  description: "Book amazing trips, hotels, and travel packages",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navebar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
