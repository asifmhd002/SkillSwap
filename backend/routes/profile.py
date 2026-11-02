from flask import Blueprint, jsonify, request
from utils.auth import token_required
import os
import uuid


profile_bp = Blueprint("profile", __name__)


# =========================
# PROFILE
# =========================

@profile_bp.route("/", methods=["GET"])
@token_required
def get_profile():

    from app import db
    from bson import ObjectId

    user_id = request.user["user_id"]

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    # Get profile document
    profile = db.profiles.find_one({
        "user_id": user_id
    })

    profile_picture = None

    if profile:
        profile_picture = profile.get("profile_picture")

    return jsonify({
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "profile_picture": profile_picture
    }), 200


# =========================
# AVAILABILITY
# =========================

@profile_bp.route("/availability", methods=["GET"])
@token_required
def get_availability():

    from app import db

    user_id = request.user["user_id"]

    profile = db.profiles.find_one({
        "user_id": user_id
    })

    if not profile:
        return jsonify({
            "availability": None
        }), 200

    return jsonify({
        "availability": profile.get("availability")
    }), 200


@profile_bp.route("/availability", methods=["PUT"])
@token_required
def update_availability():

    from app import db

    user_id = request.user["user_id"]

    data = request.get_json()

    if not data or "availability" not in data:
        return jsonify({
            "error": "Availability data is required"
        }), 400

    availability = data["availability"]

    db.profiles.update_one(
        {
            "user_id": user_id
        },
        {
            "$set": {
                "availability": availability
            }
        },
        upsert=True
    )

    return jsonify({
        "message": "Availability updated successfully!",
        "availability": availability
    }), 200


# =========================
# PROFILE PICTURE UPLOAD
# =========================

@profile_bp.route("/picture", methods=["POST"])
@token_required
def upload_profile_picture():

    from app import db

    user_id = request.user["user_id"]

    # -------------------------
    # Check uploaded file
    # -------------------------

    if "profile_picture" not in request.files:
        return jsonify({
            "error": "No profile picture was uploaded"
        }), 400

    file = request.files["profile_picture"]

    if not file.filename:
        return jsonify({
            "error": "No file selected"
        }), 400

    # -------------------------
    # Check file type
    # -------------------------

    if not file.mimetype.startswith("image/"):
        return jsonify({
            "error": "Only image files are allowed"
        }), 400

    # -------------------------
    # Check file size
    # -------------------------

    max_size = 1.5 * 1024 * 1024

    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)

    if file_size > max_size:
        return jsonify({
            "error": "Profile picture must be 1.5 MB or smaller"
        }), 400

    # -------------------------
    # Upload directory
    # -------------------------

    upload_folder = os.path.join(
        os.getcwd(),
        "uploads",
        "profile_pictures"
    )

    os.makedirs(
        upload_folder,
        exist_ok=True
    )

    # -------------------------
    # Get existing profile
    # -------------------------

    old_profile = db.profiles.find_one(
        {
            "user_id": user_id
        },
        {
            "profile_picture": 1
        }
    )

    old_filename = None

    if old_profile:
        old_filename = old_profile.get(
            "profile_picture"
        )

    # -------------------------
    # Generate new filename
    # -------------------------

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    new_filename = f"{uuid.uuid4().hex}{extension}"

    new_file_path = os.path.join(
        upload_folder,
        new_filename
    )

    # -------------------------
    # Save NEW image first
    # -------------------------

    file.save(new_file_path)

    # -------------------------
    # Update MongoDB
    # -------------------------

    try:

        db.profiles.update_one(
            {
                "user_id": user_id
            },
            {
                "$set": {
                    "profile_picture": new_filename
                }
            },
            upsert=True
        )

    except Exception as error:

        # MongoDB update failed.
        # Remove the newly uploaded image
        # so we don't leave an unused file.

        if os.path.exists(new_file_path):
            os.remove(new_file_path)

        print(
            "Profile picture database update error:",
            error
        )

        return jsonify({
            "error": "Failed to save profile picture"
        }), 500

    # -------------------------
    # Delete OLD image
    # -------------------------

    if old_filename and old_filename != new_filename:

        old_file_path = os.path.join(
            upload_folder,
            os.path.basename(old_filename)
        )

        if os.path.exists(old_file_path):

            try:

                os.remove(old_file_path)

                print(
                    "Old profile picture deleted:",
                    old_filename
                )

            except Exception as error:

                # Don't fail the upload if old-file
                # cleanup happens to fail.

                print(
                    "Could not delete old profile picture:",
                    error
                )

    # -------------------------
    # Success response
    # -------------------------

    return jsonify({
        "message": "Profile picture uploaded successfully!",
        "profile_picture": new_filename
    }), 200