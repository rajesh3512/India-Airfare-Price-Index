import os
import csv
from datetime import date
from dotenv import load_dotenv
import serpapi

# Load API key
load_dotenv(override=True)

api_key = os.getenv("SERPAPI_KEY")

if not api_key:
    print("ERROR: SERPAPI_KEY not found!")
    exit()

client = serpapi.Client(api_key=api_key)

# Routes we want to collect
routes = [
    ("BLR", "DEL"),
    ("BLR", "BOM"),
    ("DEL", "BOM"),
    ("DEL", "HYD"),
    ("MAA", "HYD")
]

travel_date = "2026-09-20"

all_rows = []

for departure, arrival in routes:

    print()
    print(f"Searching {departure} -> {arrival}...")

    params = {
        "engine": "google_flights",
        "departure_id": departure,
        "arrival_id": arrival,
        "type": "2",
        "outbound_date": travel_date,
        "travel_class": "1",
        "currency": "INR",
        "hl": "en",
        "gl": "in"
    }

    results = client.search(params)

    if "error" in results:
        print("API Error:", results["error"])
        continue

    best_flights = results.get("best_flights", [])

    print("Flights found:", len(best_flights))

    for option in best_flights:

        flights = option.get("flights", [])

        if not flights:
            continue

        first_flight = flights[0]

        airline = first_flight.get("airline", "Unknown")
        flight_number = first_flight.get("flight_number", "Unknown")

        departure_time = first_flight.get(
            "departure_airport", {}
        ).get("time", "")

        arrival_time = first_flight.get(
            "arrival_airport", {}
        ).get("time", "")

        price = option.get("price", "")

        all_rows.append({
            "source": "Google Flights",
            "airline": airline,
            "flight_number": flight_number,
            "origin": departure,
            "destination": arrival,
            "travel_date": travel_date,
            "booking_date": str(date.today()),
            "departure_time": departure_time,
            "arrival_time": arrival_time,
            "total_price": price,
            "currency": "INR"
        })

# Save everything
output_file = "data/live_flights.csv"

fieldnames = [
    "source",
    "airline",
    "flight_number",
    "origin",
    "destination",
    "travel_date",
    "booking_date",
    "departure_time",
    "arrival_time",
    "total_price",
    "currency"
]

with open(output_file, "w", newline="", encoding="utf-8") as file:

    writer = csv.DictWriter(file, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(all_rows)

print()
print("===================================")
print("LIVE FLIGHT COLLECTION COMPLETED")
print("===================================")
print("Total records saved:", len(all_rows))
print("File:", output_file)