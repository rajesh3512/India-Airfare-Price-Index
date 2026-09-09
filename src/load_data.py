import pandas as pd

data = pd.read_csv("data/airfare_data.csv")

data["travel_date"] = pd.to_datetime(data["travel_date"])
data["booking_date"] = pd.to_datetime(data["booking_date"])

data["days_until_departure"] = (
    data["travel_date"] - data["booking_date"]
).dt.days

print(data)
print(data.shape)
print(data.columns)
print(data.info())
print(data.describe())

print(data.isnull().sum())
print("Duplicate rows:", data.duplicated().sum())
print(data[["travel_date", "booking_date"]].dtypes)
print(data[["travel_date", "booking_date", "days_until_departure"]])
route_average = (
    data.groupby(["origin", "destination"])["total_price"]
    .mean()
    .reset_index()
)

print(route_average)