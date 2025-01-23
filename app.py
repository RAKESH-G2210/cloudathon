from flask import Flask, request, jsonify
from geopy.distance import geodesic
from pymongo import MongoClient
from bson.objectid import ObjectId  # Import ObjectId for MongoDB IDs
from bson.errors import InvalidId
import logging

# Initialize Flask app and configure logging
app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)

# Connect to MongoDB Atlas
client = MongoClient("your-mongodb-connection-string")  # Replace with your MongoDB URI
db = client.food_donation  # Database name: food_donation

@app.route("/list-food", methods=["POST"])
def list_food():
    try:
        data = request.json
        if not all(k in data for k in ("description", "quantity", "location")):
            return jsonify({"error": "Missing required fields"}), 400

        if not isinstance(data["location"], list) or len(data["location"]) != 2:
            return jsonify({"error": "Invalid location format. Expecting [latitude, longitude]"}), 400

        food_item = {
            "description": data["description"],
            "quantity": data["quantity"],
            "location": data["location"]  # Expecting [latitude, longitude] as a list
        }
        result = db.food_listings.insert_one(food_item)  # Insert into the MongoDB collection
        return jsonify({"message": "Food listed successfully", "food_id": str(result.inserted_id)}), 201

    except Exception as e:
        logging.error(f"Error in /list-food: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route("/find-shelters", methods=["POST"])
def find_shelters():
    try:
        data = request.json
        if "food_id" not in data:
            return jsonify({"error": "Missing food_id"}), 400

        try:
            food_id = ObjectId(data["food_id"])
        except InvalidId:
            return jsonify({"error": "Invalid food_id format"}), 400

        food_item = db.food_listings.find_one({"_id": food_id})
        if not food_item:
            return jsonify({"error": "Food item not found"}), 404

        food_location = food_item.get("location")
        if not food_location or not isinstance(food_location, list) or len(food_location) != 2:
            return jsonify({"error": "Invalid food item location"}), 500

        matches = []
        shelters = db.shelters.find()  # Query all shelters from the shelters collection
        for shelter in shelters:
            if not isinstance(shelter["location"], list) or len(shelter["location"]) != 2:
                continue
            distance = geodesic(tuple(food_location), tuple(shelter["location"])).kilometers
            if distance <= 10:  # 10 km radius
                matches.append({
                    "shelter_id": str(shelter["_id"]),
                    "name": shelter["name"],
                    "distance_km": round(distance, 2),
                    "capacity": shelter["capacity"]
                })

        return jsonify({"matches": matches}), 200

    except Exception as e:
        logging.error(f"Error in /find-shelters: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route("/test-db", methods=["GET"])
def test_db():
    try:
        client.admin.command('ping')
        return jsonify({"message": "MongoDB connected successfully"}), 200
    except Exception as e:
        logging.error(f"Database connection error: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
