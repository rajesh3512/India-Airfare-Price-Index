"use client";

import { motion } from "framer-motion";
import { useEffect,useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Plane,
  Search,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Clock,
  Clock3,
  IndianRupee,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

type Flight = {
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number | string;
  currency?: string;
};

const typicalFares: Record<string, number> = {
  "BLR → DEL": 5231.33,
  "BLR → BOM": 3461.33,
  "DEL → BOM": 4326.67,
  "DEL → HYD": 3972.67,
  "MAA → HYD": 2753.33,
};

const routeInsights = [
  {
    route: "BLR → DEL",
    typical: 5231,
    current: 8615,
    index: 164.68,
    status: "High",
  },
  {
    route: "BLR → BOM",
    typical: 3461,
    current: 7570,
    index: 218.70,
    status: "High",
  },
  {
    route: "DEL → BOM",
    typical: 4327,
    current: 7710,
    index: 178.20,
    status: "High",
  },
  {
    route: "DEL → HYD",
    typical: 3973,
    current: 10350,
    index: 260.53,
    status: "Very High",
  },
  {
    route: "MAA → HYD",
    typical: 2753,
    current: 11996,
    index: 435.67,
    status: "Very High",
  },
];

const airlineInsights = [
  {
    airline: "IndiGo",
    typical: 5231,
    current: 8259,
    difference: 57.9,
    status: "Above Typical",
  },
  {
    airline: "Air India",
    typical: 5231,
    current: 8268,
    difference: 58.1,
    status: "Above Typical",
  },
  {
    airline: "Akasa Air",
    typical: 5231,
    current: 8714,
    difference: 66.7,
    status: "Highest",
  },
];

const historicalIndex = [95.8, 100.87, 109.31, 119.44, 157.88];
const historicalDates = ["Aug 01", "Aug 15", "Sep 01", "Sep 04", "Sep 05"];
const cpiImpact = {
  airfareInflation: 155.49,
  estimatedCpiContribution: 0.42,
};

export default function Home() {
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [prediction, setPrediction] = useState<{
    predicted_fare: number;
    expected_change: number;
    recommendation: string;
  } | null>(null);

  const [predictionLoading, setPredictionLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState("BLR");
  const [to, setTo] = useState("DEL");
  const [date, setDate] = useState("2026-09-20");
  const [travelClass, setTravelClass] = useState("1");

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  useEffect(() => {
    if (!selectedFlight) {
      setPrediction(null);
      return;
    }

    const getPrediction = async () => {
      setPredictionLoading(true);

      try {
        const currentFare = Number(selectedFlight.price);
        const today = new Date();
        const travelDate = new Date(date);
        const days = Math.max(
          0,
          Math.ceil((travelDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        );

        const response = await fetch(
          `${API_URL}/predict?origin=${selectedFlight.origin}&destination=${selectedFlight.destination}&current_fare=${currentFare}&${days}`
        );

        if (!response.ok) {
          throw new Error("Prediction API error");
        }

        const data = await response.json();

        setPrediction({
          predicted_fare: Number(data.predicted_fare),
          expected_change: Number(data.expected_change),
          recommendation: data.recommendation,
        });
      } catch (error) {
        console.error("Prediction error:", error);
        setPrediction(null);
      } finally {
        setPredictionLoading(false);
      }
    };

    getPrediction();
  }, [selectedFlight]);
  const [bookingStep, setBookingStep] = useState<"details" | "payment" | "confirmed" | null>(null);
  const [selectedSeat, setSelectedSeat] = useState("");
  const [paymentScrollTrigger, setPaymentScrollTrigger] = useState(0);
  useEffect(() => {
    if (bookingStep === "details") {
      requestAnimationFrame(() => {
        document.getElementById("booking-details")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    if (bookingStep === "payment") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const paymentSection = document.getElementById("payment");

          if (paymentSection) {
            const top =
              paymentSection.getBoundingClientRect().top +
              window.scrollY -
              20;

            window.scrollTo({
              top,
              behavior: "smooth",
            });
          }
        });
      });
    }
  }, [bookingStep,paymentScrollTrigger]);
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");  
  const [bookingReference, setBookingReference] = useState("");
  const [showTrips, setShowTrips] = useState(false);
  const [savedTrips, setSavedTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);
  useEffect(() => {
    const trips = localStorage.getItem("airfareiq_trips");

    if (trips) {
      setSavedTrips(JSON.parse(trips));
    }
  }, []);
  

  const routeKey = selectedFlight
    ? `${selectedFlight.origin} → ${selectedFlight.destination}`
    : "";

  const typicalFare = routeKey ? typicalFares[routeKey] ?? 0 : 0;

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

  const marketStatus =
    priceDifference > 10
      ? "Prices are High"
      : priceDifference < -10
      ? "Prices are Low"
      : "Prices are Normal";

  const recommendation =
    priceDifference > 10
      ? "WAIT"
      : priceDifference < -10
      ? "BOOK NOW"
      : "CONSIDER";

  const handleSearch = async () => {
    setLoading(true);
    setSelectedFlight(null);

    try {
      const response = await fetch(
        `${API_URL}/search?origin=${from}&destination=${to}&travel_date=${date}&travel_class=${travelClass}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      console.log("LIVE API DATA:", data);

      setSearchResults(data.flights || []);
    } catch (error) {
      console.error("Search failed:", error);
      alert(
        "Unable to connect to the live flight API. Make sure the Python API server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (value: string) => {
    if (!value) return "--";

    const dateValue = new Date(value);

    if (Number.isNaN(dateValue.getTime())) {
      return value;
    }

    return dateValue.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (value: number | string) => {
    return Number(value).toLocaleString("en-IN");
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#172033] overflow-x-hidden">
      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-200/30 blur-[120px]" />
        <div className="absolute top-[500px] -right-40 h-[400px] w-[500px] rounded-full bg-blue-200/20 blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/60 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033] text-white">
              <Plane size={20} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                AirfareIQ
              </h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                India Price Intelligence
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-gray-500 md:flex">
            <a href="#search" className="transition hover:text-gray-900">
              Search
            </a>
            <a href="#intelligence" className="transition hover:text-gray-900">
              Intelligence
            </a>
            <a href="#trend" className="transition hover:text-gray-900">
              Trends
            </a>

            <button
              onClick={() => setShowTrips(true)}
              className="transition hover:text-gray-900"
            >
              My Trips
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Live Data
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 shadow-sm">
              <Sparkles size={14} />
              Real-time airfare intelligence
            </div>

            <h2 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
              Know the price.
              <br />
              <span className="text-[#d71920]">Before you fly.</span>
            </h2>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-500">
              Compare live flight fares and understand whether today&apos;s
              price is actually worth booking.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <ShieldCheck size={16} />
                Live API data
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <TrendingUp size={16} />
                Price intelligence
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <Sparkles size={16} />
                Smart recommendations
              </div>
            </div>
          </motion.div>

          {/* HERO INDEX CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white bg-[#172033] p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                    India Airfare Index
                  </p>

                  <p className="mt-2 text-sm text-gray-400">
                    {selectedFlight
                      ? routeKey
                      : "National market indicator"}
                  </p>
                </div>

                <TrendingUp className="text-cyan-300" />
              </div>

              <div className="mt-10">
                <motion.div
                  key={selectedFlight ? liveIndex : 255.49}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-6xl font-bold tracking-tight"
                >
                  {selectedFlight
                    ? liveIndex.toFixed(2)
                    : "255.49"}
                </motion.div>

                <p className="mt-3 text-sm text-gray-400">
                  {selectedFlight
                    ? "Selected flight route index"
                    : "Current overall market index"}
                </p>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-gray-400">Flights</p>
                  <p className="mt-1 text-xl font-semibold">
                    {searchResults.length || "—"}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-gray-400">Currency</p>
                  <p className="mt-1 text-xl font-semibold">INR</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className="mt-1 text-xl font-semibold">
                    Live
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SEARCH */}
      <section id="search" className="mx-auto max-w-7xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl"
        >
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#d71920]">
              Flight Search
            </p>

            <h3 className="mt-2 text-2xl font-bold">
              Find live fares
            </h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">
                From
              </label>

              <input
                value={from}
                onChange={(e) => setFrom(e.target.value.toUpperCase())}
                placeholder="BLR"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">
                To
              </label>

              <input
                value={to}
                onChange={(e) => setTo(e.target.value.toUpperCase())}
                placeholder="DEL"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-semibold outline-none transition focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">
                Travel Date
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-500">
                Class
              </label>

              <select
                value={travelClass}
                onChange={(e) => setTravelClass(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-cyan-400"
              >
                <option value="1">Economy</option>
                <option value="2">Premium Economy</option>
                <option value="3">Business</option>
                <option value="4">First Class</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d71920] px-5 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#b9151b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search Flights"}
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SEARCH RESULTS */}
{searchResults.length > 0 && (
  <section className="mx-auto max-w-7xl px-6 py-16">
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
            Live Results
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Flights found
          </h2>
        </div>

        <p className="text-sm text-gray-500">
          {searchResults.length} live options
        </p>
      </div>
    </motion.div>

    <div className="grid gap-5">
      {searchResults.map((flight, index) => {
        const routeKey = `${flight.origin} → ${flight.destination}`;

        const currentPrice = Number(flight.price);

        const typical = Number(
          (typicalFares as Record<string, number>)[routeKey] ?? currentPrice
        );

        const priceDifference = currentPrice - typical;

        const pricePercentage =
          typical > 0
            ? Math.round((priceDifference / typical) * 100)
            : 0;

        const isBestValue =
          currentPrice ===
          Math.min(...searchResults.map((item) => Number(item.price)));

        return (
          <motion.div
            key={`${flight.flight_number}-${index}`}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              delay: index * 0.06,
            }}
            whileHover={{ y: -4 }}
            className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
          >
            {/* BEST VALUE BADGE */}
            {isBestValue && (
              <div className="absolute right-5 top-5 rounded-full bg-black px-3 py-1.5 text-xs font-semibold text-white">
                Lowest Available
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.1fr_1.8fr_0.9fr] lg:items-center">

              {/* AIRLINE */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-xl">
                  ✈️
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {flight.airline}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {flight.flight_number}
                  </p>
                </div>
              </div>

              {/* JOURNEY */}
              <div>
                <div className="flex items-center justify-between gap-4">

                  <div>
                    <p className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatTime(flight.departure_time)}
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {flight.origin}
                    </p>
                  </div>

                  <div className="flex flex-1 items-center gap-3 px-3">
                    <div className="h-px flex-1 bg-gray-200" />

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm transition-transform duration-300 group-hover:scale-110">
                      ✈
                    </div>

                    <div className="h-px flex-1 bg-gray-200" />
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold tracking-tight text-gray-900">
                      {formatTime(flight.arrival_time)}
                    </p>

                    <p className="mt-1 text-sm font-medium text-gray-500">
                      {flight.destination}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <Clock size={13} />
                  <span>Live flight availability</span>
                </div>
              </div>

              {/* PRICE + ACTION */}
              <div className="flex flex-col items-start gap-4 lg:items-end">

                <div className="text-left lg:text-right">
                  <p className="text-xs uppercase tracking-wider text-gray-400">
                    Current fare
                  </p>

                  <p className="mt-1 flex items-center text-3xl font-bold tracking-tight text-gray-900">
                    <IndianRupee size={23} />
                    {formatPrice(flight.price)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedFlight(flight);
                    setBookingStep("details");

                    setTimeout(() => {
                      document
                        .getElementById("intelligence")
                        ?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }, 500);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-700 hover:shadow-lg lg:w-auto"
                >
                  {selectedFlight?.flight_number === flight.flight_number
                    ? "Selected"
                    : "View price insight"}

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>

            
            {/* PRICE INTELLIGENCE */}
            <div
              id={`price-intelligence-${flight.flight_number}`}
              className="mt-6 border-t border-gray-100 pt-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <Sparkles size={17} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Price intelligence
                    </p>

                    <p className="text-xs text-gray-500">
                      Compared with the typical fare for this route
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full bg-gray-100 px-3 py-1.5 font-medium text-gray-700">
                    Typical: {formatPrice(typical)}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1.5 font-semibold ${
                      pricePercentage > 0
                        ? "bg-red-50 text-red-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {pricePercentage > 0
                      ? `↑ ${pricePercentage}% above typical`
                      : `↓ ${Math.abs(pricePercentage)}% below typical`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </section>
)}

      {/* PRICE INTELLIGENCE */}
      {selectedFlight && (
        <section
          id="intelligence"
          className="mx-auto max-w-7xl px-6 py-14"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-xl"
          >
            <div className="border-b border-gray-100 p-7">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#d71920]">
                Price Intelligence
              </p>

              <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <h3 className="text-3xl font-bold">
                    Should you book this flight?
                  </h3>

                  <p className="mt-2 text-gray-500">
                    {selectedFlight.airline} •{" "}
                    {selectedFlight.flight_number} •{" "}
                    {routeKey}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 px-5 py-3">
                  <p className="text-xs text-gray-400">
                    Route Index
                  </p>

                  <p className="text-2xl font-bold">
                    {liveIndex.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-0 md:grid-cols-3">
              <div className="border-b border-gray-100 p-7 md:border-b-0 md:border-r">
                <p className="text-sm text-gray-500">
                  Current Fare
                </p>

                <p className="mt-2 text-3xl font-bold">
                  ₹{formatPrice(currentFare)}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Live fare from flight API
                </p>
              </div>

              <div className="border-b border-gray-100 p-7 md:border-b-0 md:border-r">
                <p className="text-sm text-gray-500">
                  Market Status
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    marketStatus === "Prices are High"
                      ? "text-red-600"
                      : marketStatus === "Prices are Low"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {marketStatus}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  {priceDifference >= 0 ? "+" : ""}
                  {priceDifference.toFixed(1)}% vs typical fare
                </p>
              </div>

              <div className="p-7">
                <p className="text-sm text-gray-500">
                  Recommendation
                </p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    recommendation === "BOOK NOW"
                      ? "text-emerald-600"
                      : recommendation === "WAIT"
                      ? "text-red-600"
                      : "text-amber-600"
                  }`}
                >
                  {recommendation}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Based on current route pricing
                </p>
                <button
                  onClick={() => setBookingStep("details")}
                  className="mt-6 w-full rounded-xl bg-[#d71920] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#b9151b]"
                >
                  Continue to Booking
                </button>

              </div>
            </div>

            {prediction && (
              <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[#d71920]">
                      AI FARE PREDICTION
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      What could this fare become?
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Machine-learning estimate based on current fare and days before departure.
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Predicted Fare</p>
                    <p className="text-2xl font-bold text-[#d71920]">
                      ₹{prediction.predicted_fare.toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">Expected Change</p>
                    <p className="mt-1 text-xl font-bold">
                      {prediction.expected_change > 0 ? "+" : ""}
                      {prediction.expected_change.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4 border border-gray-100">
                    <p className="text-xs text-gray-500">AI Recommendation</p>
                    <p className="mt-1 text-xl font-bold text-[#d71920]">
                      {prediction.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 bg-gray-50 p-7">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={20}
                  className="mt-1 text-cyan-500"
                />

                <p className="max-w-3xl leading-7 text-gray-600">
                  This flight is{" "}
                  <strong>
                    {Math.abs(priceDifference).toFixed(1)}%
                  </strong>{" "}
                  {priceDifference > 0 ? "above" : "below"} the
                  typical fare for {routeKey}. Our price
                  intelligence suggests{" "}
                  <strong>
                    {recommendation === "BOOK NOW"
                      ? "booking now may be a good opportunity."
                      : recommendation === "WAIT"
                      ? "waiting may provide a better fare."
                      : "comparing a few more options before booking."}
                  </strong>
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      )}

      {/* ML FARE PREDICTION */}
      <section className="mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#d71920]">
                AI Fare Prediction
              </p>

              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                What could this fare look like next?
              </h3>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                Our machine-learning model estimates the future fare using the
                current price, route and days before departure.
              </p>
            </div>

            {predictionLoading ? (
              <div className="rounded-xl bg-gray-50 px-6 py-4 text-sm font-medium text-gray-500">
                Predicting fare...
              </div>
            ) : prediction ? (
              <div className="rounded-2xl bg-gray-900 px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Predicted Fare
                </p>

                <p className="mt-1 text-3xl font-bold">
                  ₹{prediction.predicted_fare.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 px-6 py-4 text-sm text-gray-500">
                Select a flight to generate prediction
              </div>
            )}

          </div>

          {prediction && (
            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Current Fare
                </p>

                <p className="mt-2 text-xl font-bold text-gray-900">
                  {formatPrice(currentFare)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Expected Change
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${
                    prediction.expected_change < 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {prediction.expected_change > 0 ? "+" : ""}
                  {prediction.expected_change.toFixed(2)}%
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Model Recommendation
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${
                    prediction.recommendation === "BUY"
                      ? "text-emerald-600"
                      : "text-orange-600"
                  }`}
                >
                  {prediction.recommendation}
                </p>
              </div>

            </div>
          )}

          {prediction && (
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-sm leading-6 text-gray-600">
                Based on the current fare and model prediction, the system expects
                the fare to{" "}
                <strong>
                  {prediction.expected_change < 0
                    ? "decrease"
                    : prediction.expected_change > 0
                    ? "increase"
                    : "remain stable"}
                </strong>{" "}
                by approximately{" "}
                <strong>
                  {Math.abs(prediction.expected_change).toFixed(2)}%
                </strong>
                .
              </p>
            </div>
          )}
        </motion.div>
      </section>



      {/* HISTORICAL TREND */}
      <section
        id="trend"
        className="mx-auto max-w-7xl px-6 py-14"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-xl"
        >
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d71920]">
              Historical Movement
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              Airfare Index Trend
            </h3>

            <p className="mt-2 text-gray-500">
              Recent movement in the India Airfare Price Index
            </p>
          </div>

          <div className="flex h-64 items-end gap-3 md:gap-5">
            {historicalIndex.map((value, index) => {
              const height = Math.max(
                (value / 157.88) * 100,
                10
              );

              return (
                <div
                  key={value}
                  className="flex h-full flex-1 flex-col justify-end"
                >
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{
                      height: `${height}%`,
                      opacity: 1,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                      delay: index * 0.1,
                    }}
                    className="rounded-t-xl bg-gradient-to-t from-cyan-500 to-cyan-300"
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between text-xs text-gray-400">
            {historicalDates.map((dateValue) => (
              <span key={dateValue}>{dateValue}</span>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-gray-100 pt-5">
            <span className="text-sm text-gray-500">
              Current Index
            </span>

            <span className="text-xl font-bold text-[#d71920]">
              {selectedFlight
                ? liveIndex.toFixed(2)
                : "255.49"}
            </span>
          </div>
        </motion.div>
      </section>

      {/* ROUTE INTELLIGENCE */}
      <section className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d71920]">
              Route Intelligence
            </p>

            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
              Which routes are driving airfare prices?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Route-level comparison of typical and current airfare across major
              domestic corridors.
            </p>
          </div>

          <div className="space-y-5">
            {routeInsights.map((item, index) => {
              const barWidth = Math.min((item.index / 450) * 100, 100);

              return (
                <motion.div
                  key={item.route}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="min-w-[140px]">
                      <p className="text-lg font-bold text-gray-900">
                        {item.route}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Typical fare ₹{item.typical.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div className="flex-1 md:px-6">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          Route Index
                        </span>

                        <span className="font-bold text-gray-900">
                          {item.index.toFixed(2)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${barWidth}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.08 }}
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-300"
                        />
                      </div>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{item.current.toLocaleString("en-IN")}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Very High"
                            ? "bg-red-100 text-red-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl bg-gray-900 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
              Key Insight
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-200">
              Routes with a higher index are experiencing stronger price pressure
              compared with their typical airfare baseline.
            </p>
          </div>
        </motion.div>
      </section>

      {/* AIRLINE INTELLIGENCE */}
      <section className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-gray-200 bg-white p-6 md:p-8 shadow-sm"
        >
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.25em] text-[#d71920]">
              Airline Intelligence
            </p>

            <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
              How are airlines pricing the same route?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Current BLR → DEL fares compared with the typical route baseline.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {airlineInsights.map((item, index) => (
              <motion.div
                key={item.airline}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    {item.airline}
                  </h3>

                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                    {item.status}
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Current Fare
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    ₹{item.current.toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <div>
                    <p className="text-xs text-gray-400">
                      Typical
                    </p>

                    <p className="text-sm font-semibold text-gray-700">
                      ₹{item.typical.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-400">
                      Difference
                    </p>

                    <p className="text-sm font-bold text-[#d71920]">
                      +{item.difference}%
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Lowest Current Fare
              </p>

              <p className="mt-1 text-sm font-medium">
                IndiGo offers the lowest observed fare on this route.
              </p>
            </div>

            <span className="text-xl font-bold">
              ₹8,259
            </span>
          </div>
        </motion.div>
      </section>

      {/* MARKET SIGNAL */}
      <section className="mt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl bg-gray-900 p-6 md:p-8 text-white"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Market Signal
              </p>

              <h2 className="mt-2 text-2xl md:text-3xl font-bold">
                Airfare pressure is currently high
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Current route-level prices indicate elevated airfare pressure
                compared with typical fare baselines.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 px-6 py-5 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Current Index
              </p>

              <p className="mt-1 text-4xl font-bold">
                157.88
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Above baseline
              </p>
            </div>

          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Index Movement
              </p>

              <p className="mt-2 text-xl font-bold">
                Rising
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Recent airfare pressure is increasing
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Highest Pressure Route
              </p>

              <p className="mt-2 text-xl font-bold">
                MAA → HYD
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Route Index 435.67
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Market Status
              </p>

              <p className="mt-2 text-xl font-bold">
                High
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Fares are above typical levels
              </p>
            </div>

          </div>
        </motion.div>
      </section>





      {/* BOOKING DETAILS */}
      {bookingStep === "details" && selectedFlight && (
        <section
          id="booking-details"
          className="mx-auto max-w-4xl px-6 py-16"
        >
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

              <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d71920]">
                  Secure Booking
                </p>

                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Passenger Details
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Enter the passenger information to continue with your booking.
                </p>
              </div>

              <div className="mb-8 rounded-2xl bg-gray-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedFlight.airline}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {selectedFlight.flight_number} · {selectedFlight.origin} →{" "}
                      {selectedFlight.destination}
                    </p>
                  </div>

                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(selectedFlight.price)}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    First Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Last Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

              </div>


              {/* SEAT SELECTION */}
              <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d71920]">
                    Seat Selection
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-gray-900">
                    Choose your seat
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Select one seat for your journey.
                  </p>
                </div>

                <div className="mx-auto max-w-sm rounded-3xl bg-white p-6 shadow-sm">
                  <div className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Front of aircraft
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      "1A", "1B", "1C",
                      "2A", "2B", "2C",
                      "3A", "3B", "3C",
                      "4A", "4B", "4C",
                      "5A", "5B", "5C",
                      "6A", "6B", "6C",
                    ].map((seat) => {
                      const occupiedSeats = ["1B", "2C", "4A", "5B"];
                      const isOccupied = occupiedSeats.includes(seat);
                      const isSelected = selectedSeat === seat;

                      return (
                        <button
                          key={seat}
                          type="button"
                          disabled={isOccupied}
                          onClick={() => setSelectedSeat(seat)}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                            isOccupied
                              ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
                              : isSelected
                              ? "border-[#d71920] bg-[#d71920] text-white shadow-md"
                              : "border-gray-200 bg-white text-gray-700 hover:border-[#d71920] hover:text-[#d71920]"
                          }`}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-white border border-gray-300" />
                      Available
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-[#d71920]" />
                      Selected
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded bg-gray-200" />
                      Occupied
                    </div>
                  </div>
                </div>

                {selectedSeat && (
                  <div className="mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    Selected seat:{" "}
                    <span className="font-bold text-[#d71920]">{selectedSeat}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  
                    if (!firstName || !lastName || !email || !phone) {
                      alert("Please complete all passenger details.");
                      return;
                    }
                    if (!selectedSeat) {
                      alert("Please select a seat.");
                      return;
                    }

                    setBookingStep("payment");
                    setPaymentScrollTrigger((value) => value + 1);

                   
                  }}

                className="mt-8 w-full rounded-xl bg-[#d71920] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#b9151b]"
              >
                Continue to Payment
              </button>

            </div>
            
          </section>
        )}

      {/* PAYMENT */}
      {bookingStep === "payment" && selectedFlight && (
        <section id="payment">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d71920]">
                Secure Payment
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Payment Details
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Complete your payment to confirm the booking.
              </p>
            </div>

            <div className="mb-8 rounded-2xl bg-gray-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedFlight.airline}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedFlight.flight_number} · {selectedFlight.origin} →{" "}
                    {selectedFlight.destination}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">TOTAL</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(selectedFlight.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>

                <input
                  type="text"
                  placeholder="Name on card"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Card Number
                </label>

                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={19}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>

                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    CVV
                  </label>

                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={3}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#d71920]"
                  />
                </div>

              </div>

            </div>

            <button
              onClick={() => {
                if (!cardholderName || !cardNumber || !expiryDate || !cvv) {
                  alert("Please complete all payment details.");
                  return;
                }

                const reference =
                  "AIQ" + Math.random().toString(36).substring(2, 8).toUpperCase();

                setBookingReference(reference);

                const newTrip = {
                  bookingReference: reference,
                  airline: selectedFlight?.airline,
                  flightNumber: selectedFlight?.flight_number,
                  origin: selectedFlight?.origin,
                  destination: selectedFlight?.destination,
                  departureTime: selectedFlight?.departure_time,
                  seat: selectedSeat,
                  price: selectedFlight?.price,
                  passenger: `${firstName} ${lastName}`,
                  status: "Confirmed",
                };

                const existingTrips = JSON.parse(
                  localStorage.getItem("airfareiq_trips") || "[]"
                );

                const updatedTrips = [...existingTrips, newTrip];

                localStorage.setItem(
                  "airfareiq_trips",
                  JSON.stringify(updatedTrips)
                );

                setSavedTrips(updatedTrips);
                setBookingStep("confirmed");
              }}
              className="mt-8 w-full rounded-xl bg-[#d71920] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#b9151b]"
            >
              Pay & Confirm Booking
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              Demo payment — no real transaction will be processed.
            </p>

          </div>
        </section>
      )}

      {/* BOOKING CONFIRMATION */}
      {bookingStep === "confirmed" && selectedFlight && (
        <section className="Print-ticket mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <ShieldCheck size={32} className="text-emerald-600" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-600">
              Booking Confirmed
            </p>

            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              Your flight is booked
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
              Your demo booking has been successfully confirmed.
            </p>

            <div className="mt-8 rounded-2xl bg-gray-50 p-6 text-left">

              <div className="flex items-center justify-between border-b border-gray-200 pb-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedFlight.airline}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {selectedFlight.flight_number}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-400">
                    BOOKING REFERENCE
                  </p>

                  <p className="mt-1 text-lg font-bold tracking-wider text-[#d71920]">
                    {bookingReference}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 pt-5 md:grid-cols-4">

                <div>
                  <p className="text-xs text-gray-400">ROUTE</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedFlight.origin} → {selectedFlight.destination}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">DEPARTURE</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatTime(selectedFlight.departure_time)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">SEAT</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedSeat}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">TOTAL PAID</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatPrice(selectedFlight.price)}
                  </p>
                </div>

              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-[#d71920] px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Download E-Ticket
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-400">
              Demo booking — no real ticket has been issued.
            </p>

          </div>
        </section>
      )}

      {/* MY TRIPS */}
{savedTrips.length > 0 ? (
  <div className="space-y-4">
    {savedTrips.map((trip, index) => (
      <div
        key={trip.bookingReference || index}
        className="rounded-2xl border border-gray-200 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Booking Confirmed
            </p>

            <h3 className="mt-1 text-xl font-bold text-gray-900">
              {trip.airline}
            </h3>

            <p className="text-sm text-gray-500">
              {trip.flightNumber}
            </p>
          </div>

          <div className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
            CONFIRMED
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 border-t border-gray-100 pt-5 md:grid-cols-4">

          <div>
            <p className="text-xs text-gray-400">ROUTE</p>
            <p className="mt-1 font-semibold text-gray-900">
              {trip.origin} → {trip.destination}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">DEPARTURE</p>
            <p className="mt-1 font-semibold text-gray-900">
              {trip.departureTime}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">SEAT</p>
            <p className="mt-1 font-semibold text-gray-900">
              {trip.seat || "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-400">TOTAL PAID</p>
            <p className="mt-1 font-semibold text-gray-900">
              ₹{formatPrice(trip.price)}
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-xl bg-gray-50 p-4">
          <p className="text-xs text-gray-400">
            BOOKING REFERENCE
          </p>

          <p className="mt-1 font-bold tracking-wider text-gray-900">
            {trip.bookingReference}
          </p>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="rounded-2xl border border-dashed border-gray-300 p-10 text-center">
    <p className="text-lg font-semibold text-gray-900">
      No trips yet
    </p>

    <p className="mt-2 text-sm text-gray-500">
      Your confirmed bookings will appear here.
    </p>
  </div>
)}

{/* CPI IMPACT */}
<section className="mx-auto max-w-7xl px-6 py-20">
  <div className="mb-8">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d71920]">
      CPI IMPACT
    </p>

    <h2 className="mt-2 text-4xl font-bold text-gray-900">
      How airfare affects inflation
    </h2>

    <p className="mt-3 max-w-2xl text-sm text-gray-500">
      Airfare price movements can influence the Consumer Price Index.
      AirfareIQ converts live fare movements into an easy-to-understand
      inflation signal.
    </p>
  </div>

  <div className="grid gap-5 md:grid-cols-2">
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
        Airfare Price Index
      </p>

      <p className="mt-3 text-4xl font-bold text-gray-900">
        {cpiImpact.airfareInflation.toFixed(2)}
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Current airfare index level
      </p>
    </div>

    <div className="rounded-2xl bg-[#d71920] p-6 text-white shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
        Estimated CPI Contribution
      </p>

      <p className="mt-3 text-4xl font-bold">
        {cpiImpact.estimatedCpiContribution.toFixed(2)}%
      </p>

      <p className="mt-2 text-sm text-white/80">
        Estimated contribution from airfare price movement
      </p>
    </div>
  </div>

  <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-6">
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200">
        📊
      </div>

      <div>
        <h3 className="font-semibold text-gray-900">
          Why this matters
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          The airfare index provides a real-time view of travel price
          pressure and can help policymakers and consumers understand
          changes in transportation costs.
        </p>
      </div>
    </div>
  </div>
</section>
            
      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">AirfareIQ</p>
            <p className="mt-1 text-sm text-gray-500">
              Real-time airfare intelligence for India.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock3 size={14} />
            Data powered by live flight API
          </div>
        </div>
      </footer>
    </main>
  );
}