from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from calculator import calculate as calc_func
from quiz import generate_quiz, evaluate_answers

app = FastAPI()

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Calculation(BaseModel):
    num1: float
    num2: float
    operation: str

class QuizStartRequest(BaseModel):
    num_questions: int
    question_type: str
    difficulty: int
    allow_negative: bool

class QuizAnswerRequest(BaseModel):
    quiz: List[dict]
    user_answers: List[Optional[float]]
    times: List[float]

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_root():
    return FileResponse("static/index.html")

@app.get("/calculator")
async def get_calculator():
    return FileResponse("static/calculator.html")

@app.get("/quiz")
async def get_quiz():
    return FileResponse("static/quiz.html")

# calculator function of app
@app.post("/calculate")
def calculate(calc: Calculation):
    res = calc_func(calc.num1, calc.num2, calc.operation)
    return {"result": res}

# quiz function of app
@app.post("/quiz/start")
def quiz_start(request: QuizStartRequest):
    quiz = generate_quiz(
        num_questions=request.num_questions,
        question_type=request.question_type,
        difficulty=request.difficulty,
        allow_negative=request.allow_negative
    )
    return {"quiz": quiz}

# to get and benchmark user's performance after quiz function
@app.post("/quiz/submit")
def quiz_submit(request: QuizAnswerRequest):
    results = evaluate_answers(request.quiz, request.user_answers, request.times)
    return {"results": results}
