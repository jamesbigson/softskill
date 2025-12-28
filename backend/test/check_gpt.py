from gpt4all import GPT4All
import sys

print("Attempting to load GPT4All model...")
try:
    # Explicitly asking for CPU to match our app configuration
    model = GPT4All("orca-mini-3b-gguf2-q4_0.gguf", device='cpu')
    print("Model loaded successfully!")
    
    print("Attempting a simple generation...")
    output = model.generate("The capital of France is ", max_tokens=5)
    print(f"Generation successful: '{output}'")

except Exception as e:
    print(f"FAILED with error: {e}")
    sys.exit(1)
