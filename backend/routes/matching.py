from flask import Blueprint, jsonify, request
from utils.auth import token_required
from bson import ObjectId

matching_bp = Blueprint("matching", __name__)


@matching_bp.route("", methods=["GET"])
@token_required
def get_matches():
    from app import db

    current_user_id = request.user["user_id"]

    # Get all users except the currently logged-in user
    users = list(
        db.users.find(
            {
                "_id": {
                    "$ne": ObjectId(current_user_id)
                }
            },
            {
                "name": 1,
                "learning_skill": 1,
                "teaching_skill": 1
            }
        )
    )

    matches = []

    for user in users:
        name = user.get("name", "User")

        user_id = str(user["_id"])

        # Get this user's profile
        profile = db.profiles.find_one({
            "user_id": user_id
        })

        # Get availability from the profiles collection
        availability = None

        if profile:
            availability = profile.get("availability")

        matches.append({
            "id": user_id,
            "name": name,
            "initials": name[0].upper() if name else "U",
            "teaches": user.get("teaching_skill") or "Not specified",
            "wants": user.get("learning_skill") or "Not specified",
            "availability": availability
        })

    return jsonify({
        "matches": matches
    }), 200