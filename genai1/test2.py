import os 
import google.generativeai as genai

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

model = genai.GenerativeModel("gemini-1.5-flash")

sample_doc = genai.upload_file(path='./Raymond Camden.pdf', mime_type='application/pdf')

prompt = "This is a resume. Provide feedback on the resume including suggestions for improvement."

response = model.generate_content([sample_doc, prompt])
print(response.text)