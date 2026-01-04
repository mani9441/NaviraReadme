import os
from groq import Groq
from dotenv import load_dotenv

# Load your .env file
load_dotenv()

# 1. Initialize the Groq client
# It will automatically look for an environment variable named GROQ_API_KEY
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_groq(prompt: str):
    """
    Generates a SINGLE README section using Groq (streaming).
    The prompt is already section-specific and prepared by backend.
    """

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a senior software engineer and professional technical writer.\n\n"
                    "Rules:\n"
                    "- Generate ONLY the requested README section\n"
                    "- Output must be valid Markdown\n"
                    "- Do NOT generate a full README\n"
                    "- Do NOT repeat other sections\n"
                    "- No introductions, no explanations, no emojis\n"
                    "- Be concise, accurate, and repository-specific"
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        max_completion_tokens=2048,
        top_p=1,
        stream=True,
    )
    # 3. Handle the streaming response
    full_response = ""
    for chunk in completion:
        content = chunk.choices[0].delta.content or ""
        #print(content, end="", flush=True) # flush=True ensures real-time printing
        full_response += content
    
    return full_response




def call_gemini(prompt):
    return call_groq(prompt)


## ------------------------------------------------------------###

# import os
# from openai import OpenAI
# from dotenv import load_dotenv

# # Path should be relative to where you run the script
# load_dotenv()

# # 1. Point the client to Google's OpenAI-compatible endpoint
# client = OpenAI(
#     api_key=os.getenv("GEMINI_API_KEY"),
#     base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
# )

# def call_gemini(prompt: str):
#     # 2. Use the new client syntax and a valid Gemini model name
#     response = client.chat.completions.create(
#         model="gemini-2.5-flash", 
#         messages=[{"role": "user", "content": prompt}],
#         temperature=0.3,
#     )
#     return response.choices[0].message.content