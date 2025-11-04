from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        return {
            "tasks": {"Mathematics": [], "Biology": [], "English": []},
            "moods": {}
        }
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

# ----------------------------
# Routes
# ----------------------------
@app.route("/")
def home():
    data = load_data()
    return render_template("index.html", tasks=data["tasks"], moods=data["moods"])

@app.route("/add_task", methods=["POST"])
def add_task():
    data = load_data()
    subject = request.form.get("subject")
    task = request.form.get("task")
    due_date = request.form.get("due_date")

    if subject and task:
        if subject not in data["tasks"]:
            data["tasks"][subject] = []
        data["tasks"][subject].append({
            "task": task,
            "done": False,
            "due_date": due_date
        })
        save_data(data)
    return redirect(url_for("home"))

@app.route("/toggle_task", methods=["POST"])
def toggle_task():
    data = load_data()
    payload = request.get_json()
    subject = payload["subject"]
    task_text = payload["task"]

    for t in data["tasks"].get(subject, []):
        if t["task"] == task_text:
            t["done"] = not t["done"]
            break
    save_data(data)
    return jsonify({"success": True})

@app.route("/remove_task", methods=["POST"])
def remove_task():
    data = load_data()
    payload = request.get_json()
    subject = payload["subject"]
    task_text = payload["task"]

    data["tasks"][subject] = [t for t in data["tasks"].get(subject, []) if t["task"] != task_text]
    save_data(data)
    return jsonify({"success": True})

@app.route("/ai_suggestion", methods=["POST"])
def ai_suggestion():
    mood = request.form.get("mood")
    suggestions = {
        "😃": "Great mood! Tackle your hardest subject 💪",
        "😐": "Feeling okay — start with something light 📚",
        "😞": "Down? Try reviewing easy notes 🌿",
        "😡": "Angry? Quick wins first ⚡",
        "😴": "Tired? Rest, then short study bursts ☕"
    }
    response = suggestions.get(mood, "Focus on small wins today 🔥")
    return jsonify({"message": response})

# ----------------------------
# Run app
# ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
