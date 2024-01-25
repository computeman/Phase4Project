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

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_TYPE"] = "filesystem"  # Use filesystem for session storage
app.config["SECRET_KEY"] = "your_secret_key"  # Change this to a secure key
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"  # Change this to a secure key
jwt = JWTManager(app)
Session(app)
migrate = Migrate(app, db)
CORS(app)
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
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        product.name = data["name"]
        product.description = data["description"]
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
        product_id = item_data.get("product_id")
        quantity = item_data.get("quantity")

        # Retrieve the product
        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": f"Product with id {product_id} not found"}), 404

        # Calculate total_price
        total_price = product.price * quantity

        # Create the new item with total_price
        new_item = OrderItem(
            product_id=product_id, quantity=quantity, total_price=total_price
        )

        new_order.items.append(new_item)

    # Calculate the total order price
    new_order.total_price = sum(item.total_price for item in new_order.items)

    # Add the order to the database
    db.session.add(new_order)
    db.session.commit()

    return (
        jsonify({"message": "Order created successfully", "order_id": new_order.id}),
        201,
    )


# Route to get all products
@app.route("/api/products", methods=["GET"])
@cross_origin()
def get_all_products():
    products = Product.query.all()

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

    return jsonify(products_data)


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
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


from flask_login import current_user


@app.route("/api/products/user", methods=["GET"])
@jwt_required()
def get_user_products():
    # Retrieve all products for the authenticated user (current_user)
    products = Product.query.filter_by(user_id=current_user.id).all()

    # Convert products to a JSON response
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


# Route to get products per order for the authenticated user
@app.route("/api/products/order", methods=["GET"])
@jwt_required()  # Requires a valid JWT token
def get_user_order_products():
    current_user_id = get_jwt_identity()

    # Fetch orders for the authenticated user
    orders = Order.query.filter_by(user_id=current_user_id).all()

    products_data = []

    for order in orders:
        for item in order.items:
            product_data = {
                "id": item.product.id,
                "name": item.product.name,
                "description": item.product.description,
                "price": item.product.price,
                "quantity_in_stock": item.product.quantity_in_stock,
                "user_id": item.product.user_id,
            }
            products_data.append(product_data)

    return jsonify(products_data), 200


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


if __name__ == "__main__":
    app.run(debug=True)
