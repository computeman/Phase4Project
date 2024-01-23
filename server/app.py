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
