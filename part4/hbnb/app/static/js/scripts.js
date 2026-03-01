// ---------- Fake data for UI (until you wire real API) ----------
const PLACES = [
  { id: 1, name: "Beautiful Beach House", price: 150, host: "Alice", description: "Sunny place near the sea.", amenities: ["WiFi", "Kitchen", "Pool"] },
  { id: 2, name: "Cozy Cabin", price: 100, host: "Bob", description: "Warm cabin in the woods.", amenities: ["Fireplace", "Parking", "WiFi"] },
  { id: 3, name: "Modern Apartment", price: 200, host: "Carol", description: "Downtown, modern and clean.", amenities: ["WiFi", "Elevator", "Gym"] }
];

const REVIEWS = {
  1: [
    { user: "John", comment: "Amazing view!", rating: 5 },
    { user: "Sara", comment: "Very clean and comfy.", rating: 4 }
  ],
  2: [
    { user: "Mike", comment: "Super quiet place.", rating: 5 }
  ],
  3: []
};

// ---------- Cookies ----------
function setCookie(name, value, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function isLoggedIn() {
  return Boolean(getCookie("token"));
}

// ---------- API ----------
async function loginUser(email, password) {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  let data = {};
  try {
    data = await response.json();
  } catch (_) {
    // API might not return JSON; ignore
  }

  if (!response.ok) {
    const msg = data?.message || data?.error || response.statusText || "Login failed";
    throw new Error(msg);
  }

  const token = data.access_token || data.token;
  if (!token) throw new Error("Token not found in response");
  return token;
}

// ---------- INDEX PAGE ----------
function initIndexPage() {
  const placesList = document.getElementById("places-list");
  const priceFilter = document.getElementById("price-filter");
  if (!placesList || !priceFilter) return;

  function renderPlaces(maxPrice = "all") {
    placesList.innerHTML = "";

    const filtered = PLACES.filter((p) => maxPrice === "all" || p.price <= Number(maxPrice));

    filtered.forEach((place) => {
      const card = document.createElement("article");
      card.className = "place-card";

      card.innerHTML = `
        <h2>${place.name}</h2>
        <p>Price per night: $${place.price}</p>
        <a class="details-button" href="/place/${place.id}">View Details</a>
      `;

      placesList.appendChild(card);
    });
  }

  priceFilter.addEventListener("change", (e) => renderPlaces(e.target.value));
  renderPlaces(priceFilter.value);
}

// ---------- PLACE DETAILS PAGE ----------
function initPlacePage() {
  const detailsEl = document.getElementById("place-details");
  const reviewsEl = document.getElementById("reviews");
  const addReviewCta = document.getElementById("add-review-cta");
  if (!detailsEl || !reviewsEl) return;

  const placeId = detailsEl.dataset.placeId;
  const idNum = Number(placeId);

  const place = PLACES.find((p) => p.id === idNum);

  if (!place) {
    detailsEl.innerHTML = "<p>Place not found.</p>";
    return;
  }

  detailsEl.innerHTML = `
    <h1>${place.name}</h1>
    <div class="place-info">
      <p><strong>Host:</strong> ${place.host}</p>
      <p><strong>Price per night:</strong> $${place.price}</p>
      <p><strong>Description:</strong> ${place.description}</p>
      <p><strong>Amenities:</strong> ${place.amenities.join(", ")}</p>
    </div>
  `;

  const list = REVIEWS[idNum] || [];
  reviewsEl.innerHTML = "";

  if (list.length === 0) {
    reviewsEl.innerHTML = `<p class="muted">No reviews yet.</p>`;
  } else {
    list.forEach((r) => {
      const card = document.createElement("article");
      card.className = "review-card";
      card.innerHTML = `
        <p>${r.comment}</p>
        <p class="muted">— ${r.user}</p>
        <p class="rating">Rating: ${r.rating}/5</p>
      `;
      reviewsEl.appendChild(card);
    });
  }

  // CTA behavior
  if (addReviewCta) {
    if (isLoggedIn()) {
      addReviewCta.style.display = "inline-block";
      addReviewCta.href = `/place/${idNum}/review`; // matches your Flask route
    } else {
      addReviewCta.style.display = "none";
    }
  }
}

// ---------- LOGIN PAGE (TASK REQUIREMENT) ----------
function initLoginPage() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault(); // REQUIRED
    if (errorEl) errorEl.textContent = "";

    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      if (errorEl) errorEl.textContent = "Email and password are required.";
      return;
    }

    try {
      const token = await loginUser(email, password);

      // Store JWT token in cookie (REQUIRED)
      setCookie("token", token, 1);

      // Redirect to main page after login (REQUIRED)
      window.location.href = "/";
    } catch (err) {
      // Display error message (REQUIRED)
      const msg = err?.message || "Login failed";
      if (errorEl) errorEl.textContent = `Login failed: ${msg}`;
      else alert(`Login failed: ${msg}`);
    }
  });
}

// ---------- ADD REVIEW PAGE ----------
function initAddReviewPage() {
  const form = document.getElementById("review-form");
  const errorEl = document.getElementById("review-error");
  if (!form) return;

  if (!isLoggedIn()) {
    window.location.href = "/login";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = "";

    const placeId = form.dataset.placeId;
    const comment = document.getElementById("review")?.value?.trim();
    const rating = document.getElementById("rating")?.value;

    if (!comment || !rating) {
      if (errorEl) errorEl.textContent = "Review and rating are required.";
      return;
    }

    alert("Review submitted (UI only). Next: POST to /api/v1/reviews/ with token.");
    window.location.href = `/place/${placeId}`;
  });
}

// ---------- Boot (single) ----------
document.addEventListener("DOMContentLoaded", () => {
  initIndexPage();
  initPlacePage();
  initLoginPage();
  initAddReviewPage();
});