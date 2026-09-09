import pandas as pd
from sklearn.ensemble import RandomForestRegressor


# Load prototype training data
data = pd.read_csv("data/airfare_training_data.csv")


# Convert numeric columns
numeric_columns = [
    "days_before_departure",
    "typical_fare",
    "current_fare",
    "future_fare"
]

for column in numeric_columns:
    data[column] = pd.to_numeric(
        data[column],
        errors="coerce"
    )


# Features used by the ML model
X = data[
    [
        "days_before_departure",
        "typical_fare",
        "current_fare"
    ]
]

# Target: future airfare
y = data["future_fare"]


# Train Random Forest model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

model.fit(X, y)


def predict_price(
    current_fare,
    days_before_departure,
    typical_fare
):
    """
    Predict the expected future airfare.
    """

    input_data = pd.DataFrame({
        "days_before_departure": [days_before_departure],
        "typical_fare": [typical_fare],
        "current_fare": [current_fare]
    })

    prediction = model.predict(input_data)[0]

    return round(float(prediction), 2)


# Test prediction
if __name__ == "__main__":

    current_fare = 8259
    days_before_departure = 16
    typical_fare = 5231

    predicted_price = predict_price(
        current_fare,
        days_before_departure,
        typical_fare
    )

    change = (
        (predicted_price - current_fare)
        / current_fare
    ) * 100

    print("PRICE PREDICTION")
    print("----------------")
    print(f"Current fare: ₹{current_fare}")
    print(f"Typical fare: ₹{typical_fare}")
    print(f"Days before departure: {days_before_departure}")
    print(f"Predicted future fare: ₹{predicted_price}")
    print(f"Expected change: {change:+.2f}%")