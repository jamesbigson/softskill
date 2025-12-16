from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from io import BytesIO
from typing import Dict, Optional
import uuid

from interviewer import InterviewSession
from resume_analyst import ResumeAnalyst

from contextlib import asynccontextmanager
from gpt4all import GPT4All

# Global model instance
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    global model
    print("Loading AI model... (this may take a moment)")
    try:
        # Reverting to the known working model "Orca Mini" to fix the 404 error.
        # While slightly slower, it is reliable.
        model = GPT4All("orca-mini-3b-gguf2-q4_0.gguf", device='cpu')
        print("AI Model (Orca Mini) loaded successfully!")
    except Exception as e:
        print(f"Failed to load AI model: {e}")
    yield
    # Clean up (if needed)

app = FastAPI(lifespan=lifespan)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions (for simple demo purposes)
sessions: Dict[str, InterviewSession] = {}

class AnswerRequest(BaseModel):
    session_id: str
    answer: str

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if model is None:
         raise HTTPException(status_code=503, detail="AI Model is not loaded. Check server logs.")

    try:
        content = await file.read()
        pdf_reader = PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        session_id = str(uuid.uuid4())
        sessions[session_id] = InterviewSession(text, model)
        
        # Get the first question (greeting/opening)
        first_question, _ = sessions[session_id].get_next_question(user_response="Hello, I am ready for the interview.")
        
        return {"session_id": session_id, "message": first_question}
        
    except Exception as e:
        print(f"Error processing resume: {e}") # Log error to console
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ask-question")
async def ask_question(request: AnswerRequest):
    session_id = request.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    next_question, analysis = session.get_next_question(user_response=request.answer)
    
    return {
        "message": next_question,
        "analysis": analysis
    }

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        pdf_reader = PdfReader(BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
            
        analyst = ResumeAnalyst(text)
        # For this phase 2 demo, we check against generic keywords. 
        # In a full version, we'd accept a Job Description text field too.
        result = analyst.analyze_ats_score()
        
        return result
        
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
