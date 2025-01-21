# GEMINI_API_KEY
import os 
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Explain how AI works. Your response should be tailored for a non-technical audience elementary school.")
print(response.text)