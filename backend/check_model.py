from gpt4all import GPT4All
import sys

# Trying the Q4_K_M variant which is more common in GGUF
model_name = "tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf"

print(f"Attempting to load {model_name}...")
try:
    # device='cpu' to avoid the DLL issues we saw earlier
    model = GPT4All(model_name, device='cpu')
    print("Model loaded successfully!")
except Exception as e:
    print(f"FAILED with error: {e}")
    sys.exit(1)
