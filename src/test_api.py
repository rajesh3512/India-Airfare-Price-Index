import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("SERPAPI_KEY")

if api_key:
    print("API key loaded successfully!")
else:
    print("API key NOT found!")