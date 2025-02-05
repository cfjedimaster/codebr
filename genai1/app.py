from flask import Flask
from flask import render_template, request 
from gemini import Gemini 

app = Flask(__name__)

gemini = Gemini()

@app.route("/")
def hello_world():
	return render_template('index.html')

@app.post("/review")
def handleReview():
	f = request.files['file']
	f.save('./pdfs/input.pdf')
	result = gemini.review('./pdfs/input.pdf')
	return result