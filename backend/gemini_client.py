import os
from openai import OpenAI
from dotenv import load_dotenv

# Path should be relative to where you run the script
load_dotenv()

# 1. Point the client to Google's OpenAI-compatible endpoint
client = OpenAI(
    api_key=os.getenv("GEMINI_API_KEY"),
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

def call_gemini(prompt: str):
    # 2. Use the new client syntax and a valid Gemini model name
    response = client.chat.completions.create(
        model="gemini-2.5-flash", 
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content