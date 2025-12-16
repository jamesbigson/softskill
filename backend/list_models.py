import requests
import json

try:
    url = "https://raw.githubusercontent.com/nomic-ai/gpt4all/main/gpt4all-chat/metadata/models2.json"
    response = requests.get(url)
    models = response.json()
    
    print("Available Small Models (< 4B params):")
    for model in models:
        # Check params safety
        params = model.get('parameters', 'Unknown')
        is_small = False
        if "3 billion" in params or "1 billion" in params or "1.1 billion" in params:
            is_small = True
            
        if is_small:
            print(f"Name: {model.get('name')}")
            print(f"Filename: {model.get('filename')}")
            print(f"Params: {params}")
            print("-" * 20)
            
except Exception as e:
    print(f"Error: {e}")
