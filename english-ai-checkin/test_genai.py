import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

print(f"API Key present: {bool(GEMINI_API_KEY)}")
if GEMINI_API_KEY:
    # Print the first few characters to debug format (no full key leakage)
    print(f"Key starts with: {repr(GEMINI_API_KEY[:5])}, ends with: {repr(GEMINI_API_KEY[-2:])}")
    print(f"Length: {len(GEMINI_API_KEY)}")

try:
    from google import genai
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("Client initialized successfully.")
    
    # Try the exact same call
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hi",
    )
    print("Call successful.")
except Exception as e:
    import traceback
    traceback.print_exc()
