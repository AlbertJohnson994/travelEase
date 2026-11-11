import { NextResponse } from "next/server";

export interface NearbyPlace {
  id: string;
  title: string;
  category: "BEACH" | "MOUNTAIN" | "HISTORICAL" | "NATURE" | "ATTRACTION";
  distanceKm: number;
  lat: number;
  lon: number;
  summary: string;
  image: string;
  url: string;
}

const DESTINATION_COORDS: Record<
  string,
  { lat: number; lon: number; airport: string }
> = {
  Maldives: { lat: 4.1755, lon: 73.5093, airport: "MLE (Velana Intl)" },
  Switzerland: { lat: 46.6863, lon: 7.8632, airport: "ZRH (Zurich Intl)" },
  Japan: { lat: 35.0116, lon: 135.7681, airport: "KIX / HND (Tokyo/Osaka)" },
  Greece: { lat: 36.3932, lon: 25.4615, airport: "JTR (Santorini Intl)" },
  Chile: { lat: -50.9423, lon: -73.4068, airport: "PUQ (Punta Arenas)" },
  Italy: { lat: 41.9028, lon: 12.4964, airport: "FCO (Rome Fiumicino)" },
  "United States": {
    lat: 40.7128,
    lon: -74.006,
    airport: "JFK (New York Intl)",
  },
};

export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function classifyPlace(
  title: string,
  summary: string
): NearbyPlace["category"] {
  const text = `${title} ${summary}`.toLowerCase();
  if (
    text.includes("beach") ||
    text.includes("coast") ||
    text.includes("island") ||
    text.includes("bay") ||
    text.includes("sea") ||
    text.includes("lagoon") ||
    text.includes("harbour") ||
    text.includes("harbor")
  ) {
    return "BEACH";
  }
  if (
    text.includes("mountain") ||
    text.includes("peak") ||
    text.includes("hill") ||
    text.includes("alp") ||
    text.includes("ridge") ||
    text.includes("volcano") ||
    text.includes("glacier") ||
    text.includes("cliff")
  ) {
    return "MOUNTAIN";
  }
  if (
    text.includes("castle") ||
    text.includes("cathedral") ||
    text.includes("church") ||
    text.includes("temple") ||
    text.includes("palace") ||
    text.includes("museum") ||
    text.includes("monument") ||
    text.includes("historic") ||
    text.includes("ancient") ||
    text.includes("fort")
  ) {
    return "HISTORICAL";
  }
  if (
    text.includes("park") ||
    text.includes("garden") ||
    text.includes("forest") ||
    text.includes("lake") ||
    text.includes("river") ||
    text.includes("reserve") ||
    text.includes("waterfall") ||
    text.includes("valley")
  ) {
    return "NATURE";
  }
  return "ATTRACTION";
}

const CATEGORY_FALLBACK_IMAGES: Record<NearbyPlace["category"], string> = {
  BEACH:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  MOUNTAIN:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  HISTORICAL:
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
  NATURE:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
  ATTRACTION:
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let lat = parseFloat(searchParams.get("lat") || "");
  let lon = parseFloat(searchParams.get("lon") || "");
  const queryCity = searchParams.get("city")?.trim();

  let city = "Your Area";
  let region = "";
  let country = "";
  let countryCode = "";

  try {
    // 1. If a city search query was provided, geocode it via Open-Meteo Geocoding API
    if (queryCity) {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          queryCity
        )}&count=1&language=en&format=json`,
        { next: { revalidate: 3600 } }
      );
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const top = geoData.results[0];
          lat = top.latitude;
          lon = top.longitude;
          city = top.name;
          region = top.admin1 || "";
          country = top.country || "";
          countryCode = top.country_code || "";
        }
      }
    }

    // 2. If no coordinates yet, try IP-based lookup via ipwho.is
    if (isNaN(lat) || isNaN(lon)) {
      try {
        const ipRes = await fetch("https://ipwho.is/", { cache: "no-store" });
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.success && ipData.latitude && ipData.longitude) {
            lat = ipData.latitude;
            lon = ipData.longitude;
            city = ipData.city || "Detected Location";
            region = ipData.region || "";
            country = ipData.country || "";
            countryCode = ipData.country_code || "";
          }
        }
      } catch {
        // Fallback coordinates (Madrid / Central Europe)
      }
    }

    if (isNaN(lat) || isNaN(lon)) {
      lat = 40.4168;
      lon = -3.7038;
      city = "Madrid";
      region = "Community of Madrid";
      country = "Spain";
      countryCode = "ES";
    }

    // 3. Reverse Geocode via BigDataCloud Free Client API if city name isn't resolved yet
    if (city === "Your Area" || !country) {
      try {
        const revRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { next: { revalidate: 3600 } }
        );
        if (revRes.ok) {
          const revData = await revRes.json();
          city =
            revData.city ||
            revData.locality ||
            revData.principalSubdivision ||
            "Current Location";
          region = revData.principalSubdivision || "";
          country = revData.countryName || "";
          countryCode = revData.countryCode || "";
        }
      } catch {
        // ignore reverse geocode error
      }
    }

    // 4. Fetch Live Weather via Open-Meteo API
    let weather = {
      temperatureC: 22,
      windSpeedKmh: 12,
      condition: "Clear Sky",
      icon: "☀️",
    };
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`,
        { next: { revalidate: 900 } }
      );
      if (weatherRes.ok) {
        const wData = await weatherRes.json();
        if (wData.current_weather) {
          const code = wData.current_weather.weathercode;
          let condition = "Sunny & Clear";
          let icon = "☀️";
          if (code >= 1 && code <= 3) {
            condition = "Partly Cloudy";
            icon = "⛅";
          } else if (code >= 45 && code <= 48) {
            condition = "Misty / Fog";
            icon = "🌫️";
          } else if (code >= 51 && code <= 67) {
            condition = "Light Rain";
            icon = "🌧️";
          } else if (code >= 71 && code <= 77) {
            condition = "Alpine Snow";
            icon = "❄️";
          } else if (code >= 80) {
            condition = "Tropical Showers";
            icon = "🌦️";
          }
          weather = {
            temperatureC: Math.round(wData.current_weather.temperature),
            windSpeedKmh: Math.round(wData.current_weather.windspeed),
            condition,
            icon,
          };
        }
      }
    } catch {
      // use default weather
    }

    // 5. Fetch Real Nearby Tourist Sites, Beaches, Mountains & Landmarks via Wikipedia GeoSearch API
    const nearbyPlaces: NearbyPlace[] = [];
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=10000&ggslimit=18&prop=pageimages|extracts|coordinates|info&inprop=url&exintro=1&explaintext=1&exchars=220&piprop=thumbnail&pithumbsize=600&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl, { next: { revalidate: 3600 } });
      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const pages = wikiData?.query?.pages
          ? Object.values(wikiData.query.pages)
          : [];

        for (const rawPage of pages as Array<{
          pageid: number;
          title: string;
          extract?: string;
          fullurl?: string;
          thumbnail?: { source: string };
          coordinates?: Array<{ lat: number; lon: number }>;
        }>) {
          const pLat = rawPage.coordinates?.[0]?.lat ?? lat;
          const pLon = rawPage.coordinates?.[0]?.lon ?? lon;
          const distKm = Number(
            (
              Math.sqrt(
                Math.pow((pLat - lat) * 111, 2) +
                  Math.pow(
                    (pLon - lon) * 111 * Math.cos((lat * Math.PI) / 180),
                    2
                  )
              ) || 0.8
            ).toFixed(1)
          );
          const summary =
            rawPage.extract ||
            `Notable landmark and tourist point of interest near ${city}.`;
          const cat = classifyPlace(rawPage.title, summary);

          nearbyPlaces.push({
            id: String(rawPage.pageid),
            title: rawPage.title,
            category: cat,
            distanceKm: distKm,
            lat: pLat,
            lon: pLon,
            summary,
            image:
              rawPage.thumbnail?.source || CATEGORY_FALLBACK_IMAGES[cat],
            url:
              rawPage.fullurl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                rawPage.title
              )}`,
          });
        }
      }
    } catch {
      // fallback below if Wikipedia GeoSearch is unreachable
    }

    // Ensure rich diversity of categories (Beaches, Mountains, Historical, Nature, Attractions) around the user
    const guaranteedCategories: Array<{
      category: NearbyPlace["category"];
      title: string;
      summary: string;
      offsetLat: number;
      offsetLon: number;
    }> = [
      {
        category: "BEACH",
        title: `${city} Coastal & Waterfront Promenade`,
        summary: `Popular waterfront, beachside relaxation zone, and scenic sunset bay accessible from ${city}.`,
        offsetLat: 0.03,
        offsetLon: 0.04,
      },
      {
        category: "MOUNTAIN",
        title: `${city} Panoramic Ridge & Mountain Viewpoint`,
        summary: `Elevated scenic overlook, hiking trails, and mountain vista offering 360-degree views around ${city}.`,
        offsetLat: 0.05,
        offsetLon: -0.03,
      },
      {
        category: "HISTORICAL",
        title: `${city} Historic Old Town & Cultural Quarter`,
        summary: `Architectural heritage landmarks, museums, monuments, and guided cultural walking routes in ${city}.`,
        offsetLat: -0.01,
        offsetLon: 0.01,
      },
      {
        category: "NATURE",
        title: `${city} Botanical Park & Nature Reserve`,
        summary: `Lush green sanctuary, lakeside walking paths, and outdoor eco-trails near ${city}.`,
        offsetLat: -0.02,
        offsetLon: -0.02,
      },
    ];

    for (const item of guaranteedCategories) {
      const hasCat = nearbyPlaces.some((p) => p.category === item.category);
      if (!hasCat || nearbyPlaces.length < 6) {
        nearbyPlaces.push({
          id: `curated-${item.category.toLowerCase()}`,
          title: item.title,
          category: item.category,
          distanceKm: Number(
            (Math.abs(item.offsetLat) * 111 + 1.4).toFixed(1)
          ),
          lat: Number((lat + item.offsetLat).toFixed(5)),
          lon: Number((lon + item.offsetLon).toFixed(5)),
          summary: item.summary,
          image: CATEGORY_FALLBACK_IMAGES[item.category],
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `${item.category} near ${city} ${country}`
          )}`,
        });
      }
    }

    // 6. Compute Flight Distances & Travel Times from Client's Location to all TravelEase Destinations
    const routeMetrics = Object.entries(DESTINATION_COORDS).map(
      ([destCountry, coords]) => {
        const distanceKm = calculateHaversineKm(
          lat,
          lon,
          coords.lat,
          coords.lon
        );
        const flightHours = Number(
          Math.max(1.5, distanceKm / 820 + 0.6).toFixed(1)
        );
        return {
          country: destCountry,
          airport: coords.airport,
          distanceKm,
          distanceMiles: Math.round(distanceKm * 0.621371),
          estimatedFlightHours: flightHours,
          destLat: coords.lat,
          destLon: coords.lon,
        };
      }
    );

    return NextResponse.json({
      location: {
        lat: Number(lat.toFixed(5)),
        lon: Number(lon.toFixed(5)),
        city,
        region,
        country,
        countryCode,
      },
      weather,
      nearbyPlaces: nearbyPlaces.sort((a, b) => a.distanceKm - b.distanceKm),
      routeMetrics,
    });
  } catch (error) {
    console.error("Location intelligence error:", error);
    return NextResponse.json(
      { error: "Failed to resolve location intelligence" },
      { status: 500 }
    );
  }
}

