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

// ---------- Helpers ----------
function isLoggedIn() {
  return Boolean(localStorage.getItem("access_token"));
}

function getCurrentPath() {
  return window.location.pathname;
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

      const title = document.createElement("h2");
      title.textContent = place.name;

      const price = document.createElement("p");
      price.textContent = `Price per night: $${place.price}`;

      const btn = document.createElement("a");
      btn.className = "details-button";
      btn.textContent = "View Details";
      btn.href = `/place/${place.id}`; // IMPORTANT: your web route is /place/<place_id>

      card.appendChild(title);
      card.appendChild(price);
      card.appendChild(btn);

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

  const placeId = detailsEl.dataset.placeId || null;
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

  // Only show "Add Review" button if user is logged in
  if (addReviewCta) {
    addReviewCta.style.display = isLoggedIn() ? "block" : "none";
  }
}

// ---------- LOGIN PAGE ----------
function initLoginPage() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.textContent = "";

    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      if (errorEl) errorEl.textContent = "Email and password are required.";
      return;
    }

    // If you have a real API, uncomment this fetch and adjust to your backend response.
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (errorEl) errorEl.textContent = data.message || "Login failed.";
        return;
      }

      const data = await res.json();
      // common names: access_token / token
      const token = data.access_token || data.token;
      if (!token) {
        if (errorEl) errorEl.textContent = "Login succeeded but token missing.";
        return;
      }

      localStorage.setItem("access_token", token);
      window.location.href = "/";
    } catch (err) {
      if (errorEl) errorEl.textContent = "Network error. Try again.";
    }
  });
}

// ---------- ADD REVIEW PAGE ----------
function initAddReviewPage() {
  const form = document.getElementById("review-form");
  const errorEl = document.getElementById("review-error");
  if (!form) return;

  // Must be authenticated
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

    // UI-only success (you can wire to API later)
    alert("Review submitted (UI only). Now wire this to your /api/v1/reviews endpoint.");
    window.location.href = `/place/${placeId}`;
  });
}

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", () => {
  initIndexPage();
  initPlacePage();
  initLoginPage();
  initAddReviewPage();
});