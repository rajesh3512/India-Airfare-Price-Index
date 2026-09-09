import os
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import json
import pandas as pd


sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from ml.price_predictor import predict_price

import serpapi
from dotenv import load_dotenv

load_dotenv(override=True)

API_KEY = os.getenv("SERPAPI_KEY")

if not API_KEY:
    raise RuntimeError("SERPAPI_KEY not found in .env")


def search_flights(origin, destination, travel_date, travel_class):
    client = serpapi.Client(api_key=API_KEY)

    params = {
        "engine": "google_flights",
        "departure_id": origin,
        "arrival_id": destination,
        "type": "2",
        "outbound_date": travel_date,
        "travel_class": travel_class,
        "currency": "INR",
        "hl": "en",
        "gl": "in",
    }

    results = client.search(params)

    if "error" in results:
        raise RuntimeError(results["error"])

    all_flights = []

    for group in ["best_flights", "other_flights"]:
        for option in results.get(group, []):
            segments = option.get("flights", [])

            if not segments:
                continue

            first = segments[0]
            last = segments[-1]

            departure = first.get("departure_airport", {})
            arrival = last.get("arrival_airport", {})

            flight = {
                "airline": first.get("airline", "Unknown"),
                "flight_number": first.get("flight_number", "N/A"),
                "origin": departure.get("id", origin),
                "destination": arrival.get("id", destination),
                "departure_time": departure.get("time", ""),
                "arrival_time": arrival.get("time", ""),
                "price": option.get("price", 0),
                "currency": "INR",
            }

            all_flights.append(flight)

    return {
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "travel_class": travel_class,
        "flights": all_flights,
    }


class FlightAPIHandler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        response = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        self.wfile.write(response)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):

        parsed_url = urlparse(self.path)
        print("REQUESTED PATH:",parsed_url.path)

            # AIRFARE INDEX ENDPOINT
        if parsed_url.path == "/index":
            query = parse_qs(parsed_url.query)

            origin = query.get("origin", [""])[0].upper()
            destination = query.get("destination", [""])[0].upper()

            if not origin or not destination:
                self.send_json(
                    {"error": "origin and destination are required"},
                    400
                )
                return

            try:
                base_data = pd.read_csv("data/airfare_data.csv")
                live_data = pd.read_csv("data/live_flights.csv")

                base_data["total_price"] = pd.to_numeric(
                    base_data["total_price"],
                    errors="coerce"
                )

                live_data["total_price"] = pd.to_numeric(
                    live_data["total_price"],
                    errors="coerce"
                )

                route_base = base_data[
                    (base_data["origin"] == origin) &
                    (base_data["destination"] == destination)
                ]

                route_live = live_data[
                    (live_data["origin"] == origin) &
                    (live_data["destination"] == destination)
                ]

                if route_base.empty or route_live.empty:
                    self.send_json(
                        {"error": "No data available for this route"},
                        404
                    )
                    return

                base_fare = route_base["total_price"].mean()
                live_fare = route_live["total_price"].mean()

                route_index = (live_fare / base_fare) * 100

                self.send_json({
                    "origin": origin,
                    "destination": destination,
                    "base_fare": round(base_fare, 2),
                    "live_fare": round(live_fare, 2),
                    "route_index": round(route_index, 2)
                })

                return

            except Exception as error:
                self.send_json(
                    {"error": str(error)},
                    500
                )
                return

        
        # PRICE PREDICTION ENDPOINT
        if parsed_url.path == "/predict":
            query = parse_qs(parsed_url.query)

            origin = query.get("origin", [""])[0].upper()
            destination = query.get("destination", [""])[0].upper()
            current_fare = query.get("current_fare", [""])[0]
            days = query.get("days", [""])[0]

            if not origin or not destination or not current_fare or not days:
                self.send_json(
                    {
                        "error": "origin, destination, current_fare and days are required"
                    },
                    400
                )
                return

            try:
                current_fare = float(current_fare)
                days = int(days)

                base_data = pd.read_csv("data/airfare_data.csv")

                base_data["total_price"] = pd.to_numeric(
                    base_data["total_price"],
                    errors="coerce"
                )

                route_data = base_data[
                    (base_data["origin"] == origin) &
                    (base_data["destination"] == destination)
                ]

                if route_data.empty:
                    self.send_json(
                        {"error": "No typical fare available for this route"},
                        404
                    )
                    return

                typical_fare = route_data["total_price"].mean()

                predicted_fare = predict_price(
                    current_fare,
                    days,
                    typical_fare
                )

                expected_change = (
                    (predicted_fare - current_fare)
                    / current_fare
                ) * 100

                recommendation = (
                    "BOOK NOW"
                    if predicted_fare > current_fare
                    else "WAIT"
                )

                self.send_json({
                    "origin": origin,
                    "destination": destination,
                    "current_fare": round(current_fare, 2),
                    "typical_fare": round(typical_fare, 2),
                    "predicted_fare": round(predicted_fare, 2),
                    "expected_change": round(expected_change, 2),
                    "recommendation": recommendation
                })

                return

            except Exception as error:
                self.send_json(
                    {"error": str(error)},
                    500
                )
                return

        if parsed_url.path != "/search":
            self.send_json({"error": "Endpoint not found"}, 404)
            return

        
        
            

        query = parse_qs(parsed_url.query)

        origin = query.get("origin", [""])[0].upper()
        destination = query.get("destination", [""])[0].upper()
        travel_date = query.get("travel_date", [""])[0]
        travel_class = query.get("travel_class", ["1"])[0]

        if not origin or not destination or not travel_date:
            self.send_json(
                {
                    "error": "origin, destination and travel_date are required"
                },
                400,
            )
            return

        try:
            print(
                f"Searching {origin} -> {destination} "
                f"for {travel_date}..."
            )

            data = search_flights(
                origin,
                destination,
                travel_date,
                travel_class,
            )

            print(f"Flights returned: {len(data['flights'])}")

            self.send_json(data)

        except Exception as error:
            print("API ERROR:", error)

            self.send_json(
                {
                    "error": str(error)
                },
                500,
            )


if __name__ == "__main__":

    port = int(os.environ.get("PORT", 5000))

    server = HTTPServer(
        ("0.0.0.0", port),
        FlightAPIHandler
    )

    print("=" * 50)
    print("LIVE FLIGHT API SERVER")
    print("=" * 50)
    print("Server running on port:")
    print(port)
    print()
    print("Search endpoint:")
    print("/search")
    print("=" * 50)

    server.serve_forever()