// ---------- Fake data for UI fallback (if API not ready) ----------
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

// ---------- UI auth (show/hide login link) ----------
function getLoginLinkEl() {
  // Your HTML uses class="login-button"; task examples sometimes use id="login-link"
  return document.getElementById("login-link") || document.querySelector(".login-button");
}

function checkAuthentication() {
  const token = getCookie("token");
  const loginLink = getLoginLinkEl();

  if (loginLink) {
    loginLink.style.display = token ? "none" : "inline-block";
  }

  return token;
}

// ---------- API ----------
async function loginUser(email, password) {
  const response = await fetch("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  let data = {};
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    const msg = data?.message || data?.error || response.statusText || "Login failed";
    throw new Error(msg);
  }

  const token = data.access_token || data.token;
  if (!token) throw new Error("Token not found in response");
  return token;
}

async function fetchPlaces(token) {
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${decodeURIComponent(token)}`;
  }

  const response = await fetch("/api/v1/places/", { headers });

  let data = {};
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    const msg = data?.message || data?.error || response.statusText || "Failed to fetch places";
    throw new Error(msg);
  }

  // Your API likely returns a list
  return Array.isArray(data) ? data : (data.places || []);
}

// ---------- INDEX PAGE (TASK REQUIREMENT) ----------
let __placesCache = []; // store for filtering

function ensurePriceFilterOptions(priceFilter) {
  // Requirement: options must be 10, 50, 100, All
  const required = [
    { value: "10", label: "10" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "all", label: "All" }
  ];

  priceFilter.innerHTML = "";
  required.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    priceFilter.appendChild(o);
  });

  priceFilter.value = "all";
}

function normalizePlace(p) {
  // Support both API fields (title) and your old fake data (name)
  return {
    id: p.id,
    title: p.title || p.name || "Untitled place",
    description: p.description || "",
    price: Number(p.price ?? 0),
    host: p.host || p.owner || "",
    amenities: Array.isArray(p.amenities) ? p.amenities : []
  };
}

function displayPlaces(places) {
  const placesList = document.getElementById("places-list");
  if (!placesList) return;

  placesList.innerHTML = "";

  if (!places || places.length === 0) {
    placesList.innerHTML = `<p class="muted">No places found.</p>`;
    return;
  }

  places.forEach((raw) => {
    const place = normalizePlace(raw);

    const card = document.createElement("article");
    card.className = "place-card";
    card.dataset.price = String(place.price);

    card.innerHTML = `
      <h2>${place.title}</h2>
      <p>${place.description || ""}</p>
      <p><strong>Price per night:</strong> $${place.price}</p>
      <a class="details-button" href="/place/${place.id}">View Details</a>
    `;

    placesList.appendChild(card);
  });
}

function applyPriceFilter(selectedValue) {
  const cards = document.querySelectorAll("#places-list .place-card");

  cards.forEach((card) => {
    if (selectedValue === "all") {
      card.style.display = "";
      return;
    }

    const maxPrice = Number(selectedValue);
    const price = Number(card.dataset.price || "0");

    card.style.display = price <= maxPrice ? "" : "none";
  });
}

async function initIndexPage() {
  const placesList = document.getElementById("places-list");
  const priceFilter = document.getElementById("price-filter");
  if (!placesList || !priceFilter) return;

  // 1) auth check: show/hide login link
  const token = checkAuthentication();

  // 2) enforce dropdown options required by task
  ensurePriceFilterOptions(priceFilter);

  // 3) fetch places from API, fallback to fake data if API fails
  try {
    const apiPlaces = await fetchPlaces(token);
    __placesCache = apiPlaces;
    displayPlaces(__placesCache);
  } catch (err) {
    // fallback so UI still works
    __placesCache = PLACES;
    displayPlaces(__placesCache);

    // Optional: show a small warning message (non-blocking)
    // placesList.insertAdjacentHTML("afterbegin", `<p class="form-error">API not available, showing sample data.</p>`);
  }

  // 4) client-side filter (no reload)
  priceFilter.addEventListener("change", (e) => {
    applyPriceFilter(e.target.value);
  });

  // default apply
  applyPriceFilter(priceFilter.value);
}

// ---------- PLACE DETAILS PAGE (still uses fake data for now) ----------
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