from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import (
    db,
    User,
    Product,
    Order,
    OrderItem,
)  # Replace 'your_flask_app' with your actual Flask app instance

# Set up the database connection
engine = create_engine("sqlite:///instance/app.db")
Session = sessionmaker(bind=engine)
session = Session()

try:
    # Define the data
    users_data = [
        {
            "username": f"user{i}",
            "email": f"user{i}@example.com",
            "password": f"hashed_password{i}",
        }
        for i in range(1, 11)
    ]

    products_data = [
        {
            "name": f"Product {i}",
            "description": f"Description {i}",
            "price": 19.99 + i,
            "quantity_in_stock": 50 + i,
        }
        for i in range(1, 11)
    ]

    orders_data = [
        {"user_id": i, "status": "pending" if i % 2 == 0 else "shipped"}
        for i in range(1, 11)
    ]

    order_items_data = [
        {"order_id": i, "product_id": i, "quantity": i, "total_price": (19.99 + i) * i}
        for i in range(1, 11)
    ]

    # Add data to the database
    # Add users to the database
    users = [User(**data) for data in users_data]
    session.add_all(users)
    session.commit()
    print("Users added successfully!")

    # Add products to the database
    products = [
        Product(**data, user_id=i % 5 + 1)
        for i, data in enumerate(products_data, start=1)
    ]
    session.add_all(products)
    session.commit()
    print("Products added successfully!")

    # Add orders to the database
    orders = [Order(**data) for data in orders_data]
    session.add_all(orders)
    session.commit()
    print("Orders added successfully!")

    # Add order items to the database
    order_items = [OrderItem(**data) for data in order_items_data]
    session.add_all(order_items)
    session.commit()
    print("OrderItems added successfully!")

except Exception as e:
    # Handle any errors that occur during commit
    print(f"Error: {e}")
    session.rollback()

finally:
    session.close()
