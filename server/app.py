from flask_restful import Api, Resource, fields, marshal_with, reqparse
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
from models import UserSchema, ProductSchema, OrderItemSchema, OrderSchema, UserIdSchema


app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SESSION_TYPE"] = "filesystem"  # Use filesystem for session storage
app.config["SECRET_KEY"] = "your_secret_key"  # Change this to a secure key
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"  # Change this to a secure key
jwt = JWTManager(app)
Session(app)
migrate = Migrate(app, db)

db.init_app(app)


api = Api(app)

product_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
    "costofpurchase": fields.Float,
    "price": fields.Float,
    "quantity_in_stock": fields.Integer,
    "user_id": fields.Integer,
}


class CreateProductsResource(Resource):
    @marshal_with(product_fields)
    @cross_origin()
    def post(self):
        try:
            if isinstance(request.json, list):
                products = []
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
                    products.append(new_product)
                db.session.commit()
                return products, 201
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
                return new_product, 201
        except Exception as e:
            return {"error": str(e)}, 400


class UpdateProductResource(Resource):
    @jwt_required()
    @cross_origin()
    def put(self, product_id):
        try:
            product = Product.query.get_or_404(product_id)
            data = request.json
            product.name = data["name"]
            product.description = data["description"]
            product.costofpurchase = data["costofpurchase"]
            product.price = data["price"]
            product.quantity_in_stock = data["quantity_in_stock"]
            db.session.commit()
            product_schema = ProductSchema()
            return product_schema.dump(product), 200
        except Exception as e:
            return {"error": str(e)}, 400


# Resource to get orders for the currently logged-in user
class UserOrdersResource(Resource):
    @jwt_required()  # Requires a valid JWT token
    @cross_origin(origin="*")
    def get(self):
        current_user_id = get_jwt_identity()

        # Fetch orders for the authenticated user
        orders = Order.query.filter_by(user_id=current_user_id).all()

        # Serialize orders using Marshmallow
        orders_schema = OrderSchema(many=True)
        orders_data = orders_schema.dump(orders)

        return jsonify(orders_data), 200


order_parser = reqparse.RequestParser()
order_parser.add_argument("order_data", type=OrderSchema().load)


class CreateOrderResource(Resource):
    def post(self):
        try:
            args = order_parser.parse_args()
            order_data = args["order_data"]

            # Now you can use the validated and parsed data in your API logic
            # Check if the user exists
            user = User.query.get(order_data["user_id"])
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Create the order
            new_order = Order(
                user_id=order_data["user_id"], status=order_data["status"]
            )

            # Create order items
            for item_data in order_data["items"]:
                product_id = item_data.get("product_id")
                quantity = item_data.get("quantity")

                # Check if the product belongs to the user
                product = Product.query.filter_by(
                    id=product_id, user_id=user.id
                ).first()
                if not product:
                    return (
                        jsonify(
                            {
                                "error": "Product not found or does not belong to the user"
                            }
                        ),
                        404,
                    )

                # Calculate total_price
                total_price = product.price * quantity

                # Create the new order item with total_price
                new_item = OrderItem(
                    product_id=product_id,
                    quantity=quantity,
                    total_price=total_price,
                )

                # Add the order item to the order
                new_order.items.append(new_item)

            # Add the order to the database
            db.session.add(new_order)
            db.session.commit()

            return (
                jsonify(
                    {"message": "Order created successfully", "order_id": new_order.id}
                ),
                201,
            )
        except ValidationError as e:
            return jsonify({"error": "Invalid data", "details": e.messages}), 400


class GetUserProductsResource(Resource):
    @jwt_required()  # Requires a valid JWT token
    def get(self):
        current_user_id = get_jwt_identity()

        # Retrieve all products for the authenticated user (current_user)
        products = Product.query.filter_by(user_id=current_user_id).all()

        # Serialize products using Marshmallow
        product_schema = ProductSchema(many=True)
        products_data = product_schema.dump(products)

        return products_data, 200


class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Authenticate the user (you might want to implement your own authentication logic)
        user = User.query.filter_by(username=username, password=password).first()

        if user:
            # Create JWT token and store user ID in the session
            access_token = create_access_token(identity=user.id)
            session["user_id"] = user.id

            # Serialize only the user ID using the custom schema
            user_schema = UserIdSchema()
            user_data = user_schema.dump(user)

            return {"access_token": access_token, "user": user_data["id"]}, 200
        else:
            return {"error": "Invalid credentials"}, 401


class RegisterUserResource(Resource):
    def post(self):
        data = request.get_json()

        # Check if the username and email are unique
        existing_user = User.query.filter(
            (User.username == data["username"]) | (User.email == data["email"])
        ).first()
        if existing_user:
            return {"message": "Username or email already exists"}, 400

        # Create a new user
        new_user = User(
            username=data["username"], email=data["email"], password=data["password"]
        )
        db.session.add(new_user)
        db.session.commit()

        # Serialize user using Marshmallow
        user_schema = UserSchema()
        user_data = user_schema.dump(new_user)

        return {"message": "User registered successfully", "user": user_data}, 201


class UserProfitResource(Resource):
    def get(self, user_id):
        user = User.query.get_or_404(user_id)

        # Calculate total profit using a subquery
        total_profit_subquery = (
            db.session.query(
                func.sum(
                    OrderItem.quantity * (Product.price - Product.costofpurchase)
                ).label("total_profit")
            )
            .select_from(Product)
            .join(OrderItem, Product.id == OrderItem.product_id)
            .join(Order, OrderItem.order_id == Order.id)
            .filter(Product.user_id == user_id)
            .filter(Order.user_id == user_id)
            .group_by(OrderItem.order_id)
            .scalar()
        )

        return {"user_id": user.id, "total_profit": total_profit_subquery}


class MostProfitableProductResource(Resource):
    def get(self, user_id):
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

        return {
            "user_id": user.id,
            "most_profitable_product": {
                "product_id": most_profitable_product[0].id,
                "product_name": most_profitable_product[0].name,
                "profit": most_profitable_product.profit,
            },
        }


class OrderHistoryResource(Resource):
    def get(self, user_id):
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

        return {"user_id": user.id, "order_history": order_history}


class DeleteOrderResource(Resource):
    @jwt_required()
    def delete(self, order_id):
        try:
            # Find the order by ID
            order = Order.query.get(order_id)

            # Check if the order exists
            if not order:
                return jsonify({"message": "Order not found"}), 404

            # Delete related OrderItems
            order_items = OrderItem.query.filter_by(order_id=order.id).all()
            for order_item in order_items:
                db.session.delete(order_item)

            # Delete the order
            db.session.delete(order)
            db.session.commit()

            return (
                jsonify({"message": "Order and related items deleted successfully"}),
                200,
            )
        except Exception as e:
            return jsonify({"message": f"Error deleting order: {str(e)}"}), 500


api.add_resource(DeleteOrderResource, "/api/orders/<int:order_id>")
api.add_resource(UserProfitResource, "/user_profit/<int:user_id>")
api.add_resource(
    MostProfitableProductResource, "/most_profitable_product/<int:user_id>"
)
api.add_resource(OrderHistoryResource, "/order_history/<int:user_id>")
api.add_resource(LoginResource, "/api/login")
api.add_resource(RegisterUserResource, "/api/register")
api.add_resource(CreateOrderResource, "/orders/new")
api.add_resource(GetUserProductsResource, "/api/products")
api.add_resource(UpdateProductResource, "/api/products/update/<int:product_id>")
api.add_resource(UserOrdersResource, "/orders")
api.add_resource(CreateProductsResource, "/api/products/new")

if __name__ == "__main__":
    app.run(debug=True)
