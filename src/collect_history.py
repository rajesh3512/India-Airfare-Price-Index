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

# Routes
routes = [
    ("BLR", "DEL"),
    ("BLR", "BOM"),
    ("DEL", "BOM"),
    ("DEL", "HYD"),
    ("MAA", "HYD")
]

travel_date = "2026-09-20"
booking_date = str(date.today())

output_file = "data/live_history.csv"

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

    flights_found = []

    flights_found.extend(results.get("best_flights", []))
    flights_found.extend(results.get("other_flights", []))

    print("Flights found:", len(flights_found))

    for option in flights_found:

        segments = option.get("flights", [])

        if not segments:
            continue

        first = segments[0]
        last = segments[-1]

        airline = first.get("airline", "Unknown")
        flight_number = first.get("flight_number", "Unknown")

        departure_time = first.get(
            "departure_airport", {}
        ).get("time", "")

        arrival_time = last.get(
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
            "booking_date": booking_date,
            "departure_time": departure_time,
            "arrival_time": arrival_time,
            "total_price": price,
            "currency": "INR"
        })


# Append to history file
file_exists = os.path.exists(output_file)

with open(
    output_file,
    "a",
    newline="",
    encoding="utf-8"
) as file:

    writer = csv.DictWriter(
        file,
        fieldnames=fieldnames
    )

    if not file_exists:
        writer.writeheader()

    writer.writerows(all_rows)


print()
print("===================================")
print("LIVE HISTORY COLLECTION COMPLETED")
print("===================================")
print("Booking date:", booking_date)
print("Total records added:", len(all_rows))
print("File:", output_file)