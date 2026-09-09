import pandas as pd

# Load live flight data
data = pd.read_csv("data/live_flights.csv")

# Make sure price is numeric
data["total_price"] = pd.to_numeric(
    data["total_price"],
    errors="coerce"
)

# Remove rows where price is missing
data = data.dropna(subset=["total_price"])

# Calculate average price for each route
route_average = (
    data.groupby(["origin", "destination"])["total_price"]
    .mean()
    .reset_index()
)

print("Route-wise average airfare:")
print(route_average)

# Calculate overall average airfare
overall_average = data["total_price"].mean()

print()
print("Current average airfare:", round(overall_average, 2))

# Base price used for prototype index
base_price = 3949.066667

# Calculate index
airfare_index = (overall_average / base_price) * 100

print("Base airfare:", round(base_price, 2))
print("Current Airfare Price Index:", round(airfare_index, 2))