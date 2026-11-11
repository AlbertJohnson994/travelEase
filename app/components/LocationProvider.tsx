"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

export interface RouteMetric {
  country: string;
  airport: string;
  distanceKm: number;
  distanceMiles: number;
  estimatedFlightHours: number;
  destLat: number;
  destLon: number;
}

export interface ClientLocationIntel {
  location: {
    lat: number;
    lon: number;
    city: string;
    region: string;
    country: string;
    countryCode: string;
  };
  weather: {
    temperatureC: number;
    windSpeedKmh: number;
    condition: string;
    icon: string;
  };
  nearbyPlaces: NearbyPlace[];
  routeMetrics: RouteMetric[];
}

interface LocationContextType {
  intel: ClientLocationIntel | null;
  loadingLocation: boolean;
  permissionState: "prompt" | "granted" | "denied";
  mapsLibraryEnabled: boolean;
  showPromptModal: boolean;
  setShowPromptModal: (show: boolean) => void;
  requestLiveGeolocation: (mode?: "always" | "once") => Promise<void>;
  blockGeolocation: () => void;
  enableMapsLibrary: () => void;
  disableMapsLibrary: () => void;
  searchLocationByCity: (city: string) => Promise<void>;
  getRouteForCountry: (country: string) => RouteMetric | undefined;
}

const LocationContext = createContext<LocationContextType>({
  intel: null,
  loadingLocation: false,
  permissionState: "prompt",
  mapsLibraryEnabled: true,
  showPromptModal: false,
  setShowPromptModal: () => {},
  requestLiveGeolocation: async () => {},
  blockGeolocation: () => {},
  enableMapsLibrary: () => {},
  disableMapsLibrary: () => {},
  searchLocationByCity: async () => {},
  getRouteForCountry: () => undefined,
});

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [intel, setIntel] = useState<ClientLocationIntel | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [permissionState, setPermissionState] = useState<
    "prompt" | "granted" | "denied"
  >("prompt");
  const [mapsLibraryEnabled, setMapsLibraryEnabled] = useState(true);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const fetchIntelFromApi = async (params: {
    lat?: number;
    lon?: number;
    city?: string;
  }) => {
    setLoadingLocation(true);
    try {
      const qs = new URLSearchParams();
      if (params.lat !== undefined && params.lon !== undefined) {
        qs.set("lat", String(params.lat));
        qs.set("lon", String(params.lon));
      }
      if (params.city) {
        qs.set("city", params.city);
      }

      const res = await fetch(`/api/location-intel?${qs.toString()}`);
      if (res.ok) {
        const data: ClientLocationIntel = await res.json();
        setIntel(data);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            "travelease_location_intel",
            JSON.stringify(data)
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch location intelligence:", err);
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPerm = localStorage.getItem("travelease_geo_perm");
    const savedMaps = localStorage.getItem("travelease_maps_enabled");
    const cachedIntel = sessionStorage.getItem("travelease_location_intel");

    if (savedMaps === "false") {
      setMapsLibraryEnabled(false);
    }

    if (cachedIntel) {
      try {
        setIntel(JSON.parse(cachedIntel));
      } catch {
        // ignore
      }
    }

    if (savedPerm === "granted") {
      setPermissionState("granted");
      if (!cachedIntel) {
        requestLiveGeolocation("always");
      }
    } else if (savedPerm === "denied") {
      setPermissionState("denied");
      if (!cachedIntel) {
        fetchIntelFromApi({});
      }
    } else {
      // Show location permission prompt after a brief moment and load IP fallback in background
      setShowPromptModal(true);
      if (!cachedIntel) {
        fetchIntelFromApi({});
      }
    }
  }, []);

  const requestLiveGeolocation = async (mode: "always" | "once" = "always") => {
    setShowPromptModal(false);
    setLoadingLocation(true);

    if (typeof window !== "undefined") {
      if (mode === "always") {
        localStorage.setItem("travelease_geo_perm", "granted");
      }
      localStorage.setItem("travelease_maps_enabled", "true");
    }
    setPermissionState("granted");
    setMapsLibraryEnabled(true);

    if (typeof navigator !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchIntelFromApi({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        async () => {
          // If browser hardware GPS times out or is denied at OS level, fall back to IP geolocation
          await fetchIntelFromApi({});
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000,
        }
      );
    } else {
      await fetchIntelFromApi({});
    }
  };

  const blockGeolocation = () => {
    setShowPromptModal(false);
    setPermissionState("denied");
    if (typeof window !== "undefined") {
      localStorage.setItem("travelease_geo_perm", "denied");
    }
  };

  const enableMapsLibrary = () => {
    setMapsLibraryEnabled(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("travelease_maps_enabled", "true");
    }
    if (permissionState !== "granted") {
      requestLiveGeolocation("once");
    }
  };

  const disableMapsLibrary = () => {
    setMapsLibraryEnabled(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("travelease_maps_enabled", "false");
    }
  };

  const searchLocationByCity = async (city: string) => {
    if (!city.trim()) return;
    await fetchIntelFromApi({ city: city.trim() });
  };

  const getRouteForCountry = (country: string) => {
    return intel?.routeMetrics?.find(
      (r) => r.country.toLowerCase() === country.toLowerCase()
    );
  };

  return (
    <LocationContext.Provider
      value={{
        intel,
        loadingLocation,
        permissionState,
        mapsLibraryEnabled,
        showPromptModal,
        setShowPromptModal,
        requestLiveGeolocation,
        blockGeolocation,
        enableMapsLibrary,
        disableMapsLibrary,
        searchLocationByCity,
        getRouteForCountry,
      }}
    >
      {children}

      {/* Browser-Style Location & Maps Permission Prompt Popup */}
      {showPromptModal && (
        <div className="fixed top-20 left-4 sm:left-6 z-50 max-w-sm w-[calc(100vw-2rem)] bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-5 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-lg shrink-0">
                📍
              </div>
              <div>
                <div className="text-xs text-blue-300 font-semibold">
                  TravelEase Cloud wants to
                </div>
                <h4 className="text-base font-bold text-white leading-tight">
                  Know your location
                </h4>
              </div>
            </div>
            <button
              onClick={() => setShowPromptModal(false)}
              className="text-slate-400 hover:text-white text-sm px-1.5 cursor-pointer"
              aria-label="Close prompt"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Allow location access to discover nearby{" "}
            <strong className="text-white">
              tourist sites, beaches, mountains, live weather
            </strong>
            , and calculate flight routes from your city.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={blockGeolocation}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition cursor-pointer"
            >
              Block
            </button>
            <button
              onClick={() => requestLiveGeolocation("once")}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-white transition cursor-pointer"
            >
              Just this time
            </button>
            <button
              onClick={() => requestLiveGeolocation("always")}
              className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md transition cursor-pointer"
            >
              Allow
            </button>
          </div>
        </div>
      )}
    </LocationContext.Provider>
  );
}

export function useLocationIntel() {
  return useContext(LocationContext);
}

