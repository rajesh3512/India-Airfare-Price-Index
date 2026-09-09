import pandas as pd
from datetime import date
import os

# Load live flight data
data = pd.read_csv("data/live_flights.csv")

# Convert price to numeric
data["total_price"] = pd.to_numeric(
    data["total_price"],
    errors="coerce"
)

# Remove missing prices
data = data.dropna(subset=["total_price"])

# Calculate current average airfare
current_average = data["total_price"].mean()

# Base price
base_price = 3949.066667

# Calculate index
airfare_index = (current_average / base_price) * 100

# Create new index record
new_record = pd.DataFrame([{
    "date": str(date.today()),
    "average_airfare": round(current_average, 2),
    "base_airfare": round(base_price, 2),
    "airfare_price_index": round(airfare_index, 2)
}])

# File location
output_file = "data/index_history.csv"

# Append if file already exists
if os.path.exists(output_file):
    new_record.to_csv(
        output_file,
        mode="a",
        header=False,
        index=False
    )
else:
    new_record.to_csv(
        output_file,
        index=False
    )

print("Index saved successfully!")
print(new_record)
print("File:", output_file)