/**
 * api.js
 * -----------------------------------------------------------------------
 * All communication with the Django backend lives here. Nothing in this
 * file touches the DOM — it only builds requests and returns parsed data.
 *
 * Backend contract (Demo/urls.py, mounted under /demo/):
 *   GET    /demo/order_list/                -> list of orders
 *   GET    /demo/order_details/<id>/        -> single order (detail shape)
 *   POST   /demo/create_order/              -> create an order
 *   PATCH  /demo/update_order/<id>/         -> update an order (partial)
 *   DELETE /demo/delete_order/<id>/         -> delete an order
 *   GET    /demo/menu_list/                 -> list of menu items
 *   POST   /demo/create_item/               -> create a menu item
 *   PATCH  /demo/update_menu/<id>/          -> update a menu item (partial)
 *   DELETE /demo/delete_menu/<id>/          -> delete a menu item
 *   GET    /demo/generate_invoice/<id>/     -> HTML invoice (opened in a tab)
 *
 * NOTE: this assumes the backend has the id/Status fields patched in as
 * described in the accompanying backend_patch notes — see the chat reply
 * for the exact (small) diffs required.
 */

// Point this at wherever the Django server is running.
const API_BASE = "http://127.0.0.1:8000/demo";

/**
 * Shared request helper: builds the URL, sends the fetch, and normalizes
 * error handling so every API function doesn't have to repeat it.
 */
async function request(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch (networkError) {
    throw new Error("Could not reach the server. Check your connection.");
  }

  let body = null;
  try {
    body = await response.json();
  } catch (parseError) {
    // Some endpoints (e.g. a 204/empty body) may not return JSON.
    body = null;
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(body, response.status));
  }

  return body;
}

/**
 * DRF validation errors come back as { field: ["message", ...], ... }.
 * This pulls out something readable for a toast.
 */
function extractErrorMessage(body, status) {
  if (!body) {
    return `Request failed (${status}).`;
  }
  if (body.message) {
    return body.message;
  }
  const firstField = Object.keys(body)[0];
  if (firstField && Array.isArray(body[firstField])) {
    return `${firstField}: ${body[firstField][0]}`;
  }
  return `Request failed (${status}).`;
}

// ------------------------------------------------------------------
// Orders
// ------------------------------------------------------------------

async function getOrders() {
  const data = await request("/order_list/");
  return data.order;
}

async function getOrderDetails(orderId) {
  const data = await request(`/order_details/${orderId}/`);
  return data.order_details;
}

async function createOrder(payload) {
  const data = await request("/create_order/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.order;
}

async function updateOrder(orderId, payload) {
  const data = await request(`/update_order/${orderId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.order;
}

async function deleteOrder(orderId) {
  await request(`/delete_order/${orderId}/`, { method: "DELETE" });
}

// ------------------------------------------------------------------
// Menu
// ------------------------------------------------------------------

async function getMenu() {
  const data = await request("/menu_list/");
  return data.menu_items;
}

async function createMenuItem(payload) {
  const data = await request("/create_item/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.menu_item;
}

async function updateMenuItem(itemId, payload) {
  const data = await request(`/update_menu/${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.menu_item;
}

async function deleteMenuItem(itemId) {
  await request(`/delete_menu/${itemId}/`, { method: "DELETE" });
}

// ------------------------------------------------------------------
// Invoice
// ------------------------------------------------------------------

function getInvoiceUrl(orderId) {
  return `${API_BASE}/generate_invoice/${orderId}/`;
}