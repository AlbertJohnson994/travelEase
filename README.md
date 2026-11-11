# ✈️ TravelEase Cloud — Full-Stack Travel Booking & Membership SaaS

TravelEase is a comprehensive full-stack Travel SaaS platform built with **Next.js 15 (App Router)**, **React 19**, **Prisma ORM (SQLite)**, and **Tailwind CSS v4**.

## 🌟 Key SaaS Features

- **Global Destinations & All-Inclusive Packages (`/destinations`, `/packages`)**: Live filtering by travel style (`BEACH`, `MOUNTAIN`, `CITY`, `HISTORICAL`, `ADVENTURE`), price slider, duration filter, search, and verified customer reviews.
- **SaaS Membership Tiers (`/pricing`)**:
  - **Explorer Pass (`FREE`)**: Standard access to destinations, packages, and AI Trip Planner.
  - **Voyager Pro (`$19/mo`)**: Automatic **10% member discount** on every booking (stackable with promo codes).
  - **Nomad Elite (`$49/mo`)**: Automatic **20% member discount**, VIP lounge access, and dedicated advisor.
- **AI Smart Trip & Budget Planner (`/planner`)**: Interactive recommendation engine that scores packages against your travel style, budget, duration, and group size, and generates a day-by-day itinerary blueprint.
- **End-to-End Checkout & E-Ticket Management (`/booking/[packageId]`, `/my-bookings`)**:
  - Supports Air, Land/Rail, and Sea transport modes.
  - Stackable promo codes (`MALDIVES20`, `ALPS15`, `JAPAN25`, `AEGEAN18`, `WELCOME10`) + automatic SaaS member discounts.
  - Printable E-Ticket itinerary modal and 1-click booking cancellation/reactivation.
- **SaaS Admin Control Center (`/admin`)**:
  - Executive KPIs (Booking GMV, SaaS MRR/ARR, Paid Subscribers, Pipeline Health).
  - Real-time Bookings Approval/Management.
  - Full CRUD for Destinations, Travel Packages, and Flash Promotions.
  - User Subscription Manager & Customer Support Ticket Inbox.

## 🔐 Instant Demo Accounts

On `/auth/login`, use the **1-Click Demo Login** buttons or sign in manually:
- **Customer (Voyager PRO)**: `alex@travelease.com` / `travel123`
- **SaaS Admin (Nomad ELITE)**: `admin@travelease.com` / `admin123`

## 🚀 Running Locally

```bash
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The database automatically seeds itself with 8 global destinations, 9 packages, 4 active promotions, sample bookings, and reviews on first request.
