const API_BASE_URL = "http://127.0.0.1:5000";

// Handle the "List Food" form submission
document.getElementById("list-food-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const description = document.getElementById("description").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const location = document.getElementById("location").value.split(",").map(Number);

  const response = await fetch(`${API_BASE_URL}/list-food`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, quantity, location }),
  });

  const result = await response.json();
  document.getElementById("list-food-response").innerText = JSON.stringify(result, null, 2);
});

// Handle the "Find Shelters" form submission
document.getElementById("find-shelters-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  
  const foodId = parseInt(document.getElementById("food-id").value);

  const response = await fetch(`${API_BASE_URL}/find-shelters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ food_id: foodId }),
  });

  const result = await response.json();
  document.getElementById("find-shelters-response").innerText = JSON.stringify(result, null, 2);
});
