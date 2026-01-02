import openai
from dotenv import load_dotenv
import os


openai.api_key = os.getenv("GEMINI_API_KEY")

def call_gemini(prompt: str):
    response = openai.ChatCompletion.create(
        model="gemini-1.5",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content
