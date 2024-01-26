from flask_cors import CORS, cross_origin
from flask import Flask, request, jsonify, session
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.orm import validates
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from flask_session import Session
from models import db, User, Product, Order, OrderItem
from sqlalchemy import func


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_TYPE"] = "filesystem"  # Use filesystem for session storage
app.config["SECRET_KEY"] = "your_secret_key"  # Change this to a secure key
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"  # Change this to a secure key
jwt = JWTManager(app)
Session(app)
migrate = Migrate(app, db)
CORS(app, origins="http://localhost:5000", supports_credentials=True)

db.init_app(app)


@app.route("/api/products", methods=["POST"])
@cross_origin()
def create_products():
    try:
        if isinstance(request.json, list):
            for data in request.json:
                new_product = Product(
                    name=data["name"],
                    description=data["description"],
                    costofpurchase=data["costofpurchase"],
                    price=data["price"],
                    quantity_in_stock=data["quantity_in_stock"],
                    user_id=1,
                )
                db.session.add(new_product)
            db.session.commit()
        else:
            data = request.json
            new_product = Product(
                name=data["name"],
                description=data["description"],
                costofpurchase=data["costofpurchase"],
                price=data["price"],
                quantity_in_stock=data["quantity_in_stock"],
                user_id=1,
            )
            db.session.add(new_product)
            db.session.commit()

        return jsonify({"message": "Products created successfully"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@cross_origin()
@jwt_required()
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        product.name = data["name"]
        product.description = data["description"]
        product.costofpurchase = data["costofpurchase"]
        product.price = data["price"]
        product.quantity_in_stock = data["quantity_in_stock"]
        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/profits", methods=["GET"])
def get_profits():
    profits_data = calculate_profits()
    return jsonify({"profits": profits_data})


@app.route("/api/contribution-analysis", methods=["GET"])
def get_contribution_analysis():
    contribution_data = calculate_contribution_analysis()
    return jsonify({"contributionAnalysis": contribution_data})


def calculate_profits():
    total_profits = (
        Product.query.join(OrderItem)
        .filter(Order.status == "completed")
        .with_entities(Product.price)
        .scalar()
    )
    return total_profits


def calculate_contribution_analysis():
    contribution_data = (
        Product.query.join(OrderItem)
        .filter(Order.status == "completed")
        .with_entities(Product.name, Product.quantity_in_stock)
        .all()
    )
    return contribution_data


# Route to get orders for the currently logged-in user
@app.route("/orders", methods=["GET"])
@cross_origin()
@jwt_required()  # Requires a valid JWT token
def get_user_orders():
    current_user_id = get_jwt_identity()

    # Fetch orders for the authenticated user
    orders = Order.query.filter_by(user_id=current_user_id).all()

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

    return jsonify(orders_data), 200


@app.route("/orders", methods=["POST"])
@jwt_required()  # Requires a valid JWT token
@cross_origin()
def create_order_items():
    current_user_id = get_jwt_identity()

    data = request.get_json()

    user_id = data.get("user_id")
    status = data.get("status")
    items = data.get("items")  # List of items with product_id and quantity

    if not user_id or not status or not items:
        return jsonify({"error": "Incomplete data"}), 400

    # Check if the user making the request is the same as the one specified in the data
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # Check if the user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Find the highest existing order ID
    max_order_id = db.session.query(func.max(Order.id)).scalar()

    # Increment the order ID
    new_order_id = max_order_id + 1 if max_order_id is not None else 1

    # Create the order
    new_order = Order(id=new_order_id, user_id=user_id, status=status)

    for item_data in items:
        product_id = item_data.get("product_id")
        quantity = item_data.get("quantity")

        # Check if the product belongs to the user
        product = Product.query.filter_by(id=product_id, user_id=user_id).first()
        if not product:
            return (
                jsonify({"error": "Product not found or does not belong to the user"}),
                404,
            )

        # Calculate total_price
        total_price = product.price * quantity

        # Create the new order item with total_price
        new_order_item = OrderItem(
            order_id=new_order_id,  # Use order ID instead of user ID
            product_id=product_id,
            quantity=quantity,
            total_price=total_price,
        )

        # Add the order item to the order
        new_order.items.append(new_order_item)

    # Calculate the total order price
    new_order.total_price = sum(item.total_price for item in new_order.items)

    # Add the order to the database
    db.session.add(new_order)
    db.session.commit()

    return (
        jsonify({"message": "Order created successfully", "order_id": new_order.id}),
        201,
    )


@app.route("/api/products", methods=["GET"])
@jwt_required()  # Requires a valid JWT token
@cross_origin()
def get_user_products():
    current_user_id = get_jwt_identity()

    # Retrieve all products for the authenticated user (current_user)
    products = Product.query.filter_by(user_id=current_user_id).all()

    products_data = [
        {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": product.price,
            "quantity_in_stock": product.quantity_in_stock,
            "user_id": product.user_id,
        }
        for product in products
    ]

    return jsonify({"products": products_data}), 200


# Route to authenticate and get JWT token
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Authenticate the user (you might want to implement your own authentication logic)
    user = User.query.filter_by(username=username, password=password).first()

    if user:
        # Create JWT token and store user ID in the session
        access_token = create_access_token(identity=user.id)
        session["user_id"] = user.id
        return jsonify(access_token=access_token, user_id=user.id), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


@app.route("/api/register", methods=["POST"])
def register_user():
    if request.method == "POST":
        data = request.get_json()

        # Check if the username and email are unique
        existing_user = User.query.filter(
            (User.username == data["username"]) | (User.email == data["email"])
        ).first()
        if existing_user:
            return jsonify({"message": "Username or email already exists"}), 400

        # Create a new user
        new_user = User(
            username=data["username"], email=data["email"], password=data["password"]
        )
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "User registered successfully"}), 201


# Route 1: Calculate Total Profit for a User
@app.route("/user_profit/<int:user_id>", methods=["GET"])
def user_profit(user_id):
    user = User.query.get_or_404(user_id)
    total_profit = (
        db.session.query(
            func.sum(Product.price - Product.costofpurchase).label("total_profit")
        )
        .filter(Product.user_id == user_id)
        .scalar()
    )
    return jsonify({"user_id": user.id, "total_profit": total_profit})


# Route 2: Get the Most Profitable Product for a User
@app.route("/most_profitable_product/<int:user_id>", methods=["GET"])
def most_profitable_product(user_id):
    user = User.query.get_or_404(user_id)
    most_profitable_product = (
        db.session.query(
            Product,
            func.sum(
                OrderItem.quantity * (Product.price - Product.costofpurchase)
            ).label("profit"),
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, Order.id == OrderItem.order_id)
        .filter(Order.user_id == user_id)
        .group_by(Product.id)
        .order_by(
            func.sum(
                OrderItem.quantity * (Product.price - Product.costofpurchase)
            ).desc()
        )
        .first()
    )

    return jsonify(
        {
            "user_id": user.id,
            "most_profitable_product": {
                "product_id": most_profitable_product[0].id,
                "product_name": most_profitable_product[0].name,
                "profit": most_profitable_product.profit,
            },
        }
    )


# Route 3: Get Order History for a User
@app.route("/order_history/<int:user_id>", methods=["GET"])
def order_history(user_id):
    user = User.query.get_or_404(user_id)
    orders = Order.query.filter_by(user_id=user_id).all()

    order_history = []
    for order in orders:
        order_details = {"order_id": order.id, "status": order.status, "items": []}

        for item in order.items:
            product = item.product
            order_details["items"].append(
                {
                    "product_id": product.id,
                    "product_name": product.name,
                    "quantity": item.quantity,
                    "total_price": item.total_price,
                }
            )

        order_history.append(order_details)

    return jsonify({"user_id": user.id, "order_history": order_history})


if __name__ == "__main__":
    app.run(debug=True)
