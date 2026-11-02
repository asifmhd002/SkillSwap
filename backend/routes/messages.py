from flask import Blueprint, jsonify, request
from utils.auth import token_required
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

messages_bp = Blueprint("messages", __name__)


# =========================================================
# GET ALL CONVERSATIONS FOR CURRENT USER
# =========================================================

@messages_bp.route("/conversations", methods=["GET"])
@token_required
def get_conversations():

    from app import db

    user_id = request.user["user_id"]

    conversations = list(
        db.conversations.find({
            "participants": user_id
        }).sort("last_message_time", -1)
    )

    result = []

    for conversation in conversations:

        conversation["_id"] = str(conversation["_id"])

        # Convert MongoDB datetime if one exists
        if isinstance(conversation.get("last_message_time"), datetime):
            conversation["last_message_time"] = (
                conversation["last_message_time"]
                .astimezone(timezone.utc)
                .isoformat()
            )

        result.append(conversation)

    return jsonify({
        "conversations": result
    }), 200


# =========================================================
# GET MESSAGES FROM ONE CONVERSATION
# =========================================================

@messages_bp.route("/conversations/<conversation_id>", methods=["GET"])
@token_required
def get_messages(conversation_id):

    from app import db

    user_id = request.user["user_id"]

    # -----------------------------------------
    # Validate conversation ID
    # -----------------------------------------

    try:
        conversation_object_id = ObjectId(conversation_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid conversation ID"
        }), 400

    # -----------------------------------------
    # Find conversation
    # -----------------------------------------

    conversation = db.conversations.find_one({
        "_id": conversation_object_id
    })

    if not conversation:
        return jsonify({
            "error": "Conversation not found"
        }), 404

    # -----------------------------------------
    # Security check
    # Only participants can see messages
    # -----------------------------------------

    if user_id not in conversation.get("participants", []):

        return jsonify({
            "error": "You are not a participant in this conversation"
        }), 403

    # -----------------------------------------
    # Get messages
    # -----------------------------------------

    messages = list(
        db.messages.find({
            "conversation_id": conversation_id
        }).sort("created_at", 1)
    )

    result = []

    for message in messages:

        message["_id"] = str(message["_id"])

        if isinstance(message.get("created_at"), datetime):
            message["created_at"] = (
                message["created_at"]
                .astimezone(timezone.utc)
                .isoformat()
            )

        result.append(message)

    # -----------------------------------------
    # Mark current user's unread count as zero
    # -----------------------------------------

    db.conversations.update_one(
        {
            "_id": conversation_object_id
        },
        {
            "$set": {
                f"unread_counts.{user_id}": 0
            }
        }
    )

    return jsonify({
        "conversation": {
            "id": str(conversation["_id"]),
            "participants": conversation.get("participants", []),
            "participant_names": conversation.get(
                "participant_names",
                []
            )
        },
        "messages": result
    }), 200


# =========================================================
# SEND MESSAGE
# =========================================================

@messages_bp.route("/conversations/<conversation_id>", methods=["POST"])
@token_required
def send_message(conversation_id):

    from app import db

    user_id = request.user["user_id"]

    # -----------------------------------------
    # Validate conversation ID
    # -----------------------------------------

    try:
        conversation_object_id = ObjectId(conversation_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid conversation ID"
        }), 400

    # -----------------------------------------
    # Get request data
    # -----------------------------------------

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    text = data.get("text")

    if not text or not text.strip():
        return jsonify({
            "error": "Message text is required"
        }), 400

    text = text.strip()

    # -----------------------------------------
    # Find conversation
    # -----------------------------------------

    conversation = db.conversations.find_one({
        "_id": conversation_object_id
    })

    if not conversation:
        return jsonify({
            "error": "Conversation not found"
        }), 404

    # -----------------------------------------
    # Security:
    # Only participants can send messages
    # -----------------------------------------

    participants = conversation.get("participants", [])

    if user_id not in participants:

        return jsonify({
            "error": "You are not a participant in this conversation"
        }), 403

    # -----------------------------------------
    # Find current user's information
    # -----------------------------------------

    user = db.users.find_one({
        "_id": ObjectId(user_id)
    })

    if not user:
        return jsonify({
            "error": "User account not found"
        }), 404

    # -----------------------------------------
    # Find receiver
    # -----------------------------------------

    receiver_id = None

    for participant in participants:

        if participant != user_id:
            receiver_id = participant
            break

    # -----------------------------------------
    # Create message
    # -----------------------------------------

    now = datetime.now(timezone.utc)

    message = {
        "conversation_id": conversation_id,
        "sender_id": user_id,
        "sender_name": user.get("name", "User"),
        "receiver_id": receiver_id,
        "text": text,
        "created_at": now
    }

    result = db.messages.insert_one(message)

    # -----------------------------------------
    # Update conversation preview
    # -----------------------------------------

    update_data = {
        "$set": {
            "last_message": text,
            "last_message_time": now
        }
    }

    # Increment unread count for receiver
    if receiver_id:

        update_data["$inc"] = {
            f"unread_counts.{receiver_id}": 1
        }

    db.conversations.update_one(
        {
            "_id": conversation_object_id
        },
        update_data
    )

    # -----------------------------------------
    # Prepare response
    # -----------------------------------------

    message["_id"] = str(result.inserted_id)

    message["created_at"] = now.isoformat()

    return jsonify({
        "message": "Message sent successfully!",
        "data": message
    }), 201


# =========================================================
# CREATE OR GET A CONVERSATION
# =========================================================

@messages_bp.route("/conversations", methods=["POST"])
@token_required
def create_conversation():

    from app import db

    current_user_id = request.user["user_id"]

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    other_user_id = data.get("user_id")

    if not other_user_id:
        return jsonify({
            "error": "user_id is required"
        }), 400

    # -----------------------------------------
    # Don't allow conversation with yourself
    # -----------------------------------------

    if str(other_user_id) == str(current_user_id):
        return jsonify({
            "error": "You cannot start a conversation with yourself"
        }), 400

    # -----------------------------------------
    # Validate other user ID
    # -----------------------------------------

    try:
        ObjectId(other_user_id)
    except InvalidId:
        return jsonify({
            "error": "Invalid user ID"
        }), 400

    # -----------------------------------------
    # Check other user exists
    # -----------------------------------------

    other_user = db.users.find_one({
        "_id": ObjectId(other_user_id)
    })

    if not other_user:
        return jsonify({
            "error": "User not found"
        }), 404

    # -----------------------------------------
    # Check if conversation already exists
    # -----------------------------------------

    existing_conversation = db.conversations.find_one({
        "participants": {
            "$all": [
                current_user_id,
                other_user_id
            ]
        }
    })

    if existing_conversation:

        return jsonify({
            "message": "Conversation already exists",
            "conversation": {
                "id": str(existing_conversation["_id"]),
                "participants":
                    existing_conversation.get(
                        "participants", []
                    ),
                "participant_names":
                    existing_conversation.get(
                        "participant_names", []
                    )
            }
        }), 200

    # -----------------------------------------
    # Get current user
    # -----------------------------------------

    current_user = db.users.find_one({
        "_id": ObjectId(current_user_id)
    })

    if not current_user:
        return jsonify({
            "error": "Current user not found"
        }), 404

    # -----------------------------------------
    # Create conversation
    # -----------------------------------------

    conversation = {
        "participants": [
            current_user_id,
            other_user_id
        ],

        "participant_names": [
            current_user.get("name", "User"),
            other_user.get("name", "User")
        ],

        "last_message": "",

        "last_message_time": None,

        "unread_counts": {
            current_user_id: 0,
            other_user_id: 0
        }
    }

    result = db.conversations.insert_one(
        conversation
    )

    return jsonify({
        "message": "Conversation created successfully!",

        "conversation": {
            "id": str(result.inserted_id),

            "participants":
                conversation["participants"],

            "participant_names":
                conversation["participant_names"]
        }
    }), 201