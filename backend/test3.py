from llama_cpp import Llama

# 1. Initialize the model
# Replace 'path/to/gemma-2-2b-it-Q4_K_M.gguf' with your actual file path
llm = Llama(
    model_path="gemma-2b-it.Q4_K_M.gguf",
    n_ctx=2048,           # Context window (number of tokens)
    n_threads=8,          # Number of CPU threads to use
    n_gpu_layers=-1       # Use -1 to offload all layers to GPU if available
)

# 2. Define the Chat Template for Gemma 2
# Gemma uses <start_of_turn> and <end_of_turn> markers
def generate_gemma_response(user_prompt):
    formatted_prompt = f"<start_of_turn>user\n{user_prompt}<end_of_turn>\n<start_of_turn>model\n"
    
    # Generate response
    response = llm(
        formatted_prompt,
        max_tokens=512,
        stop=["<end_of_turn>"], # Stop generating when the model is done
        echo=False
    )
    
    return response['choices'][0]['text']

# 3. Test it
prompt = "Explain the concept of 'Soft Skills' in professional development."
print(f"User: {prompt}\n")
print(f"Gemma: {generate_gemma_response(prompt)}")