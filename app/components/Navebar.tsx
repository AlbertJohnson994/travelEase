"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navebar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            TravelEase
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link
              href="/destinations"
              className={`hover:text-blue-600 ${
                pathname === "/destinations" ? "text-blue-600" : ""
              }`}
            >
              Destinations
            </Link>
            <Link
              href="/packages"
              className={`hover:text-blue-600 ${
                pathname === "/packages" ? "text-blue-600" : ""
              }`}
            >
              Packages
            </Link>
            <Link
              href="/promotions"
              className={`hover:text-blue-600 ${
                pathname === "/promotions" ? "text-blue-600" : ""
              }`}
            >
              Promotions
            </Link>
            <Link
              href="/about"
              className={`hover:text-blue-600 ${
                pathname === "/about" ? "text-blue-600" : ""
              }`}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`hover:text-blue-600 ${
                pathname === "/contact" ? "text-blue-600" : ""
              }`}
            >
              Contact
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
