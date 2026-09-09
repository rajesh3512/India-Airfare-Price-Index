import os

import serpapi
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(override=True)

app = FastAPI(title="India Airfare Price Intelligence API")

# Allow the Next.js frontend to communicate with Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "India Airfare Price Intelligence API is running"
    }


@app.get("/search")
def search_flights(
    origin: str,
    destination: str,
    travel_date: str,
    travel_class: str = "1",
):
    api_key = os.getenv("SERPAPI_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="SERPAPI_KEY not found"
        )

    origin = origin.upper().strip()
    destination = destination.upper().strip()

    if len(origin) != 3 or len(destination) != 3:
        raise HTTPException(
            status_code=400,
            detail="Origin and destination must be 3-letter airport codes"
        )

    client = serpapi.Client(api_key=api_key)

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
        raise HTTPException(
            status_code=502,
            detail=results["error"]
        )

    flights = []

    all_options = (
        results.get("best_flights", [])
        + results.get("other_flights", [])
    )

    for option in all_options[:10]:
        segments = option.get("flights", [])

        if not segments:
            continue

        first = segments[0]
        last = segments[-1]

        departure = first.get("departure_airport", {}).get("time", "")
        arrival = last.get("arrival_airport", {}).get("time", "")

        flights.append(
            {
                "airline": first.get("airline", "Unknown"),
                "flight_number": first.get(
                    "flight_number", "Unknown"
                ),
                "departure": first.get("departure_airport", {}).get(
                    "time", ""
                ),
                "arrival": last.get("arrival_airport", {}).get(
                    "time", ""
                ),
                "duration": option.get("total_duration", 0),
                "price": option.get("price", 0),
                "currency": "INR",
                "departure_time":departure,
                "arrival_time":arrival,
            }
        )

    return {
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "flight_count": len(flights),
        "flights": flights,
    }