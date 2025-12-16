import requests
import sys

def test_backend():
    url = "http://localhost:8000"
    print(f"Testing backend at {url}...")
    
    try:
        # 1. Test Root/Health (mock check)
        # Note: We didn't add a root endpoint, so we expect 404, but that means server is running.
        response = requests.get(url + "/")
        print(f"Server reachable? Status: {response.status_code}")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to backend. Is it running?")
        print("Run: uvicorn main:app --reload in the backend directory.")
        return

    print("\nTo fully test, you need to:")
    print("1. Start the backend: 'cd backend && uvicorn main:app --reload'")
    print("2. Start the frontend: 'npm start'")
    print("3. Go to http://localhost:3000/mock-interview")
    print("4. Upload a PDF resume.")

if __name__ == "__main__":
    test_backend()
