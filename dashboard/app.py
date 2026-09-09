import streamlit as st
import pandas as pd
import os
import serpapi

from dotenv import load_dotenv

load_dotenv(override=True)

api_key = os.getenv("SERPAPI_KEY")

client = serpapi.Client(api_key=api_key)

# Page configuration
st.set_page_config(
    page_title="India Airfare Price Index",
    page_icon="✈️",
    layout="wide"
)

# Title
st.title("✈️ India Airfare Price Index")
st.caption("Real-time airfare monitoring and price intelligence")

# Flight Search
# Flight Search
st.divider()

st.subheader("🔎 Search Live Flights")

col1, col2, col3 = st.columns(3)

with col1:
    origin = st.selectbox(
        "From",
        ["BLR", "DEL", "BOM", "HYD", "MAA"]
    )

with col2:
    destination = st.selectbox(
        "To",
        ["DEL", "BLR", "BOM", "HYD", "MAA"]
    )

with col3:
    travel_date = st.date_input(
        "Travel Date",
        value=pd.to_datetime("2026-09-20")
    )

cabin_class = st.selectbox(
    "Cabin Class",
    ["Economy", "Premium Economy", "Business", "First"]
)

search_button = st.button(
    "🔎 Search Live Flights",
    type="primary"
)

# ==============================
# Booking Advisor
# ==============================

st.divider()

st.subheader("🤖 Booking Advisor")

try:
    historical_data = pd.read_csv("data/historical_index.csv")

    historical_data["booking_date"] = pd.to_datetime(
        historical_data["booking_date"]
    )

    cheapest = historical_data.loc[
        historical_data["average_airfare"].idxmin()
    ]

    latest = historical_data.iloc[-1]

    savings = (
        latest["average_airfare"] -
        cheapest["average_airfare"]
    )

    col1, col2, col3 = st.columns(3)

    with col1:
        st.metric(
            "Historical Low",
            f"₹{cheapest['average_airfare']:,.0f}"
        )

    with col2:
        st.metric(
            "Latest Observed",
            f"₹{latest['average_airfare']:,.0f}"
        )

    with col3:
        st.metric(
            "Potential Difference",
            f"₹{savings:,.0f}"
        )

    if latest["average_airfare"] > cheapest["average_airfare"]:
        st.warning(
            "📈 Historical prices have increased as the "
            "departure date approaches."
        )

        st.info(
            f"💡 Recommendation: BOOK EARLIER. "
            f"The historical low was ₹{cheapest['average_airfare']:,.0f} "
            f"when booking around "
            f"{(pd.Timestamp('2026-09-20') - cheapest['booking_date']).days} "
            f"days before departure."
        )

    else:
        st.success(
            "📉 Current historical pattern does not show "
            "a significant price increase."
        )

except Exception as e:
    st.error(f"Booking Advisor could not be loaded: {e}")

if search_button:

    if origin == destination:
        st.error("Origin and destination cannot be the same.")

    elif not api_key:
        st.error("SerpApi API key was not found.")

    else:

        cabin_mapping = {
            "Economy": "1",
            "Premium Economy": "2",
            "Business": "3",
            "First": "4"
        }

        params = {
            "engine": "google_flights",
            "departure_id": origin,
            "arrival_id": destination,
            "type": "2",
            "outbound_date": str(travel_date),
            "travel_class": cabin_mapping[cabin_class],
            "currency": "INR",
            "hl": "en",
            "gl": "in"
        }

        with st.spinner("Searching live flights..."):

            try:
                results = client.search(params)

                if "error" in results:
                    st.error(
                        "Flight search failed: "
                        + str(results["error"])
                    )

                else:

                    flights_found = []

                    flights_found.extend(
                        results.get("best_flights", [])
                    )

                    flights_found.extend(
                        results.get("other_flights", [])
                    )

                    st.success(
                        f"Found {len(flights_found)} flight options."
                    )

                    if not flights_found:
                        st.warning(
                            "No flights found for this search."
                        )

                    for option in flights_found[:10]:

                        segments = option.get(
                            "flights", []
                        )

                        if not segments:
                            continue

                        first = segments[0]
                        last = segments[-1]

                        airline = first.get(
                            "airline",
                            "Unknown"
                        )

                        flight_number = first.get(
                            "flight_number",
                            "Unknown"
                        )

                        departure_time = first.get(
                            "departure_airport",
                            {}
                        ).get("time", "")

                        arrival_time = last.get(
                            "arrival_airport",
                            {}
                        ).get("time", "")

                        price = option.get("price")
                        if price is None:
                            price = option.get("Total Price")

                        if price is None:
                            price = "Price Unavailable"
                

                        st.markdown("---")

                        result_col1, result_col2 = st.columns(
                            [3, 1]
                        )

                        with result_col1:

                            st.write(
                                f"### ✈️ {airline} "
                                f"{flight_number}"
                            )

                            st.write(
                                f"**{origin} → {destination}**"
                            )

                            st.write(
                                f"Departure: {departure_time}"
                            )

                            st.write(
                                f"Arrival: {arrival_time}"
                            )

                        with result_col2:

                            if isinstance(price, (int, float)):
                                fare_display = f"₹{price:,}"
                            else:
                                fare_display = str(price)

                            st.metric(
                                "Fare",
                                fare_display
                            )

            except Exception as e:

                st.error(
                    f"An unexpected error occurred: {e}"
                )

# Load data
index_data = pd.read_csv("data/combined_index.csv")
live_flights = pd.read_csv("data/live_flights.csv")

# Latest index
latest = index_data.iloc[-1]

current_index = latest["airfare_price_index"]
current_average = latest["average_airfare"]

# Top metrics
col1, col2, col3 = st.columns(3)

with col1:
    st.metric(
        "Current Airfare Index",
        f"{current_index:.2f}"
    )

with col2:
    st.metric(
        "Average Airfare",
        f"₹{current_average:,.0f}"
    )

with col3:
    st.metric(
        "Live Flights",
        len(live_flights)
    )

st.divider()

# Index trend
st.subheader("📈 Airfare Price Index Trend")

chart_data = pd.read_csv("data/combined_index.csv")

chart_data["date"] = pd.to_datetime(chart_data["date"])

chart_data = chart_data.set_index("date")

st.line_chart(
    chart_data["airfare_price_index"]
)


st.divider()

# Live flight data
st.subheader("✈️ Live Flight Observations")

st.dataframe(
    live_flights,
    use_container_width=True,
    hide_index=True
)

# Route-wise average airfare
st.divider()

st.subheader("🗺️ Route-wise Airfare")

route_average = (
    live_flights.groupby(
        ["origin", "destination"]
    )["total_price"]
    .mean()
    .reset_index()
)

route_average["route"] = (
    route_average["origin"]
    + " → "
    + route_average["destination"]
)

route_average = route_average[
    ["route", "total_price"]
]

route_average = route_average.rename(
    columns={"total_price": "Average Fare"}
)

route_average["Average Fare"] = (
    route_average["Average Fare"].round(2)
)

st.dataframe(
    route_average,
    use_container_width=True,
    hide_index=True
)