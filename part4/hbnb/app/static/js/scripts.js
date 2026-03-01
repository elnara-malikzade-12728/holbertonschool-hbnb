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
  if (token) headers["Authorization"] = `Bearer ${decodeURIComponent(token)}`;

  const response = await fetch("/api/v1/places/", { headers });

  let data = {};
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) {
    const msg = data?.message || data?.error || response.statusText || "Failed to fetch places";
    throw new Error(msg);
  }

  return Array.isArray(data) ? data : (data.places || []);
}

async function fetchPlaceById(token, placeId) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${decodeURIComponent(token)}`;

  const resp = await fetch(`/api/v1/places/${placeId}`, { headers });

  let data = {};
  try { data = await resp.json(); } catch (_) {}

  if (!resp.ok) {
    const msg = data?.error || data?.message || resp.statusText || "Failed to fetch place details";
    throw new Error(msg);
  }
  return data;
}

async function fetchReviewsForPlace(token, placeId) {
  // Try a common pattern: /api/v1/reviews/?place_id=<id>
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${decodeURIComponent(token)}`;

  const resp = await fetch(`/api/v1/reviews/?place_id=${encodeURIComponent(placeId)}`, { headers });

  let data = {};
  try { data = await resp.json(); } catch (_) {}

  if (!resp.ok) {
    // Don't hard-fail the whole page if reviews endpoint isn't ready
    return [];
  }
  return Array.isArray(data) ? data : (data.reviews || []);
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

  const token = checkAuthentication();
  ensurePriceFilterOptions(priceFilter);

  try {
    const apiPlaces = await fetchPlaces(token);
    __placesCache = apiPlaces;
    displayPlaces(__placesCache);
  } catch (err) {
    __placesCache = PLACES;
    displayPlaces(__placesCache);
  }

  priceFilter.addEventListener("change", (e) => applyPriceFilter(e.target.value));
  applyPriceFilter(priceFilter.value);
}

// ---------- PLACE DETAILS PAGE (TASK REQUIREMENT now) ----------
function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function getPlaceIdFromPage() {
  const detailsEl = document.getElementById("place-details");
  return detailsEl?.dataset?.placeId || null;
}

function normalizeAmenity(a) {
  if (!a) return "";
  if (typeof a === "string") return a;
  return a.name || "";
}

function normalizeReview(r) {
  const comment = r?.text || r?.comment || "";
  const rating = r?.rating ?? "";
  const user =
    r?.user?.first_name
      ? `${r.user.first_name} ${r.user.last_name || ""}`.trim()
      : (r?.user || r?.user_name || "Anonymous");
  return { comment, rating, user };
}

async function initPlacePage() {
  const detailsEl = document.getElementById("place-details");
  const reviewsEl = document.getElementById("reviews");
  const addReviewCta = document.getElementById("add-review-cta");
  const addReviewSection = document.getElementById("add-review"); // if your HTML has wrapper
  if (!detailsEl || !reviewsEl) return;

  // 1) place id from dataset OR query string
  const placeId = getPlaceIdFromPage() || getPlaceIdFromURL();
  if (!placeId) {
    detailsEl.innerHTML = "<p>Missing place id.</p>";
    return;
  }

  // 2) auth check for add review visibility and token usage
  const token = getCookie("token");
  const loggedIn = Boolean(token);

  if (addReviewSection) addReviewSection.style.display = loggedIn ? "block" : "none";
  if (addReviewCta) addReviewCta.style.display = loggedIn ? "inline-block" : "none";
  if (addReviewCta && loggedIn) addReviewCta.href = `/place/${placeId}/review`;

  // 3) fetch details from API (fallback to fake data if fails)
  try {
    const place = await fetchPlaceById(token, placeId);

    const title = place.title || place.name || "Untitled place";
    const description = place.description || "";
    const price = place.price ?? "N/A";
    const amenities = Array.isArray(place.amenities) ? place.amenities : [];
    const amenitiesText = amenities.map(normalizeAmenity).filter(Boolean).join(", ") || "—";

    detailsEl.innerHTML = `
      <h1>${title}</h1>
      <div class="place-info">
        <p><strong>Description:</strong> ${description || "—"}</p>
        <p><strong>Price per night:</strong> $${price}</p>
        <p><strong>Amenities:</strong> ${amenitiesText}</p>
      </div>
    `;

    // Reviews: if backend embeds place.reviews use that, otherwise call endpoint
    let reviews = [];
    if (Array.isArray(place.reviews)) {
      reviews = place.reviews;
    } else {
      reviews = await fetchReviewsForPlace(token, placeId);
    }

    reviewsEl.innerHTML = "";
    if (!reviews || reviews.length === 0) {
      reviewsEl.innerHTML = `<p class="muted">No reviews yet.</p>`;
    } else {
      reviews.forEach((r) => {
        const rr = normalizeReview(r);
        const card = document.createElement("article");
        card.className = "review-card";
        card.innerHTML = `
          <p>${rr.comment}</p>
          <p class="muted">— ${rr.user}</p>
          <p class="rating">Rating: ${rr.rating}/5</p>
        `;
        reviewsEl.appendChild(card);
      });
    }
  } catch (err) {
    // fallback to fake data for UI
    const idNum = Number(placeId);
    const fallback = PLACES.find((p) => p.id === idNum);

    if (!fallback) {
      detailsEl.innerHTML = `<p class="form-error">${err.message}</p>`;
      reviewsEl.innerHTML = "";
      return;
    }

    detailsEl.innerHTML = `
      <h1>${fallback.name}</h1>
      <div class="place-info">
        <p><strong>Host:</strong> ${fallback.host}</p>
        <p><strong>Price per night:</strong> $${fallback.price}</p>
        <p><strong>Description:</strong> ${fallback.description}</p>
        <p><strong>Amenities:</strong> ${fallback.amenities.join(", ")}</p>
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
  }
}

// ---------- LOGIN PAGE (TASK REQUIREMENT) ----------
function initLoginPage() {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (errorEl) errorEl.textContent = "";

    const email = document.getElementById("email")?.value?.trim();
    const password = document.getElementById("password")?.value;

    if (!email || !password) {
      if (errorEl) errorEl.textContent = "Email and password are required.";
      return;
    }

    try {
      const token = await loginUser(email, password);
      setCookie("token", token, 1);
      window.location.href = "/";
    } catch (err) {
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