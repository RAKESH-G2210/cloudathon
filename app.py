from flask import Flask, request, jsonify
from geopy.distance import geodesic
from pymongo import MongoClient
from bson.objectid import ObjectId  # Import ObjectId for MongoDB IDs

app = Flask(__name__)

# Connect to MongoDB Atlas
client = MongoClient("your-mongodb-connection-string")  # Replace with your MongoDB URI
db = client.food_donation  # Database name: food_donation

@app.route("/list-food", methods=["POST"])
def list_food():
    data = request.json
    if not all(k in data for k in ("description", "quantity", "location")):
        return jsonify({"error": "Missing required fields"}), 400

    food_item = {
        "description": data["description"],
        "quantity": data["quantity"],
        "location": data["location"]  # Expecting [latitude, longitude] as a list
    }
    result = db.food_listings.insert_one(food_item)  # Insert into the MongoDB collection
    return jsonify({"message": "Food listed successfully", "food_id": str(result.inserted_id)}), 201

@app.route("/find-shelters", methods=["POST"])
def find_shelters():
    data = request.json
    if "food_id" not in data:
        return jsonify({"error": "Missing food_id"}), 400

    try:
        # Find the food item by ObjectId
        food_item = db.food_listings.find_one({"_id": ObjectId(data["food_id"])})
    except Exception as e:
        return jsonify({"error": "Invalid food_id"}), 400

    if not food_item:
        return jsonify({"error": "Food item not found"}), 404

    food_location = food_item["location"]  # Extract location from the found food item
    matches = []
    shelters = db.shelters.find()  # Query all shelters from the shelters collection
    for shelter in shelters:
        distance = geodesic(tuple(food_location), tuple(shelter["location"])).kilometers
        if distance <= 10:  # 10 km radius
            matches.append({
                "shelter_id": str(shelter["_id"]),
                "name": shelter["name"],
                "distance_km": round(distance, 2),
                "capacity": shelter["capacity"]
            })

    return jsonify({"matches": matches}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
