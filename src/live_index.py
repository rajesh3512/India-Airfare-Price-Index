import pandas as pd

# Load original base-price data
base_data = pd.read_csv("data/airfare_data.csv")

# Load today's live observations
live_data = pd.read_csv("data/live_history.csv")

# Convert prices to numbers
base_data["total_price"] = pd.to_numeric(
    base_data["total_price"],
    errors="coerce"
)

live_data["total_price"] = pd.to_numeric(
    live_data["total_price"],
    errors="coerce"
)

# Remove rows without prices
base_data = base_data.dropna(subset=["total_price"])
live_data = live_data.dropna(subset=["total_price"])

# Create route column
base_data["route"] = (
    base_data["origin"] + " → " + base_data["destination"]
)

live_data["route"] = (
    live_data["origin"] + " → " + live_data["destination"]
)

# Calculate base average fare for each route
base_route = (
    base_data
    .groupby("route")["total_price"]
    .mean()
    .reset_index()
    .rename(columns={"total_price": "base_fare"})
)

# Calculate today's live average fare for each route
live_route = (
    live_data
    .groupby("route")["total_price"]
    .mean()
    .reset_index()
    .rename(columns={"total_price": "live_fare"})
)

# Combine base and live prices
result = pd.merge(
    base_route,
    live_route,
    on="route",
    how="inner"
)

# Calculate route-level price index
result["route_index"] = (
    result["live_fare"] / result["base_fare"]
) * 100

# Round values
result["base_fare"] = result["base_fare"].round(2)
result["live_fare"] = result["live_fare"].round(2)
result["route_index"] = result["route_index"].round(2)

# Overall airfare index
overall_index = result["route_index"].mean()

# Overall average live airfare
overall_live_fare = live_data["total_price"].mean()

print()
print("===================================")
print("LIVE AIRFARE PRICE INDEX")
print("===================================")

print(result)

print()
print("Overall Live Airfare:", round(overall_live_fare, 2))
print("Overall Airfare Index:", round(overall_index, 2))

# Save result
output_file = "data/live_index.csv"

result.to_csv(
    output_file,
    index=False
)

print()
print("File created:", output_file)