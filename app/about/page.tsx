import React from "react";
import Link from "next/link";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About TravelEase
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&#39;re passionate about creating unforgettable travel experiences for
            our customers
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed">
              To make travel accessible, enjoyable, and memorable for everyone
              by providing curated experiences, competitive prices, and
              exceptional customer service.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl">👁️</span>
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed">
              To become the most trusted travel platform worldwide, known for
              our innovative packages and commitment to sustainable tourism.
            </p>
          </div>
        </div>

        {/* Story */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              Founded in 2020, TravelEase began as a small startup with a big
              dream: to revolutionize the way people experience travel. Our
              founders, passionate travelers themselves, recognized the
              challenges people face when planning their perfect getaway.
            </p>
            <p className="mb-6">
              From navigating countless websites to comparing prices and reading
              endless reviews, the process was often overwhelming. We set out to
              change that by creating a platform that simplifies travel planning
              while ensuring quality and value.
            </p>
            <p>
              Today, we&#39;ve helped thousands of travelers discover new
              destinations, create lasting memories, and experience the world in
              ways they never thought possible.
            </p>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
            <div className="text-gray-600">Happy Travelers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">Destinations</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">5★</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-gray-600">Customer Support</div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-blue-600 rounded-lg text-white p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="mb-6 text-blue-100">
            Join thousands of satisfied travelers and discover your next
            adventure with us.
          </p>
          <Link
            href="/destinations"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Explore Destinations
          </Link>
        </div>
      </div>
    </div>
  );
}
