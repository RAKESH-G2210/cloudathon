// Mock Database for food listings and shelters
let foodListings = [];
let shelters = [
  { id: 1, name: "Shelter A", location: [40.7128, -74.0060], capacity: 50 },
  { id: 2, name: "Shelter B", location: [40.7306, -73.9352], capacity: 30 },
  { id: 3, name: "Shelter C", location: [40.6782, -73.9442], capacity: 20 },
];

// Function to handle food listing submission
document.getElementById("foodForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const description = document.getElementById("description").value.trim();
  const quantity = Number(document.getElementById("quantity").value.trim());
  const locationInput = document.getElementById("location").value.trim().split(",");
  const location = locationInput.map(Number);

  if (!description || isNaN(quantity) || location.length !== 2 || location.some(isNaN)) {
    alert("Please fill out all fields with valid data.");
    return;
  }

  const foodId = foodListings.length + 1;
  const foodItem = {
    id: foodId,
    description,
    quantity,
    location,
  };

  foodListings.push(foodItem);
  alert(`Food listed successfully! Food ID: ${foodId}`);
  document.getElementById("foodForm").reset();
});

// Function to find shelters based on food ID
document.getElementById("findSheltersButton").addEventListener("click", function () {
  const foodId = Number(document.getElementById("foodId").value.trim());
  if (isNaN(foodId)) {
    alert("Please enter a valid Food ID.");
    return;
  }

  const foodItem = foodListings.find(item => item.id === foodId);
  if (!foodItem) {
    alert("Food item not found.");
    return;
  }

  const foodLocation = foodItem.location;
  const nearbyShelters = shelters
    .map(shelter => {
      const distance = geodesic(foodLocation, shelter.location).kilometers;
      return { ...shelter, distance };
    })
    .filter(shelter => shelter.distance <= 10); // Filter shelters within 10 km

  displayShelters(nearbyShelters);
});

// Function to calculate distance between two points
function geodesic(loc1, loc2) {
  const [lat1, lon1] = loc1;
  const [lat2, lon2] = loc2;
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return { kilometers: distance };
}

// Function to display shelters
function displayShelters(shelters) {
  const shelterList = document.getElementById("shelterList");
  shelterList.innerHTML = "";

  if (shelters.length === 0) {
    shelterList.innerHTML = "<li>No shelters found within 10 km.</li>";
  } else {
    shelters.forEach(shelter => {
      const li = document.createElement("li");
      li.textContent = `${shelter.name} - Capacity: ${shelter.capacity}, ${shelter.distance.toFixed(2)} km away`;
      shelterList.appendChild(li);
    });
  }
}
