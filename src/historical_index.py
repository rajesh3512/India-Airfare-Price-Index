import pandas as pd

# Load historical prototype data
data = pd.read_csv("data/index_data.csv")

# Convert price to numeric
data["total_price"] = pd.to_numeric(
    data["total_price"],
    errors="coerce"
)

# Remove missing prices
data = data.dropna(subset=["total_price"])

# Base airfare
base_price = 3949.066667

# Calculate average airfare for each booking date
daily_average = (
    data.groupby("booking_date")["total_price"]
    .mean()
    .reset_index()
)

# Calculate index
daily_average["airfare_price_index"] = (
    daily_average["total_price"] / base_price
) * 100

# Rename column
daily_average = daily_average.rename(
    columns={"total_price": "average_airfare"}
)

# Round values
daily_average["average_airfare"] = daily_average[
    "average_airfare"
].round(2)

daily_average["airfare_price_index"] = daily_average[
    "airfare_price_index"
].round(2)

# Save historical index
output_file = "data/historical_index.csv"

daily_average.to_csv(
    output_file,
    index=False
)

print("Historical index created successfully!")
print()
print(daily_average)
print()
print("File:", output_file)