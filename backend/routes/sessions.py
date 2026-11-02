from flask import Blueprint, jsonify, request
from utils.auth import token_required
from bson import ObjectId
from bson.errors import InvalidId
from datetime import datetime, timezone

sessions_bp = Blueprint("sessions", __name__)


# =========================================================
# GET ALL SESSIONS FOR CURRENT USER
# =========================================================

@sessions_bp.route("", methods=["GET"])
@token_required
def get_sessions():

    from app import db

    user_id = request.user["user_id"]

    sessions = list(
        db.sessions.find({
            "$or": [
                {"teacher_id": user_id},
                {"learner_id": user_id}
            ]
        }).sort("date", 1)
    )

    result = []

    for session in sessions:

        session["_id"] = str(session["_id"])

        result.append(session)

    return jsonify({
        "sessions": result
    }), 200


# =========================================================
# GET ONE SESSION
# =========================================================

@sessions_bp.route("/<session_id>", methods=["GET"])
@token_required
def get_session(session_id):

    from app import db

    user_id = request.user["user_id"]

    try:
        object_id = ObjectId(session_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid session ID"
        }), 400

    session = db.sessions.find_one({
        "_id": object_id
    })

    if not session:
        return jsonify({
            "error": "Session not found"
        }), 404

    # Security check
    if (
        session.get("teacher_id") != user_id
        and session.get("learner_id") != user_id
    ):
        return jsonify({
            "error": "You are not part of this session"
        }), 403

    session["_id"] = str(session["_id"])

    return jsonify({
        "session": session
    }), 200


# =========================================================
# CREATE SESSION
# =========================================================

@sessions_bp.route("", methods=["POST"])
@token_required
def create_session():

    from app import db

    user_id = request.user["user_id"]
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    teacher_id = data.get("teacher_id")
    learner_id = data.get("learner_id")
    skill = data.get("skill")
    date = data.get("date")
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    # Every session costs exactly 1 credit
    credits = 1

    if not teacher_id:
        return jsonify({
            "error": "teacher_id is required"
        }), 400

    if not learner_id:
        return jsonify({
            "error": "learner_id is required"
        }), 400

    if not skill:
        return jsonify({
            "error": "skill is required"
        }), 400

    if not date:
        return jsonify({
            "error": "date is required"
        }), 400

    if not start_time:
        return jsonify({
            "error": "start_time is required"
        }), 400

    if not end_time:
        return jsonify({
            "error": "end_time is required"
        }), 400

    # User creating the session must be either teacher or learner
    if user_id not in [teacher_id, learner_id]:
        return jsonify({
            "error": "You must be part of the session"
        }), 403

    # Validate ObjectIds
    try:
        teacher_object_id = ObjectId(teacher_id)
        learner_object_id = ObjectId(learner_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid teacher or learner ID"
        }), 400

    # Check teacher
    teacher = db.users.find_one({
        "_id": teacher_object_id
    })

    if not teacher:
        return jsonify({
            "error": "Teacher not found"
        }), 404

    # Check learner
    learner = db.users.find_one({
        "_id": learner_object_id
    })

    if not learner:
        return jsonify({
            "error": "Learner not found"
        }), 404

    # Get learner wallet
    learner_wallet = db.wallets.find_one({
        "user_id": learner_id
    })

    if not learner_wallet:
        return jsonify({
            "error": "Learner wallet not found"
        }), 404

    # Check available credits
    current_balance = learner_wallet.get("balance", 0)

    if current_balance < credits:
        return jsonify({
            "error": "Insufficient credits",
            "balance": current_balance,
            "required": credits
        }), 400

    # Reserve the credit
    db.wallets.update_one(
        {
            "user_id": learner_id,
            "balance": {"$gte": credits}
        },
        {
            "$inc": {
                "balance": -credits,
                "pending": credits
            }
        }
    )

    # Create session
    session = {
        "teacher_id": teacher_id,
        "teacher_name": teacher.get("name", "User"),

        "learner_id": learner_id,
        "learner_name": learner.get("name", "User"),

        "skill": skill,

        "date": date,
        "start_time": start_time,
        "end_time": end_time,

        "credits": credits,

        "status": "pending",

        "created_at": datetime.now(timezone.utc)
    }

    result = db.sessions.insert_one(session)

    # Record pending transaction
    transaction = {
        "user_id": learner_id,
        "session_id": str(result.inserted_id),
        "title": f"{skill} Session",
        "description": "Credit reserved for learning session",
        "amount": -credits,
        "type": "spent",
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }

    db.transactions.insert_one(transaction)

    return jsonify({
        "message": "Session created successfully!",
        "session": {
            "id": str(result.inserted_id),
            "teacher_id": teacher_id,
            "teacher_name": teacher.get("name", "User"),
            "learner_id": learner_id,
            "learner_name": learner.get("name", "User"),
            "skill": skill,
            "date": date,
            "start_time": start_time,
            "end_time": end_time,
            "credits": credits,
            "status": "pending"
        }
    }), 201


# =========================================================
# UPDATE SESSION STATUS
# =========================================================

@sessions_bp.route("/<session_id>", methods=["PUT"])
@token_required
def update_session(session_id):

    from app import db

    user_id = request.user["user_id"]

    try:
        object_id = ObjectId(session_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid session ID"
        }), 400

    session = db.sessions.find_one({
        "_id": object_id
    })

    if not session:
        return jsonify({
            "error": "Session not found"
        }), 404

    # -----------------------------------------
    # Security
    # -----------------------------------------

    if (
        session.get("teacher_id") != user_id
        and session.get("learner_id") != user_id
    ):
        return jsonify({
            "error": "You are not part of this session"
        }), 403

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    status = data.get("status")

    allowed_statuses = [
        "pending",
        "upcoming",
        "completed",
        "cancelled"
    ]

    if status not in allowed_statuses:
        return jsonify({
            "error": "Invalid session status"
        }), 400

    # -----------------------------------------
    # CANCEL SESSION + REFUND CREDIT
    # -----------------------------------------

    if status == "cancelled":

        # If already cancelled, do nothing.
        # This prevents multiple refunds.
        if session.get("status") == "cancelled":
            return jsonify({
                "message": "Session is already cancelled",
                "status": "cancelled"
            }), 200

        learner_id = session.get("learner_id")
        credits = session.get("credits", 1)

        # Return reserved credit to learner
        db.wallets.update_one(
            {
                "user_id": learner_id
            },
            {
                "$inc": {
                    "balance": credits,
                    "pending": -credits
                }
            }
        )

        # Update the original pending transaction
        db.transactions.update_one(
            {
                "session_id": str(object_id),
                "user_id": learner_id,
                "status": "pending"
            },
            {
                "$set": {
                    "status": "refunded",
                    "description": "Credit returned because session was cancelled",
                    "amount": credits,
                    "type": "refund",
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )

        # Mark session as cancelled
        db.sessions.update_one(
            {
                "_id": object_id
            },
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_at": datetime.now(timezone.utc),
                    "cancelled_by": user_id
                }
            }
        )

        return jsonify({
            "message": "Session cancelled and credit refunded successfully!",
            "status": "cancelled",
            "refunded_credits": credits
        }), 200

    # -----------------------------------------
    # NORMAL STATUS UPDATE
    # -----------------------------------------

    db.sessions.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "status": status
            }
        }
    )

    return jsonify({
        "message": "Session updated successfully!",
        "status": status
    }), 200


# =========================================================
# DELETE / CANCEL SESSION
# =========================================================

@sessions_bp.route("/<session_id>", methods=["DELETE"])
@token_required
def delete_session(session_id):

    from app import db

    user_id = request.user["user_id"]

    try:
        object_id = ObjectId(session_id)

    except InvalidId:
        return jsonify({
            "error": "Invalid session ID"
        }), 400

    session = db.sessions.find_one({
        "_id": object_id
    })

    if not session:
        return jsonify({
            "error": "Session not found"
        }), 404

    # -----------------------------------------
    # Security
    # -----------------------------------------

    if (
        session.get("teacher_id") != user_id
        and session.get("learner_id") != user_id
    ):
        return jsonify({
            "error": "You are not part of this session"
        }), 403

    # -----------------------------------------
    # Already cancelled
    # -----------------------------------------

    if session.get("status") == "cancelled":
        return jsonify({
            "message": "Session is already cancelled",
            "status": "cancelled"
        }), 200

    # -----------------------------------------
    # Refund learner
    # -----------------------------------------

    learner_id = session.get("learner_id")
    credits = session.get("credits", 1)

    db.wallets.update_one(
        {
            "user_id": learner_id
        },
        {
            "$inc": {
                "balance": credits,
                "pending": -credits
            }
        }
    )

    # -----------------------------------------
    # Update transaction
    # -----------------------------------------

    db.transactions.update_one(
        {
            "session_id": str(object_id),
            "user_id": learner_id,
            "status": "pending"
        },
        {
            "$set": {
                "status": "refunded",
                "description": "Credit returned because session was cancelled",
                "amount": credits,
                "type": "refund",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    # -----------------------------------------
    # Cancel session
    # -----------------------------------------

    db.sessions.update_one(
        {
            "_id": object_id
        },
        {
            "$set": {
                "status": "cancelled",
                "cancelled_at": datetime.now(timezone.utc),
                "cancelled_by": user_id
            }
        }
    )

    return jsonify({
        "message": "Session cancelled and credit refunded successfully!",
        "status": "cancelled",
        "refunded_credits": credits
    }), 200