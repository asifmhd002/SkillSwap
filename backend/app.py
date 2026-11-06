from flask import Flask, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os

from routes.auth import auth_bp
from routes.profile import profile_bp
from routes.messages import messages_bp
from routes.sessions import sessions_bp
from routes.wallet import wallet_bp
from routes.matching import matching_bp


load_dotenv(dotenv_path=".env")

app = Flask(__name__)


# -----------------------------
# CORS
# -----------------------------

frontend_url = os.getenv(
    "FRONTEND_URL",
    "https://skillswap-frontend-gbw2.onrender.com"
)

allowed_origins = [
    frontend_url,
    "http://localhost:5173"
]

CORS(app, resources={
    r"/api/*": {"origins": allowed_origins},
    r"/uploads/*": {"origins": allowed_origins}
})


# -----------------------------
# JWT
# -----------------------------

app.config["JWT_SECRET"] = os.getenv("JWT_SECRET")


# -----------------------------
# Register Blueprints
# -----------------------------

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    profile_bp,
    url_prefix="/api/profile"
)

app.register_blueprint(
    messages_bp,
    url_prefix="/api/messages"
)

app.register_blueprint(
    sessions_bp,
    url_prefix="/api/sessions"
)

app.register_blueprint(
    wallet_bp,
    url_prefix="/api/wallet"
)

app.register_blueprint(
    matching_bp,
    url_prefix="/api/matches"
)


# -----------------------------
# MongoDB
# -----------------------------

mongo_uri = os.getenv("MONGO_URI")

client = MongoClient(mongo_uri)

db = client["skillswap"]


# -----------------------------
# Home Route
# -----------------------------

@app.route("/")
def home():
    return "SkillSwap Backend is running!"


# -----------------------------
# MongoDB Test Route
# -----------------------------

@app.route("/api/test-db")
def test_db():
    try:
        client.admin.command("ping")

        return "MongoDB connection successful!"

    except Exception as e:

        return f"MongoDB connection failed: {e}", 500


# -----------------------------
# Profile Picture Route
# -----------------------------

@app.route("/uploads/profile_pictures/<filename>")
def uploaded_profile_picture(filename):

    upload_folder = os.path.join(
        os.getcwd(),
        "uploads",
        "profile_pictures"
    )

    return send_from_directory(
        upload_folder,
        filename
    )


# -----------------------------
# Start Flask
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True)