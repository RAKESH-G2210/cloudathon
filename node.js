// API Endpoints
const API_BASE = "http://127.0.0.1:5000";

// Function to list surplus food
document.getElementById("foodForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const description = document.getElementById("description").value;
  const quantity = document.getElementById("quantity").value;
  const location = document.getElementById("location").value;

  try {
    const response = await fetch(`${API_BASE}/list-food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        quantity,
        location: location.split(",").map(Number),
      }),
    });

    const data = await response.json();
    if (response.status === 201) {
      alert(`Food listed successfully! Food ID: ${data.food_id}`);
      document.getElementById("foodForm").reset();
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (error) {
    console.error("Error listing food:", error);
    alert("Failed to list food. Please try again.");
  }
});

// Function to find nearby shelters
document.getElementById("findSheltersButton").addEventListener("click", async () => {
  const foodId = document.getElementById("foodId").value;
  if (!foodId) {
    alert("Please enter a Food ID.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/find-shelters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food_id: Number(foodId) }),
    });

    const data = await response.json();
    const shelterList = document.getElementById("shelterList");
    shelterList.innerHTML = "";

    if (response.status === 200 && data.matches.length > 0) {
      data.matches.forEach((shelter) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${shelter.name} - ${shelter.distance_km} km away, Capacity: ${shelter.capacity}`;
        shelterList.appendChild(listItem);
      });
    } else {
      shelterList.innerHTML = "<li>No shelters found within 10 km.</li>";
    }
  } catch (error) {
    console.error("Error finding shelters:", error);
    alert("Failed to find shelters. Please try again.");
  }
});
