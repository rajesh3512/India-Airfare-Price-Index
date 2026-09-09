import os
import serpapi
from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("SERPAPI_KEY")

client = serpapi.Client(api_key=api_key)

params = {
    "engine": "google_flights",
    "departure_id": "BLR",
    "arrival_id": "DEL",
    "type": "2",
    "outbound_date": "2026-09-20",
    "travel_class": "1",
    "currency": "INR",
    "hl": "en",
    "gl": "in"
}

results = client.search(params)

print("API request completed!")

if "error" in results:
    print("API Error:")
    print(results["error"])
else:
    print("Flight search successful!")

    best_flights = results.get("best_flights", [])

    print("Number of best-flight options:", len(best_flights))

    for flight in best_flights[:5]:
        print(flight)