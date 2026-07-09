from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any
import openai
import os
from dotenv import load_dotenv
import json
import asyncio

# Load environment variables
load_dotenv()

app = FastAPI()

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configure OpenAI client for Gemini API
api_key = os.getenv("GEMINI_API_KEY")
base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

client = openai.OpenAI(
    api_key=api_key,
    base_url=base_url
)

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: List[Message] = []

class ChatResponse(BaseModel):
    response: str
    conversation_history: List[Message]

# In-memory storage for conversation (in production, use a database)
conversations: Dict[str, List[Message]] = {}

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Serve the main HTML page for Lexara AI"""
    try:
        with open("static/index.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        return HTMLResponse(content=html_content, status_code=200)
    except FileNotFoundError:
        return HTMLResponse(content="<h1>Lexara AI</h1><p>Frontend files not found</p>", status_code=404)

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Handle chat requests and interact with Gemini API"""
    try:
        # Build conversation history
        conversation_history = request.conversation_history.copy()
        
        # Add user message to history
        user_message = Message(role="user", content=request.message)
        conversation_history.append(user_message)
        
        # Prepare messages for Gemini API, injecting a system instruction to handle recent cutoff queries
        system_instruction = (
            "You are Lexara AI, a helpful assistant. Your knowledge cutoff is early 2025. "
            "If the user asks about events, sports results, or developments after this period "
            "(such as IPL 2026 or other future events), gently explain that your training data "
            "does not cover these recent events and suggest where they might find real-time information."
        )
        
        messages = [{"role": "system", "content": system_instruction}]
        messages.extend([{"role": msg.role, "content": msg.content} for msg in conversation_history])
        
        # Call Gemini API
        response = client.chat.completions.create(
            model=gemini_model,
            messages=messages,
            max_tokens=2000,
            temperature=0.7
        )
        
        # Extract assistant response
        assistant_content = response.choices[0].message.content
        
        # Add assistant response to history
        assistant_message = Message(role="assistant", content=assistant_content)
        conversation_history.append(assistant_message)
        
        return ChatResponse(
            response=assistant_content,
            conversation_history=conversation_history
        )
        
    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat request: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
