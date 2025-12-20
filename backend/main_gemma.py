from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pypdf import PdfReader
from io import BytesIO
from typing import Dict, Optional
import uuid
import os

from interviewer_gemma import GemmaInterviewSession
from resume_analyst import ResumeAnalyst

from contextlib import asynccontextmanager
from llama_cpp import Llama

# Global model instance
model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load model on startup
    global model
    print("Loading Gemma AI model... (this may take a moment)")
    try:
        model_path = "gemma-2b-it.Q4_K_M.gguf"
        if not os.path.exists(model_path):
             print(f"Model file not found at {model_path}")
        
        # Initialize Llama (Gemma) model
        # Parameters taken from test3.py
        model = Llama(
            model_path=model_path,
            n_ctx=2048,
            n_threads=8,
            n_gpu_layers=-1
        )
        print("AI Model (Gemma) loaded successfully!")
    except Exception as e:
        print(f"Failed to load AI model: {e}")
    yield
    # Clean up (if needed)

app = FastAPI(lifespan=lifespan)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for sessions
sessions: Dict[str, GemmaInterviewSession] = {}

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
        sessions[session_id] = GemmaInterviewSession(text, model)
        
        # Get the first question (greeting/opening)
        # We simulate the user saying "Hello" to kickstart the interviewer
        first_question, _ = sessions[session_id].get_next_question(user_response="Hello, I am ready for the interview.")
        
        return {"session_id": session_id, "message": first_question}
        
    except Exception as e:
        print(f"Error processing resume: {e}") 
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
        result = analyst.analyze_ats_score()
        
        return result
        
    except Exception as e:
        print(f"Error analyzing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
