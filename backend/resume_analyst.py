from collections import Counter
import re

class ResumeAnalyst:
    def __init__(self, resume_text: str):
        self.resume_text = resume_text.lower()
        self.words = self._extract_words(self.resume_text)

    def _extract_words(self, text):
        return re.findall(r'\b\w+\b', text.lower())

    def analyze_ats_score(self, job_description: str = ""):
        # If no JD provided, use a generic "Software Engineer" set of keywords for demo
        if not job_description:
            target_keywords = {
                'python', 'javascript', 'react', 'node', 'sql', 'database', 
                'api', 'rest', 'git', 'agile', 'communication', 'teamwork', 
                'problem', 'solving', 'leadership'
            }
        else:
            # Simple keyword extraction from JD (ignoring common stop words)
            jd_words = set(re.findall(r'\b\w+\b', job_description.lower()))
            common_stops = {'and', 'the', 'to', 'of', 'in', 'for', 'with', 'a', 'an', 'is', 'are'}
            target_keywords = jd_words - common_stops

        found_keywords = []
        missing_keywords = []
        
        score_counter = 0
        
        for keyword in target_keywords:
            if keyword in self.words:
                found_keywords.append(keyword)
                score_counter += 1
            else:
                missing_keywords.append(keyword)

        # Calculate Score (0-100)
        total_target = len(target_keywords)
        if total_target == 0:
            score = 100
        else:
            score = int((score_counter / total_target) * 100)

        # Cap score at 100, minimum 0
        score = max(0, min(100, score))

        return {
            "score": score,
            "found_keywords": list(found_keywords),
            "missing_keywords": list(missing_keywords)[:10], # Return top 10 missing
            "total_words": len(self.words)
        }
