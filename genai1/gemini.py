import os 
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content

class Gemini:
	
	def __init__(self):
		genai.configure(api_key=os.environ["GEMINI_API_KEY"])

		generation_config = {
		"temperature": 1,
		"top_p": 0.95,
		"top_k": 40,
		"max_output_tokens": 8192,
		"response_schema": content.Schema(
			type = content.Type.OBJECT,
			enum = [],
			required = ["review", "revisedResume"],
			properties = {
			"review": content.Schema(
				type = content.Type.STRING,
			),
			"revisedResume": content.Schema(
				type = content.Type.STRING,
			),
			},
		),
		"response_mime_type": "application/json",
		}

		self.model = genai.GenerativeModel(model_name="gemini-1.5-flash", generation_config=generation_config)

	def review(self, path):
		sample_doc = genai.upload_file(path=path, mime_type='application/pdf')
		prompt = "This is a resume. Provide feedback on the resume including suggestions for improvement. After the suggestions, add a dashed line and then provide a text version of the resume with improvements applied."

		response = self.model.generate_content([sample_doc, prompt])
		return response.text
