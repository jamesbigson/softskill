import sys
import os

class GemmaInterviewSession:
    def __init__(self, resume_text: str, model):
        self.resume_text = resume_text
        self.history = []
        self.model = model
        
        # System instructions
        self.system_instruction = f"""You are an expert technical interviewer. 
The user provides a resume. You must ask interview questions based on it.
Ask ONLY ONE question at a time.
Do not repeat the candidate's answer.
Be professional and concise.

Resume:
{self.resume_text}
"""
        # We don't append system instruction to history like a role for Gemma immediately, 
        # but we prepend it to the context when generating.
        # However, for chat history tracking, we can keep track of User/Model turns.
        
        # Initial context setting if we want to "prime" the model or just keep it in system instruction.
        # Gemma doesn't have a strict "system" role in its chat template usually, 
        # but we can simulate it by putting it in the first user turn or just prepending it.
        # Protocol: <start_of_turn>user\n{prompt}<end_of_turn>\n<start_of_turn>model\n

    def analyze_response(self, text: str):
        if not text:
            return None
            
        words = text.lower().split()
        word_count = len(words)
        
        # Filler word detection
        fillers = ['um', 'uh', 'like', 'you know', 'sort of', 'actually', 'basically', 'seriously', 'literally']
        filler_count = 0
        detected_fillers = []
        
        for word in words:
            # Simple check, handles punctuation loosely
            clean_word = ''.join(e for e in word if e.isalnum())
            if clean_word in fillers:
                filler_count += 1
                detected_fillers.append(clean_word)
                
        # STAR Method check (very basic keyword heuristic)
        star_keywords = ['situation', 'task', 'action', 'result', 'outcome', 'challenge', 'solved']
        star_score = sum(1 for w in words if ''.join(e for e in w if e.isalnum()) in star_keywords)
        
        return {
            "word_count": word_count,
            "filler_count": filler_count,
            "detected_fillers": list(set(detected_fillers)), # unique
            "star_score": star_score, # simple metric
            "feedback": self._generate_feedback(word_count, filler_count)
        }

    def _generate_feedback(self, word_count, filler_count):
        feedback = []
        if word_count < 10:
            feedback.append("Your answer was very short. Elaborate more.")
        if filler_count > 2:
            feedback.append(f"Detected {filler_count} filler words. Try to pause instead of saying 'um' or 'like'.")
        if len(feedback) == 0:
            feedback.append("Good clear answer!")
        return feedback

    def get_next_question(self, user_response: str = None):
        analysis = None
        if user_response:
             analysis = self.analyze_response(user_response)
             self.history.append({"role": "user", "content": user_response})
        
        # Construct Prompt for Gemma
        # Format: 
        # <start_of_turn>user
        # {system_instruction}
        # 
        # {history...}
        # <end_of_turn>
        # <start_of_turn>model
        
        # Actually, best practice for system prompt in Gemma:
        # Just put it at the very beginning of the first user message.
        
        prompt_string = ""
        
        # If history is empty, it's the start.
        if not self.history:
            # Start: Assume user says "Hello, I am ready" implicitly or explicitly
            # The prompt asked for "Create backend... I refere test3.py".
            # In main.py, it calls get_next_question(user_response="Hello...")
            pass

        full_prompt = ""
        
        # We build the conversation
        # We need to map history to <start_of_turn> blocks
        
        # Merge system in first user block or just prepend
        first_turn = True
        
        for msg in self.history:
            role = msg["role"]
            content = msg["content"]
            
            if role == "user":
                full_prompt += f"<start_of_turn>user\n"
                if first_turn:
                    full_prompt += f"{self.system_instruction}\n\n"
                    first_turn = False
                full_prompt += f"{content}<end_of_turn>\n"
            elif role == "model":
                full_prompt += f"<start_of_turn>model\n{content}<end_of_turn>\n"
                
        # If no history (first call), we might have a user_response passed in arg but not in history yet?
        # logic: user_response is added to history above.
        # But wait, main.py calls get_next_question with "Hello..." as first call.
        # So history has 1 item: User: Hello...
        # So loop above handles it.
        
        # Ready for model generation
        full_prompt += "<start_of_turn>model\n"
        
        # Generate response
        # Using the call signature from test3.py: llm(prompt, stop=..., echo=False)
        output = self.model(
            full_prompt,
            max_tokens=256,
            stop=["<end_of_turn>"],
            echo=False
        )
        
        response_text = output['choices'][0]['text'].strip()
        
        self.history.append({"role": "model", "content": response_text})
        
        return response_text, analysis
