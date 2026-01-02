import openai

openai.api_key = "YOUR_GEMINI_API_KEY"

def call_gemini(prompt: str):
    response = openai.ChatCompletion.create(
        model="gemini-1.5",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content
