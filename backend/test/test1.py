import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig

model_id = "mistralai/Mistral-7B-Instruct-v0.2"

# 1. 4-bit quantization config (REQUIRED for 4GB VRAM)
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)

# 2. Load tokenizer (slow tokenizer avoids Windows bugs)
tokenizer = AutoTokenizer.from_pretrained(
    model_id,
    use_fast=False
)

# 3. Load model
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    device_map="auto",
    quantization_config=bnb_config,
    torch_dtype=torch.float16
)

# 4. Prepare chat input (IMPORTANT)
messages = [
    {"role": "user", "content": "Explain artificial intelligence in simple words."}
]

input_ids = tokenizer.apply_chat_template(
    messages,
    tokenize=True,
    add_generation_prompt=True,
    return_tensors="pt"
).to(model.device)

# 5. Generate response
output = model.generate(
    input_ids,
    max_new_tokens=200,
    temperature=0.7,
    do_sample=True,
    repetition_penalty=1.1
)

# 6. Decode and print
response = tokenizer.decode(output[0], skip_special_tokens=True)
print(response)


# import torch
# from transformers import (
#     LlamaTokenizer,
#     AutoModelForCausalLM,
#     BitsAndBytesConfig
# )

# model_id = "mistralai/Mistral-7B-Instruct-v0.2"

# # 4-bit quantization (fits your laptop)
# bnb_config = BitsAndBytesConfig(
#     load_in_4bit=True,
#     bnb_4bit_quant_type="nf4",
#     bnb_4bit_use_double_quant=True,
#     bnb_4bit_compute_dtype=torch.float16
# )

# # 🔥 FORCE SLOW TOKENIZER (NO FAST CONVERSION)
# tokenizer = LlamaTokenizer.from_pretrained(
#     model_id,
#     legacy=True
# )

# model = AutoModelForCausalLM.from_pretrained(
#     model_id,
#     device_map="auto",
#     quantization_config=bnb_config,
#     torch_dtype=torch.float16
# )

# prompt = "Explain communication skills in simple words."

# inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

# output = model.generate(
#     **inputs,
#     max_new_tokens=120,
#     temperature=0.7,
#     do_sample=True
# )

# print(tokenizer.decode(output[0], skip_special_tokens=True))
