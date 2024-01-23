from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy.orm import validates
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import db, User, Product, Order, OrderItem

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
migrate = Migrate(app, db)

db.init_app(app)

@app.route('/api/products', methods=['POST'])
def create_products():
    try:
        if isinstance(request.json, list):
            for data in request.json:
                new_product = Product(
                    name=data['name'],
                    description=data['description'],
                    price=data['price'],
                    quantity_in_stock=data['quantity_in_stock'],
                    user_id=1
                )
                db.session.add(new_product)
            db.session.commit()
        else:
            data = request.json
            new_product = Product(
                name=data['name'],
                description=data['description'],
                price=data['price'],
                quantity_in_stock=data['quantity_in_stock'],
                user_id=1
            )
            db.session.add(new_product)
            db.session.commit()

        return jsonify({'message': 'Products created successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    try:
        product = Product.query.get_or_404(product_id)
        data = request.json
        product.name = data['name']
        product.description = data['description']
        product.price = data['price']
        product.quantity_in_stock = data['quantity_in_stock']
        db.session.commit()
        return jsonify({'message': 'Product updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
