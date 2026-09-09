import pandas as pd
import matplotlib.pyplot as plt

# Load combined index data
data = pd.read_csv("data/combined_index.csv")

# Convert date
data["date"] = pd.to_datetime(data["date"])

# Create chart
plt.figure(figsize=(10, 5))

plt.plot(
    data["date"],
    data["airfare_price_index"],
    marker="o"
)

# Add labels
for i in range(len(data)):
    plt.annotate(
        str(data["airfare_price_index"].iloc[i]),
        (
            data["date"].iloc[i],
            data["airfare_price_index"].iloc[i]
        ),
        xytext=(0, 8),
        textcoords="offset points",
        ha="center"
    )

plt.xlabel("Date")
plt.ylabel("Airfare Price Index")
plt.title("India Airfare Price Index")

plt.grid(True)
plt.tight_layout()

# Save chart
plt.savefig("data/final_airfare_index.png")

plt.show()

print("Final index chart created successfully!")
print("File: data/final_airfare_index.png")