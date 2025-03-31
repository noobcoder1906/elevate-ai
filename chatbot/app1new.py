from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import random
import json
import pickle
import numpy as np
import re
import nltk
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from nltk.stem import WordNetLemmatizer
from nltk.corpus import stopwords
from typing import List

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# =================== CHATBOT FUNCTIONALITY ===================

# Preprocessing setup
nltk.download("stopwords")
nltk.download("wordnet")
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words("english"))
critical_terms = {"sad", "cry", "depressed", "hopeless", "am"}
stop_words -= critical_terms

def preprocess_text(text):
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"[^\w\s]", "", text)
    text = re.sub(r"\d+", "", text)
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)
    text = text.lower()
    words = text.split()
    words = [word for word in words if word not in stop_words]
    words = [lemmatizer.lemmatize(word) for word in words if len(word) > 2]
    return " ".join(words)

# Load chatbot resources
base_dir = os.path.dirname(os.path.abspath(__file__))
intents_path = os.path.join(base_dir, "intents1.json")
tokenizer_path = os.path.join(base_dir, "tokenizer1.pkl")  
classes_path = os.path.join(base_dir, "classes1.pkl")
model_path = os.path.join(base_dir, "chatbot_model_with_glove1.h5")

with open(intents_path, "r") as f:
    intents = json.load(f)

tokenizer = pickle.load(open(tokenizer_path, "rb"))
classes = pickle.load(open(classes_path, "rb"))
model = load_model(model_path)

# API Model for chatbot
class ChatRequest(BaseModel):
    message: str

# Chatbot prediction logic
def predict_class(sentence):
    preprocessed_sentence = preprocess_text(sentence)
    sequence = tokenizer.texts_to_sequences([preprocessed_sentence])
    sequence_padded = pad_sequences(sequence, maxlen=model.input_shape[1], padding="post")
    predictions = model.predict(sequence_padded)[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(predictions) if r > ERROR_THRESHOLD]
    results.sort(key=lambda x: x[1], reverse=True)
    return [{"intent": classes[r[0]], "probability": str(r[1])} for r in results]

def get_response(intents_list):
    if not intents_list:
        return "I'm here to help, but I didn't quite understand that."
    tag = intents_list[0]["intent"]
    for intent in intents["intents"]:
        if intent["tag"] == tag:
            return random.choice(intent["responses"])
    return "I'm here to help, but I didn't quite understand that."

@app.post("/api/chatbot")
async def chatbot_response(request: ChatRequest):
    try:
        intents_list = predict_class(request.message)
        response = get_response(intents_list)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# =================== FORUM FUNCTIONALITY ===================
import pandas as pd
# Load forum data
forum_path = os.path.join(base_dir, "forum_data.csv")
df = pd.read_csv(forum_path)
df["topics"] = df["topics"].astype(str)
domains = sorted(set(topic.strip() for topics in df["topics"].dropna() for topic in topics.split(",")))

# API Models for forum
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
    return {"domains": domains}

@app.get("/questions/{domain}", response_model=List[QuestionResponse])
async def get_questions(domain: str, page: int = Query(1, ge=1), per_page: int = Query(5, ge=1, le=20)):
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
    answer_row = df[df["questionID"] == question_id]
    if answer_row.empty:
        raise HTTPException(status_code=404, detail="Answer not found.")
    return {"answer": answer_row.iloc[0]["answerText"]}


# =================== QUIZ FUNCTIONALITY ===================
# Load Quiz Model and Scaler
# Correct model path (ensure the structure is correct)
quiz_model_path = os.path.join(base_dir, "ann_model_new.h5")  # Move out of "chatbot"
scaler_path = os.path.join(base_dir, "scaler.pkl")

try:
    ann_model = load_model(quiz_model_path, compile=False)
    with open(scaler_path, "rb") as f:
        sc = pickle.load(f)
except Exception as e:
    raise RuntimeError(f"❌ Error loading quiz model or scaler: {e}")

# API Model for Quiz Prediction
class QuizRequest(BaseModel):
    features: List[float]  # List of numerical answers from the quiz

@app.post("/predict")
async def predict_depression(request: QuizRequest):
    try:
        user_input = np.array(request.features).reshape(1, -1)  # Reshape for prediction
        user_input = sc.transform(user_input)  # Scale input
        prediction = ann_model.predict(user_input)
        result = "Depressed" if prediction[0][0] > 0.5 else "Not Depressed"
        return {"prediction": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")


# ===================SENTIMENT ANALYSIS===================

lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))
critical_terms = {"sad", "cry", "depressed", "hopeless",'am'}  # Add domain-specific terms
stop_words = stop_words - critical_terms

# Add domain-specific stopwords
additional_stopwords = {'life', 'something', 'anything','aand','abt','ability', 'academic', 'able','account','advance'}  # Add more if needed
stop_words.update(additional_stopwords)

# Preprocessing Function (same as before)
def preprocess_text(text):
    text = re.sub(r"http\S+|www\S+|https\S+", '', text)
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'_+', '', text)
    text = re.sub(r'(.)\1{2,}', r'\1\1', text)
    text = text.lower()
    words = text.split()
    words = [word for word in words if word not in stop_words]
    words = [word for word in words if len(word) > 2]
    words = [lemmatizer.lemmatize(word) for word in words]
    return ' '.join(words).strip()

sentiment_tokenizer=os.path.join(base_dir, "tokenizer_sentiment.pickle")
# Load the tokenizer
with open(sentiment_tokenizer, 'rb') as handle:
    tokenizer = pickle.load(handle)

sentiment_lstm=os.path.join(base_dir, "sentiment_model_lstm_new_final.keras")
# Load the model
model = load_model(sentiment_lstm, compile=False)

max_length = 32  # This should match the max_length used during training


# Pydantic model for input data validation
class TextInput(BaseModel):
    text: str

def predict_sentiment(text):
    new_sequence = tokenizer.texts_to_sequences([preprocess_text(text)])
    padded_new_sequence = pad_sequences(new_sequence, maxlen=max_length, padding='post')
    prediction = model.predict(padded_new_sequence)
    sentiment = "Positive" if prediction[0][0] > 0.5 else "Negative"
    probability = float(prediction[0][0])  # Convert numpy.float32 to float
    return sentiment, probability

# Define the API endpoint
@app.post("/predict-sentiment/")
async def get_sentiment(input_data: TextInput):
    sentiment, probability = predict_sentiment(input_data.text)
    return {"input_text": input_data.text, "predicted_sentiment": sentiment, "prediction_probability": round(probability, 4)}

