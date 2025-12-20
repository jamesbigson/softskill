from gpt4all import GPT4All
import sys
import os

model_name = "orca-mini-3b-gguf2-q4_0.gguf"

print(f"Checking for {model_name} in current directory...")
if os.path.exists(model_name):
    print(f"File {model_name} FOUND.")
else:
    print(f"File {model_name} NOT FOUND.")

print(f"Attempting to load {model_name} via GPT4All...")
try:
    # device='cpu'
    model = GPT4All(model_name, device='cpu', allow_download=False)
    print("Model loaded successfully!")
except Exception as e:
    print(f"FAILED with error: {e}")
    sys.exit(1)
