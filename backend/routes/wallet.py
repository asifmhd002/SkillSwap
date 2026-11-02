from flask import Blueprint, jsonify, request
from utils.auth import token_required
from datetime import datetime, timezone

wallet_bp = Blueprint("wallet", __name__)


@wallet_bp.route("", methods=["GET"])
@token_required
def get_wallet():
    from app import db

    user_id = request.user["user_id"]

    wallet = db.wallets.find_one({
        "user_id": user_id
    })

    # Create a wallet automatically if the user does not have one yet
    if not wallet:
        wallet = {
            "user_id": user_id,
            "balance": 0,
            "total_earned": 0,
            "total_spent": 0,
            "pending": 0,
            "created_at": datetime.now(timezone.utc)
        }

        db.wallets.insert_one(wallet)

    return jsonify({
        "wallet": {
            "balance": wallet.get("balance", 0),
            "total_earned": wallet.get("total_earned", 0),
            "total_spent": wallet.get("total_spent", 0),
            "pending": wallet.get("pending", 0)
        }
    }), 200


@wallet_bp.route("/transactions", methods=["GET"])
@token_required
def get_transactions():
    from app import db

    user_id = request.user["user_id"]

    transactions = list(
        db.transactions.find({
            "user_id": user_id
        }).sort("created_at", -1)
    )

    result = []

    for transaction in transactions:
        transaction["_id"] = str(transaction["_id"])

        if isinstance(transaction.get("created_at"), datetime):
            transaction["created_at"] = (
                transaction["created_at"]
                .astimezone(timezone.utc)
                .isoformat()
            )

        result.append(transaction)

    return jsonify({
        "transactions": result
    }), 200