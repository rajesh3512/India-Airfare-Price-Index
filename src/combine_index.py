import pandas as pd

# ---------------------------------------
# 1. Load historical prototype index
# ---------------------------------------

historical = pd.read_csv("data/historical_index.csv")

historical["source"] = "Historical Prototype"

# Load historical index
historical = pd.read_csv("data/historical_index.csv")

# Rename booking_date to date
historical = historical.rename(
    columns={"booking_date": "date"}
)

# Add source label
historical["source"] = "Prototype"

# Keep only required columns
historical = historical[
    ["date", "source", "average_airfare", "airfare_price_index"]
]

# ---------------------------------------
# 2. Load today's live route index
# ---------------------------------------

live = pd.read_csv("data/live_index.csv")

# Calculate today's overall live values
live_average_fare = live["live_fare"].mean()
live_overall_index = live["route_index"].mean()

# Use today's date
live_date = pd.Timestamp.today().strftime("%Y-%m-%d")

live_row = pd.DataFrame([
    {
        "date": live_date,
        "average_airfare": round(live_average_fare, 2),
        "airfare_price_index": round(live_overall_index, 2),
        "source": "Live Google Flights"
    }
])


# ---------------------------------------
# 3. Combine historical + live
# ---------------------------------------

combined = pd.concat(
    [historical, live_row],
    ignore_index=True
)

# Convert date
combined["date"] = pd.to_datetime(combined["date"])

# Sort by date
combined = combined.sort_values("date")

# Reset index
combined = combined.reset_index(drop=True)


# ---------------------------------------
# 4. Save combined index
# ---------------------------------------

output_file = "data/combined_index.csv"

combined.to_csv(
    output_file,
    index=False
)


# ---------------------------------------
# 5. Display result
# ---------------------------------------

print()
print("===================================")
print("COMBINED AIRFARE INDEX")
print("===================================")

print(combined)

print()
print("File created:", output_file)
print("Total observations:", len(combined))