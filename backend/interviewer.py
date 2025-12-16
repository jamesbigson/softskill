import sys
import os
from gpt4all import GPT4All

class InterviewSession:
    def __init__(self, resume_text: str, model):
        self.resume_text = resume_text
        self.history = []
        self.model = model
        
        # Orca-style system prompt
        self.system_prompt = f"""### System:
You are an expert technical interviewer. 
The user provides a resume. You must ask interview questions based on it.
Ask ONLY ONE question at a time.
Do not repeat the candidate's answer.
Be professional and concise.

Resume:
{self.resume_text}

### User:
Hello, I am ready for the interview.
"""
        # Start the conversation
        self.history.append({"role": "system", "content": self.system_prompt})

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
        # If it's the very first turn, the system prompt already includes the "User: Hello" part
        # so we might skip appending user_response if it's just the initial trigger.
        # But for simplicity, we'll keep the history clean.
        
        analysis = None
        if user_response:
             analysis = self.analyze_response(user_response)
        
        prompt_string = ""
        
        # Reconstruct full prompt context
        # Orca format: 
        # ### System: ...
        # ### User: ...
        # ### Assistant: ...
        
        # Base context
        prompt_string += self.system_prompt
        
        # Append history (excluding the confusing initial system setup which is already in prompt_string)
        for msg in self.history:
             if msg["role"] == "system": continue # Skip, already added
             
             if msg["role"] == "user":
                 prompt_string += f"\n### User:\n{msg['content']}\n"
             elif msg["role"] == "assistant":
                 prompt_string += f"\n### Assistant:\n{msg['content']}\n"
        
        if user_response:
            prompt_string += f"\n### User:\n{user_response}\n"
            self.history.append({"role": "user", "content": user_response})
            
        prompt_string += "\n### Assistant:\n"

        # Generate response
        response = self.model.generate(prompt_string, max_tokens=150)
        
        # Clean up response if it generates too much
        response = response.strip()
        
        self.history.append({"role": "assistant", "content": response})
        return response, analysis
