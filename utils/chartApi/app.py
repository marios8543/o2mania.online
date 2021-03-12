from flask import Flask, request
from sqlite3 import connect

app = Flask(__name__)
db = connect("charts.db")

@app.route("/songs")
def songs():
    int(request.args.get("genre", "1"))
    