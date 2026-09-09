"use client";
const API_URL = "http://127.0.0.1:5000";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Plane,
  Search,
  TrendingUp,
  CalendarDays,
  MapPin,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const typicalFares: Record<string, number> = {
  "BLR → DEL": 5231.33,
  "BLR → BOM": 3461.33,
  "DEL → BOM": 4326.67,
  "DEL → HYD": 3972.67,
  "MAA → HYD": 2753.33,
};

const routes = [
  {
    route: "BLR → DEL",
    city: "Bengaluru → Delhi",
    price: "₹8,259",
    change: "+12.4%",
    up: true,
  },
  {
    route: "BLR → BOM",
    city: "Bengaluru → Mumbai",
    price: "₹7,570",
    change: "+8.7%",
    up: true,
  },
  {
    route: "DEL → BOM",
    city: "Delhi → Mumbai",
    price: "₹7,710",
    change: "-3.2%",
    up: false,
  },
  {
    route: "DEL → HYD",
    city: "Delhi → Hyderabad",
    price: "₹10,350",
    change: "+18.9%",
    up: true,
  },
];

export default function Home() {

  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("BLR");
  const [to, setTo] = useState("DEL");
  const [date, setDate] = useState("2026-09-20");
  const [travelClass, setTravelClass] = useState("1");
  const [selectedFlight, setSelectedFlight] = useState<any>(null);

  const routeKey = selectedFlight
    ? `${selectedFlight.origin} → ${selectedFlight.destination}`
    : "";

  const typicalFare = selectedFlight
  ? typicalFares[routeKey] ?? 0
  : 0;

  const currentFare = selectedFlight
    ? Number(selectedFlight.price)
    : 0;

  const priceDifference =
    typicalFare > 0
      ? ((currentFare - typicalFare) / typicalFare) * 100
      : 0;

  const liveIndex =
    typicalFare > 0
      ? (currentFare / typicalFare) * 100
      : 0;


    const handleSearch = async () => {
  setLoading(true);

  try {
    const response = await fetch(
      `${API_URL}/search?origin=${from}&destination=${to}&travel_date=${date}&travel_class=${travelClass}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("LIVE API DATA:", data);

    setSearchResults(data);
  } catch (error) {
    console.error("Search failed:", error);
    alert("Unable to connect to the live airfare API.");
  } finally {
    setLoading(false);
  }
};

  
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f5f7] text-[#17202a]">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute bottom-[-300px] right-[-200px] h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      {/* Navigation */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
            <Plane size={20} />
          </div>

          <div>
            <p className="font-semibold tracking-tight">
              Airfare<span className="text-[#D71920]">IQ</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              India Price Intelligence
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#intelligence" className="transition hover:text-white">
            Intelligence
          </a>
          <a href="#routes" className="transition hover:text-white">
            Routes
          </a>
          <a href="#advisor" className="transition hover:text-white">
            AI Advisor
          </a>
        </div>

        <button className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/5">
          Explore Data
        </button>
      </nav>

      {/* Hero */}
      <section className="relative mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl items-center px-6 py-20 lg:px-10">
        {/* Decorative route lines */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg
            className="h-full w-full"
            viewBox="0 0 1200 700"
            fill="none"
          >
            <path
              d="M80 560 C300 250 500 600 700 300 C850 80 1000 240 1160 100"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="8 12"
            />
            <circle cx="80" cy="560" r="5" fill="currentColor" />
            <circle cx="700" cy="300" r="5" fill="currentColor" />
            <circle cx="1160" cy="100" r="5" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-sm text-[#D71920]"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#D71920]" />
            Live airfare intelligence
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="max-w-5xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-8xl"
          >
            Know the price.
            <br />
            <span className="text-[#D71920]">
              Before you fly.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 max-w-2xl text-lg leading-8 text-gray-500"
          >
            Real-time airfare intelligence for India. Compare live flight
            prices, understand market movement, and discover whether you
            should book now or wait.
          </motion.p>

          {/* Search box */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl"
          >
            <div className="grid gap-3 md:grid-cols-4">

              {/* FROM */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} />
                  FROM
                </div>

                <input
                  value={from}
                  onChange={(e) => setFrom(e.target.value.toUpperCase())}
                  className="w-full bg-transparent font-medium outline-none"
                  placeholder="Airport code"
                  maxLength={3}
                />
              </div>

              {/* TO */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <MapPin size={14} />
                  TO
                </div>

                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value.toUpperCase())}
                  className="w-full bg-transparent font-medium outline-none"
                  placeholder="Airport code"
                  maxLength={3}
                />
              </div>

             {/* DATE */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
                  <CalendarDays size={14} />
                  DATE
                </div>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-transparent font-medium text-gray-900 outline-none"
                />
              </div>

              {/* TRAVEL CLASS */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                  <Plane size={14} />
                  TRAVEL CLASS
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "1", label: "Economy" },
                    { value: "2", label: "Premium" },
                    { value: "3", label: "Business" },
                    { value: "4", label: "First Class" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTravelClass(option.value)}
                      className={`w-full rounded-lg rounded-lg px-2 py-2 text-xs font-medium whitespace-nowrap transition-all ${
                        travelClass === option.value
                          ? "bg-[#d71920] text-white shadow-sm"
                          : "border border-gray-200 bg-white text-gray-700 hover:border-[#d71920] hover:text-[#d71920]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SEARCH */}
              <button
                onClick={handleSearch}
                className="md:col-start-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71920] px-6 py-4 font-semibold text-white shadow-md transition-all hover:bg-[#b9141a] hover:shadow-lg active:scale-[0.98]"
              >
                <Search size={18} />
                Search Flights
              </button>

              {loading && (
                <p className="mt-4 text-center text-gray-500">
                  Searching live flight prices...
                </p>
              )}

            {searchResults && (
              <div className="mt-6 w-full rounded-2xl border border-white/10 bg-black/20 p-5 col-span-full">
                <h3 className="text-xl font-semibold text-white">
                  Flight Search Results
                </h3>

                <p className="mt-2 text-white/60">
                  {searchResults.flight_count} flights found
                </p>

                <div className="mt-4 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
                  {searchResults.flights?.map((flight: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className="group w-full min-w-0 border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#D71920]/40 hover:shadow-lg"
                      >
                        <div className="flex w-full flex-col gap-5 md:flex-row md:items-center md:justify-between">

                          <div>
                            <p className="text-lg font-semibold text-gray-900">
                              {flight.airline}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {flight.flight_number}
                            </p>
                          </div>

                          <div className="flex flex-col gap-1 text-sm">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {searchResults.origin}
                              </span>

                              <ArrowDownRight
                                size={18}
                                className="rotate-[-45deg] text-[#D71920]"
                              />

                              <span className="font-semibold text-gray-900">
                                {searchResults.destination}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500">
                              {flight.departure_time || "Departure time unavailable"}
                            </p>

                            <p className="text-xs text-gray-500">
                              {flight.arrival_time || "Arrival time unavailable"}
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-wider text-gray-500">
                                From
                              </p>

                              <p className="text-2xl font-bold text-[#D71920]">
                                ₹{Number(flight.price).toLocaleString("en-IN")}
                              </p>
                            </div>

                            <button
                              type="button"
                              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all duration-300 hover:scale-105 hover:bg-cyan-300"
                              onClick={() => {
                                
                                setSelectedFlight(flight)
                              }}
                            >
                              Select
                            </button>
                          </div>

                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>
            )}

            </div>
          </motion.div>
        </div>
        </section>

        {selectedFlight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mt-6 max-w-7xl px-6 lg:px-10"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wider text-[#d71920]">
                Selected Flight
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {selectedFlight.airline}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedFlight.flight_number}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Route</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {searchResults.origin} → {searchResults.destination}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Current Fare</p>
                  <p className="text-2xl font-bold text-[#d71920]">
                    ₹{Number(selectedFlight.price).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      {/* PRICE INTELLIGENCE */}
      {selectedFlight && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#d71920]">
              Price Intelligence
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">

              <div>
                <p className="text-sm text-gray-500">Current Fare</p>
                <p className="mt-1 text-3xl font-bold text-gray-900">
                  ₹{Number(selectedFlight.price).toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Market Status</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  Prices are High
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Above the typical route fare
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Recommendation</p>
                <p className="mt-1 text-2xl font-bold text-[#d71920]">
                  WAIT
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Consider checking again before booking.
                </p>
              </div>

            </div>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Price Trend
                  </p>
                  <p className="mt-1 text-xl font-bold text-[#d71920]">
                    ↗ Rising
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Market movement
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-700">
                    Prices are trending upward
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5">
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#d71920]">
                    Historical Movement
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-gray-900">
                    Airfare Index Trend
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Recent movement in the India Airfare Price Index
                  </p>
                </div>

                <div className="relative h-56 w-full">
                  <div className="absolute inset-0 flex items-end justify-between gap-3">
                    {[95.8, 100.87, 109.31, 119.44, 255.49].map(
                      (value, index) => {
                        const height = `${Math.max(
                          (value / 255.49) * 100,
                          8
                        )}%`;

                        return (
                          <motion.div
                            key={index}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height, opacity: 1 }}
                            transition={{
                              duration: 0.8,
                              delay: index * 0.12,
                            }}
                            className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-500 to-cyan-300"
                          />
                        );
                      }
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-between text-xs text-gray-500">
                  <span>Aug 01</span>
                  <span>Aug 15</span>
                  <span>Sep 01</span>
                  <span>Sep 04</span>
                  <span>Sep 05</span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-sm text-gray-500">
                    Current Index
                  </span>
                  <span className="text-lg font-bold text-[#d71920]">
                    {liveIndex.toFixed(2)}
                  </span>
                </div>
              </div>
                            <p className="text-sm leading-6 text-gray-600">
                              This fare is currently above the typical price for this route.
                              Our price intelligence suggests waiting may provide a better fare.
                            </p>
                          </div>
                        </div>
                      </section>
                    )}

    


      {/* Intelligence */}
      <section
        id="intelligence"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div className="mb-10">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D71920]">
            Market intelligence
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">
            India Airfare Index
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Main index card */}
          <motion.div
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8"
          >
            <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/40">CURRENT AIRFARE INDEX</p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 text-7xl font-semibold tracking-[-0.05em]"
                >
                  255.49
                </motion.p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-red-400/10 px-3 py-1.5 text-sm text-red-300">
                <ArrowUpRight size={16} />
                14.8%
              </div>
            </div>

            <div className="mt-12 flex h-40 items-end gap-2">
              {[35, 48, 43, 60, 54, 72, 65, 82, 76, 94, 88, 100].map(
                (height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{
                      duration: 0.6,
                      delay: index * 0.04,
                    }}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-500/20 to-cyan-300/80"
                  />
                )
              )}
            </div>

            <div className="mt-5 flex justify-between text-xs text-white/30">
              <span>01 Aug</span>
              <span>15 Aug</span>
              <span>01 Sep</span>
              <span>05 Sep</span>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid gap-5">
            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/40">AVERAGE AIRFARE</p>
                <TrendingUp className="text-[#D71920]" size={20} />
              </div>
              <p className="mt-5 text-4xl font-semibold">₹8,983</p>
              <p className="mt-2 text-sm text-white/40">
                Across tracked Indian routes
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-7"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/40">LIVE OBSERVATIONS</p>
                <ShieldCheck className="text-[#D71920]" size={20} />
              </div>
              <p className="mt-5 text-4xl font-semibold">163</p>
              <p className="mt-2 text-sm text-white/40">
                Flight prices collected
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Routes */}
      <section
        id="routes"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-[#D71920]">
              Live routes
            </p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">
              What is happening right now?
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/40">
            Prices shown from the latest collected flight observations.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {routes.map((item, index) => (
            <motion.div
              key={item.route}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className="group w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold">{item.route}</p>
                  <p className="mt-1 text-sm text-white/40">{item.city}</p>
                </div>

                <Plane
                  size={20}
                  className="text-white/30 transition group-hover:text-[#D71920]"
                />
              </div>

              <div className="mt-8 flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/30">FROM</p>
                  <p className="mt-1 text-3xl font-semibold">{item.price}</p>
                </div>

                <div
                  className={`flex items-center gap-1 text-sm ${
                    item.up ? "text-red-300" : "text-emerald-300"
                  }`}
                >
                  {item.up ? (
                    <ArrowUpRight size={17} />
                  ) : (
                    <ArrowDownRight size={17} />
                  )}
                  {item.change}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Advisor */}
      <section
        id="advisor"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.08] via-white/[0.03] to-blue-500/[0.08] p-8 md:p-12"
        >
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-[100px]" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-[#D71920]">
              <Sparkles size={20} />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">
                AI Booking Advisor
              </span>
            </div>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
              Should you book now
              <br />
              or wait?
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-500">
              Our intelligence engine combines current airfare, route
              averages and historical movement to help you make a better
              booking decision.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                  <TrendingUp size={20} />
                </div>

                <div>
                  <p className="font-semibold">Booking recommended</p>
                  <p className="text-sm text-white/40">
                    Prices are currently trending upward.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-white/30">CURRENT</p>
                  <p className="mt-1 font-semibold">₹8,259</p>
                </div>

                <div>
                  <p className="text-xs text-white/30">ROUTE AVERAGE</p>
                  <p className="mt-1 font-semibold">₹5,231</p>
                </div>

                <div>
                  <p className="text-xs text-white/30">SIGNAL</p>
                  <p className="mt-1 font-semibold text-red-300">
                    Prices rising
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-4 text-sm text-white/30 md:flex-row">
          <p>AirfareIQ — India Airfare Price Intelligence</p>
          <p>Prototype • SIH 2026</p>
        </div>
      </footer>
    </main>
  );
}