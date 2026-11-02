from flask import Blueprint, request, jsonify
from utils.auth import token_required
import bcrypt

auth_bp = Blueprint("auth", __name__)


# =========================================================
# REGISTER
# =========================================================

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    learning_skill = data.get("learning_skill")
    teaching_skill = data.get("teaching_skill")

    if not name or not email or not password:
        return jsonify({
            "error": "Name, email and password are required"
        }), 400

    from app import db

    # Check if user already exists
    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:
        return jsonify({
            "error": "Email already registered"
        }), 409

    # Hash password
    password_hash = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Create user
    user = {
        "name": name,
        "email": email,
        "password": password_hash.decode("utf-8"),
        "learning_skill": learning_skill,
        "teaching_skill": teaching_skill
    }

    result = db.users.insert_one(user)

    user_id = str(result.inserted_id)

    # Create wallet with 3 free credits
    wallet = {
        "user_id": user_id,
        "balance": 3,
        "total_earned": 0,
        "total_spent": 0,
        "pending": 0
    }

    db.wallets.insert_one(wallet)

    # Record the free-credit welcome transaction
    transaction = {
        "user_id": user_id,
        "title": "Welcome Bonus",
        "description": "3 free SkillSwap credits",
        "amount": 3,
        "type": "earned"
    }

    db.transactions.insert_one(transaction)

    return jsonify({
        "message": "Registration successful!",
        "user_id": user_id,
        "name": name,
        "email": email,
        "credits": 3
    }), 201


# =========================================================
# LOGIN
# =========================================================

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    # Check required fields
    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    # Access MongoDB
    from app import db

    # Find user by email
    user = db.users.find_one({
        "email": email
    })

    if not user:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Check password
    password_correct = bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"].encode("utf-8")
    )

    if not password_correct:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    # Create JWT token
    from flask import current_app
    import jwt
    from datetime import datetime, timedelta, timezone

    token = jwt.encode(
        {
            "user_id": str(user["_id"]),
            "email": user["email"],
            "exp": datetime.now(timezone.utc) + timedelta(hours=24)
        },
        current_app.config["JWT_SECRET"],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login successful!",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# =========================================================
# CHECK AUTHENTICATED USER
# =========================================================

@auth_bp.route("/me", methods=["GET"])
@token_required
def me():
    return jsonify({
        "message": "Authenticated successfully!",
        "user": request.user
    }), 200