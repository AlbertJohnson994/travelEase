# ✈️ TravelEase Cloud — Full-Stack Travel Booking, Geolocation Radar & Membership SaaS

🌐 **Live Production Demo (Vercel)**: [https://travel-ease-omega-ten.vercel.app](https://travel-ease-omega-ten.vercel.app)
📦 **GitHub Repository**: [https://github.com/AlbertJohnson994/travelEase](https://github.com/AlbertJohnson994/travelEase)

**TravelEase Cloud** is a responsive, end-to-end Travel Booking & Location Intelligence SaaS platform built with **Next.js 15.5.29 (App Router & Turbopack)**, **React 19**, **TypeScript**, **Prisma ORM (SQLite)**, and **Tailwind CSS v4**.

---

## 🌟 Core SaaS & Location Intelligence Features

### 📍 1. Live Geolocation Prompts & Multi-API Tourist Radar (`/explore`)
- **Interactive Location Permission Prompt**: Prompts the client (`Block` | `Just this time` | `Allow`) and connects to the browser's hardware GPS (`navigator.geolocation.getCurrentPosition`) with automatic IP geolocation fallback (`ipwho.is`).
- **Reverse Geocoding & City Search**: Powered by **BigDataCloud Reverse Geocoding** and **Open-Meteo Geocoding API** to identify the client's exact city, region, country, and coordinates—or search any city worldwide.
- **Live Local Weather Telemetry**: Real-time temperature (°C), sky conditions, and wind speed (`km/h`) powered by **Open-Meteo Forecast API**.
- **Nearby Tourist Sites, Beaches & Mountains Discovery**: Connects to the **Wikipedia GeoSearch API** with automatic POI classification (`BEACH`, `MOUNTAIN`, `HISTORICAL`, `NATURE`, `ATTRACTION`), distance calculation in `km`, interactive **Google Maps** satellite/street pin focusing, and 1-click turn-by-turn directions.
- **Great-Circle Flight Telemetry**: Calculates exact Haversine flight distances (`km` & `miles`), arrival hub airports, and estimated flight hours from the client's current location to every global destination.

### 🗺️ 2. Google Maps Booking Gate & Smart Checkout (`/booking/[packageId]`)
- **Google Maps Consent Gate**: Includes an interactive Google Maps & Location consent control (`"This page requires the Google Maps library to load the booking form. If you choose not to enable it, the form will not be displayed."`).
- **Auto-Filled Departure Telemetry**: Automatically populates the traveler's departure city, flight distance, and estimated flight duration alongside an embedded Google Map of the destination.
- **Multi-Modal Transport & Stackable Discounts**:
  - Choose between **Air (`AIR`)**, **Scenic Rail/Land (`LAND`)**, and **Yacht/Sea (`SEA`)** transport.
  - Stack seasonal destination **Promo Codes** (`MALDIVES20`, `ALPS15`, `JAPAN25`, `AEGEAN18`, `WELCOME10`) with automatic **SaaS Membership Discounts** (`10%` or `20%` OFF).

### 💎 3. SaaS Membership Tiers & ROI Calculator (`/pricing`)
- **Explorer Pass (`FREE`)**: Full catalog access, seasonal promo codes, and AI Trip Planner.
- **Voyager Pro (`$19/mo`)**: Automatic **10% member discount** on all bookings, flexible date changes, and zero booking fees.
- **Nomad Elite (`$49/mo`)**: Automatic **20% member discount**, airport VIP lounge passes, and dedicated travel advisor.
- Includes a Monthly/Annual billing toggle, an interactive **Annual Savings ROI Calculator**, and 1-click database-persisted plan upgrades.

### 🤖 4. AI Smart Trip & Budget Planner (`/planner`)
- Multi-criteria recommendation engine that scores packages based on **Travel Style**, **Target Budget per Person**, **Duration (Days)**, and **Group Size**.
- Generates a personalized **Day-by-Day Curated Itinerary Blueprint** with instant 1-click package reservation.

### 📊 5. SaaS Admin Control Center (`/admin`)
- **Executive Analytics**: Real-time Booking GMV, SaaS Monthly Recurring Revenue (MRR), ARR, Paid Subscribers, and Pipeline Health.
- **Bookings Manager**: Approve (`CONFIRMED`), Complete (`COMPLETED`), or Cancel (`CANCELLED`) customer reservations in real time.
- **Catalog & Promotions CRUD**: Create and delete Destinations, All-Inclusive Packages (with custom inclusions), and Flash Promo Codes.
- **Users & Concierge Support Inbox**: Upgrade user subscription plans (`FREE` / `PRO` / `ELITE`), resolve customer support tickets submitted via `/contact`, or reset demo data with 1 click.

### 🎫 6. E-Tickets, Verified Reviews & Wishlist (`/my-bookings`, `/wishlist`)
- Printable **Official E-Ticket & Itinerary Receipt Modal** with confirmation codes and package inclusions.
- Verified customer star ratings and reviews on every destination page (`/destinations/[id]`).
- Persistent Wishlist (`/wishlist`) for saving favorite destinations and packages.

---

## 🔌 External APIs Integrated

| Service / Capability | API Provider | Authentication |
| :--- | :--- | :--- |
| **Hardware Geolocation** | Browser `navigator.geolocation` API | Native User Prompt |
| **IP Geolocation Fallback** | `ipwho.is` REST API | Keyless Public API |
| **Reverse & Forward Geocoding** | BigDataCloud & Open-Meteo Geocoding API | Keyless Public API |
| **Real-Time Weather Telemetry** | Open-Meteo Forecast API (`api.open-meteo.com`) | Keyless Public API |
| **Tourist Sites, Beaches & Mountains** | Wikipedia GeoSearch MediaWiki API | Keyless Public API |
| **Interactive Maps & Directions** | Google Maps Embed & Directions URLs | Built-in Web Embed |

---

## 🔐 Instant 1-Click Demo Accounts

Visit [`/auth/login`](http://localhost:3000/auth/login) and use the **1-Click Instant Demo Login** buttons or enter credentials manually:

- **Customer Account (Voyager PRO — 10% OFF)**: `alex@travelease.com` / `travel123`
- **SaaS Admin Account (Nomad ELITE — 20% OFF)**: `admin@travelease.com` / `admin123`

---

## 🗂️ Project Architecture

```text
TravelEase/
├── app/
│   ├── admin/page.tsx                 # SaaS Admin Control Center (Analytics, CRUD, Support)
│   ├── explore/page.tsx               # Live Geolocation, Tourist Sites, Beaches & Mountains Radar
│   ├── planner/page.tsx               # AI Smart Trip & Budget Planner
│   ├── pricing/page.tsx               # SaaS Membership Tiers & ROI Calculator
│   ├── destinations/
│   │   ├── page.tsx                   # Filterable Global Destinations Catalog
│   │   └── [id]/page.tsx              # Destination Detail, Interactive Map & Verified Reviews
│   ├── packages/page.tsx              # All-Inclusive Packages Explorer
│   ├── booking/[packageId]/page.tsx   # Google Maps Consent Gate & Checkout Flow
│   ├── my-bookings/page.tsx           # Customer Bookings & Printable E-Ticket Modal
│   ├── promotions/page.tsx            # Flash Deals & Copyable Promo Codes
│   ├── wishlist/page.tsx              # Saved Destinations & Packages
│   ├── profile/page.tsx               # User Profile & Subscription Settings
│   ├── users/page.tsx                 # Traveler Community & Subscribers Directory
│   ├── contact/page.tsx               # 24/7 Concierge Support Ticket Form
│   ├── about/page.tsx                 # Company Mission & Platform Story
│   ├── auth/
│   │   ├── login/page.tsx             # Sign In + 1-Click Demo Login
│   │   └── signup/page.tsx            # Account Registration + Membership Tier Selection
│   ├── components/
│   │   ├── AuthProvider.tsx           # Global Auth & Wishlist Context
│   │   ├── LocationProvider.tsx       # Geolocation Prompt, Maps Consent & Telemetry Context
│   │   ├── NearbyExplorerSection.tsx  # Interactive Map & Nearby Tourist Sites Radar
│   │   ├── Navebar.tsx                # Responsive Header with Live Weather & Location Pill
│   │   └── Footer.tsx                 # Responsive Footer & Newsletter Subscription
│   └── api/
│       ├── location-intel/route.ts    # Multi-API Geocoding, Weather, POIs & Flight Telemetry
│       ├── admin/stats/route.ts       # Admin KPIs, MRR/ARR & Demo Database Re-seeding
│       ├── auth/{login,signup,logout,me}/route.ts
│       ├── destinations/              # Destinations CRUD API
│       ├── packages/                  # Packages CRUD API
│       ├── bookings/                  # Bookings Creation & Status Management API
│       ├── promotions/route.ts        # Promotions & Promo Codes API
│       ├── reviews/route.ts           # Verified Customer Reviews API
│       ├── contact/route.ts           # Support Tickets API
│       └── users/route.ts             # Users & Subscription Plan API
├── lib/
│   ├── prisma.ts                      # Prisma Client Singleton
│   ├── auth.ts                        # Server Session & Plan Discount Helpers
│   └── seed-helper.ts                 # Automated Rich SaaS Data Seeder
└── prisma/
    ├── schema.prisma                  # SQLite Schema (Users, Destinations, Packages, Bookings, Reviews, Tickets)
    └── seed.ts                        # CLI Database Seed Script
```

---

## 🚀 Getting Started Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables (`.env`)**:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXT_PUBLIC_APP_NAME="TravelEase"
   ```

3. **Push Prisma schema to SQLite**:
   ```bash
   npx prisma db push
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open in your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal, e.g., `http://localhost:3001`). The database automatically seeds itself on first launch.

---

## ☁️ Deploying to Vercel

This project is pre-configured for **Vercel Serverless Functions**:
- **`postinstall` Hook**: Automatically runs `prisma generate` during installation (`package.json`).
- **Serverless SQLite Runtime (`lib/prisma.ts` & `next.config.ts`)**: Bundles `prisma/dev.db` via `outputFileTracingIncludes` and automatically copies it into writable `/tmp/dev.db` on Vercel serverless cold starts so read and write operations work out of the box.

```bash
# Link and deploy to Vercel Production
vercel link --yes
vercel deploy --prod --yes
```
