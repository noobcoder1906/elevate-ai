from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from typing import List

app = FastAPI()

# Enable CORS for frontend communication
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the dataset
df = pd.read_csv("forum_data.csv")

# Ensure topics are treated as strings
df["topics"] = df["topics"].astype(str)

# Extract unique domains (topics)
domains = sorted(set(topic.strip() for topics in df["topics"].dropna() for topic in topics.split(",")))

# Data Models
class DomainListResponse(BaseModel):
    domains: List[str]

class QuestionResponse(BaseModel):
    id: str
    title: str

class AnswerResponse(BaseModel):
    answer: str


@app.get("/", summary="Root endpoint")
async def root():
    return {"message": "FastAPI is running!"}


@app.get("/domains", response_model=DomainListResponse)
async def get_domains():
    """Return list of unique domains."""
    print("Serving domains:", domains)  # Debugging line
    return {"domains": domains}


@app.get("/questions/{domain}", response_model=List[QuestionResponse])
async def get_questions(domain: str, page: int = Query(1, ge=1), per_page: int = Query(5, ge=1, le=20)):
    """Return paginated questions for a selected domain."""
    filtered_df = df[df["topics"].str.contains(domain, na=False, regex=False)]

    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    questions = [
        {"id": str(row["questionID"]), "title": row["questionTitle"]}
        for _, row in filtered_df.iloc[start_idx:end_idx].iterrows()
    ]

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found for this domain.")

    return questions


@app.get("/answer/{question_id}", response_model=AnswerResponse)
async def get_answer(question_id: str):
    """Return the answer for a selected question."""
    answer_row = df[df["questionID"] == question_id]

    if answer_row.empty:
        raise HTTPException(status_code=404, detail="Answer not found.")

    return {"answer": answer_row.iloc[0]["answerText"]}

