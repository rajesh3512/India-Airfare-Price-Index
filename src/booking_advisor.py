import pandas as pd

# Load historical index data
data = pd.read_csv("data/historical_index.csv")

# Convert booking date
data["booking_date"] = pd.to_datetime(data["booking_date"])

# Fixed travel date used in our prototype
travel_date = pd.Timestamp("2026-09-20")

# Calculate days remaining before departure
data["days_until_departure"] = (
    travel_date - data["booking_date"]
).dt.days

# Sort by booking date
data = data.sort_values("booking_date")

print("===================================")
print("      BOOKING TIME ANALYSIS")
print("===================================")
print()

print(
    data[
        [
            "booking_date",
            "days_until_departure",
            "average_airfare",
            "airfare_price_index"
        ]
    ]
)

print()

# Find the cheapest historical booking point
cheapest = data.loc[data["average_airfare"].idxmin()]

print("Best historical booking point:")
print("Booking date:", cheapest["booking_date"].date())
print("Days before departure:", cheapest["days_until_departure"])
print("Average airfare: ₹", cheapest["average_airfare"])
print("Airfare index:", cheapest["airfare_price_index"])

print()

# Current/latest observation
latest = data.iloc[-1]

print("Latest observation:")
print("Booking date:", latest["booking_date"].date())
print("Days before departure:", latest["days_until_departure"])
print("Average airfare: ₹", latest["average_airfare"])
print("Airfare index:", latest["airfare_price_index"])

print()

# Simple recommendation
if latest["average_airfare"] > cheapest["average_airfare"]:
    print("Recommendation: BOOK EARLIER")
    print(
        "Historical prices indicate that airfare has increased "
        "as the departure date approaches."
    )
else:
    print("Recommendation: WAIT")
    print(
        "Historical prices do not currently indicate "
        "a significant increase."
    )