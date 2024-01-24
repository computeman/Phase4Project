from flask import Flask, jsonify, request, make_response
from flask_migrate import Migrate
from models import db, User, Product, Order, OrderItem
from flask_cors import CORS

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)
migrate = Migrate(app, db)

db.init_app(app)


@app.route("/")
def home():
    return "<h1>Phase 2 Project Home Route</h2>"

# The routes....


# Route to get all orders
@app.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    orders_data = [
        {
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "items": [
                {
                    "id": item.id,
                    # Add other order item fields here
                }
                for item in order.items
            ],
        }
        for order in orders
    ]
    return jsonify(orders_data)

# Route to create a new order
@app.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    user_id = data.get("user_id")
    status = data.get("status")
    items = data.get("items")  # Assuming it's a list of items

    if not user_id or not status or not items:
        return jsonify({"error": "Incomplete data"}), 400

    # Check if the user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Create the order
    new_order = Order(user_id=user_id, status=status)

    # Create order items
    for item_data in items:
        new_item = OrderItem(**item_data)
        new_order.items.append(new_item)

    # Add the order to the database
    db.session.add(new_order)
    db.session.commit()

    return jsonify({"message": "Order created successfully", "order_id": new_order.id}), 201
if __name__ == "__main__":
    app.run(port=5555)