from gpt4all import GPT4All
import sys

models = GPT4All.list_models()
for m in models:
    print(m)
sys.stdout.flush()
