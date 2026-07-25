/**
 * main.js
 * -----------------------------------------------------------------------
 * State, rendering, and event wiring for the SOS dashboard. All backend
 * communication goes through api.js — this file only touches the DOM and
 * decides what to show.
 */

// ------------------------------------------------------------------
// State
// ------------------------------------------------------------------

const STATUS_VALUES = ["Preparing", "Accepted", "Ready To Collect", "Delivered"];

const state = {
  orders: [],
  menu: [],
  filter: "live", // "live" | "delivered"
  selectedOrderId: null,
  orderDetails: null, // normalized details of the order currently open in the modal
  newOrderCart: {}, // { [menuId]: qty }
  editOrderCart: {}, // { [menuId]: qty }
  editingMenuItemId: null, // id of the menu item currently being edited, or null
};

// ------------------------------------------------------------------
// DOM references
// ------------------------------------------------------------------

const dom = {
  ordersGrid: document.getElementById("ordersGrid"),
  ordersLoading: document.getElementById("ordersLoading"),
  ordersError: document.getElementById("ordersError"),
  ordersErrorText: document.getElementById("ordersErrorText"),
  ordersEmpty: document.getElementById("ordersEmpty"),
  ordersEmptyText: document.getElementById("ordersEmptyText"),
  ordersRetryBtn: document.getElementById("ordersRetryBtn"),
  filterTabs: document.querySelectorAll(".filter-tabs__btn"),

  newOrderBtn: document.getElementById("newOrderBtn"),
  newOrderModal: document.getElementById("newOrderModal"),
  newOrderForm: document.getElementById("newOrderForm"),
  newOrderMenuList: document.getElementById("newOrderMenuList"),
  newOrderTotalPreview: document.getElementById("newOrderTotalPreview"),
  createOrderSubmitBtn: document.getElementById("createOrderSubmitBtn"),

  orderDetailsModal: document.getElementById("orderDetailsModal"),
  orderDetailsTitle: document.getElementById("orderDetailsTitle"),
  orderDetailsLoading: document.getElementById("orderDetailsLoading"),
  orderDetailsView: document.getElementById("orderDetailsView"),
  orderDetailFields: document.getElementById("orderDetailFields"),
  orderStatusSelect: document.getElementById("orderStatusSelect"),
  orderItemsTableBody: document.getElementById("orderItemsTableBody"),
  orderDetailsTotal: document.getElementById("orderDetailsTotal"),
  deleteOrderBtn: document.getElementById("deleteOrderBtn"),
  printBillBtn: document.getElementById("printBillBtn"),
  editOrderBtn: document.getElementById("editOrderBtn"),

  editOrderForm: document.getElementById("editOrderForm"),
  editOrderMenuList: document.getElementById("editOrderMenuList"),
  editOrderTotalPreview: document.getElementById("editOrderTotalPreview"),
  cancelEditOrderBtn: document.getElementById("cancelEditOrderBtn"),
  saveEditOrderBtn: document.getElementById("saveEditOrderBtn"),

  menuManagementBtn: document.getElementById("menuManagementBtn"),
  menuManagementModal: document.getElementById("menuManagementModal"),
  menuManagementList: document.getElementById("menuManagementList"),
  menuManagementEmpty: document.getElementById("menuManagementEmpty"),
  menuItemForm: document.getElementById("menuItemForm"),
  menuFormHeading: document.getElementById("menuFormHeading"),
  menuFormSubmitBtn: document.getElementById("menuFormSubmitBtn"),
  cancelMenuEditBtn: document.getElementById("cancelMenuEditBtn"),

  toastContainer: document.getElementById("toastContainer"),
};

// ------------------------------------------------------------------
// Init
// ------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", init);

function init() {
  wireGlobalEvents();
  loadOrders();
  loadMenu();
}

function wireGlobalEvents() {
  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });

  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });

  dom.filterTabs.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  dom.ordersRetryBtn.addEventListener("click", loadOrders);

  dom.newOrderBtn.addEventListener("click", openNewOrderModal);
  dom.newOrderForm.addEventListener("submit", handleNewOrderSubmit);

  dom.orderStatusSelect.addEventListener("change", handleStatusChange);
  dom.deleteOrderBtn.addEventListener("click", handleDeleteOrder);
  dom.printBillBtn.addEventListener("click", handlePrintBill);
  dom.editOrderBtn.addEventListener("click", enterEditMode);
  dom.cancelEditOrderBtn.addEventListener("click", exitEditMode);
  dom.editOrderForm.addEventListener("submit", handleEditOrderSubmit);

  dom.menuManagementBtn.addEventListener("click", openMenuManagementModal);
  dom.menuItemForm.addEventListener("submit", handleMenuItemFormSubmit);
  dom.cancelMenuEditBtn.addEventListener("click", resetMenuItemForm);
}

// ------------------------------------------------------------------
// Toasts
// ------------------------------------------------------------------

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ------------------------------------------------------------------
// Formatting helpers
// ------------------------------------------------------------------

function formatCurrency(value) {
  const num = Number(value) || 0;
  return `₹${num % 1 === 0 ? num.toFixed(0) : num.toFixed(2)}`;
}

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status) {
  return `badge badge--${String(status || "").replace(/\s+/g, "-")}`;
}

function tableOrCarLabel(tableNumber, carNumber) {
  if (tableNumber !== null && tableNumber !== undefined && tableNumber !== "") {
    return `Table ${tableNumber}`;
  }
  if (carNumber) {
    return `Car ${carNumber}`;
  }
  return "—";
}

function sumItemQuantities(items) {
  return (items || []).reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

// ------------------------------------------------------------------
// Generic modal helpers
// ------------------------------------------------------------------

function openModal(id) {
  document.getElementById(id).hidden = false;
}

function closeModal(id) {
  document.getElementById(id).hidden = true;
}

// ------------------------------------------------------------------
// Orders: load + render
// ------------------------------------------------------------------

async function loadOrders() {
  toggleOrdersState("loading");
  try {
    state.orders = await getOrders();
    renderOrders();
  } catch (err) {
    dom.ordersErrorText.textContent = err.message;
    toggleOrdersState("error");
  }
}

function toggleOrdersState(mode) {
  dom.ordersLoading.hidden = mode !== "loading";
  dom.ordersError.hidden = mode !== "error";
  dom.ordersEmpty.hidden = mode !== "empty";
  dom.ordersGrid.hidden = mode !== "grid";
}

function getFilteredOrders() {
  return state.orders.filter((order) =>
    state.filter === "delivered" ? order.Status === "Delivered" : order.Status !== "Delivered"
  );
}

function setFilter(filter) {
  state.filter = filter;
  dom.filterTabs.forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle("is-active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
  });
  renderOrders();
}

function renderOrders() {
  const orders = getFilteredOrders();

  if (orders.length === 0) {
    dom.ordersEmptyText.textContent =
      state.filter === "delivered" ? "No delivered orders yet" : "No active orders";
    toggleOrdersState("empty");
    return;
  }

  dom.ordersGrid.innerHTML = "";
  orders
    .slice()
    .sort((a, b) => b.id - a.id)
    .forEach((order) => dom.ordersGrid.appendChild(createOrderCard(order)));

  toggleOrdersState("grid");
}

function createOrderCard(order) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "order-card";
  card.addEventListener("click", () => openOrderDetails(order.id));

  const perf = document.createElement("div");
  perf.className = "order-card__perf";
  card.appendChild(perf);

  const body = document.createElement("div");
  body.className = "order-card__body";

  const top = document.createElement("div");
  top.className = "order-card__top";
  top.innerHTML = `<span class="order-card__id">#${order.id}</span>`;
  const badge = document.createElement("span");
  badge.className = statusBadgeClass(order.Status);
  badge.textContent = order.Status;
  top.appendChild(badge);
  body.appendChild(top);

  const name = document.createElement("div");
  name.className = "order-card__name";
  name.textContent = order.CustName || "Walk-in customer";
  body.appendChild(name);

  const meta = document.createElement("div");
  meta.className = "order-card__meta";
  meta.textContent = tableOrCarLabel(order.Table_number, order.Car_number);
  body.appendChild(meta);

  const footer = document.createElement("div");
  footer.className = "order-card__footer";

  const items = document.createElement("span");
  items.className = "order-card__items";
  items.textContent = `${sumItemQuantities(order.Items)} items`;
  footer.appendChild(items);

  const total = document.createElement("span");
  total.className = "order-card__total";
  total.textContent = formatCurrency(order.Total);
  footer.appendChild(total);

  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

// ------------------------------------------------------------------
// Order details modal
// ------------------------------------------------------------------

function normalizeOrderDetails(raw) {
  return {
    id: raw.order_id,
    custName: raw.Customer_Name,
    phone: raw.Customer_Number,
    items: raw.Order_Items || [],
    total: raw.Bill,
    status: raw.Status,
    tableNumber: raw.Table_number,
    carNumber: raw.Car_number,
    paymentStatus: raw.Payment_status,
    paymentType: raw.Payment_Type,
    staff: raw.Staff_assigned,
    createdAt: raw.Ordered_at,
  };
}

async function openOrderDetails(orderId) {
  state.selectedOrderId = orderId;
  openModal("orderDetailsModal");
  exitEditMode();
  dom.orderDetailsView.hidden = true;
  dom.orderDetailsLoading.hidden = false;

  try {
    const raw = await getOrderDetails(orderId);
    state.orderDetails = normalizeOrderDetails(raw);
    renderOrderDetailsView(state.orderDetails);
  } catch (err) {
    showToast(err.message, "error");
    closeModal("orderDetailsModal");
  } finally {
    dom.orderDetailsLoading.hidden = true;
  }
}

function renderOrderDetailsView(details) {
  dom.orderDetailsTitle.textContent = `Order #${details.id}`;
  dom.orderDetailsView.hidden = false;

  const fields = [
    ["Customer", details.custName || "Walk-in customer"],
    ["Phone", details.phone || "—"],
    ["Table / Car", tableOrCarLabel(details.tableNumber, details.carNumber)],
    ["Staff", details.staff || "—"],
    ["Payment type", details.paymentType || "—"],
    ["Payment status", details.paymentStatus || "—"],
    ["Ordered at", formatDateTime(details.createdAt)],
  ];

  dom.orderDetailFields.innerHTML = "";
  fields.forEach(([label, value]) => {
    const field = document.createElement("div");
    field.className = "order-detail-field";
    const labelEl = document.createElement("span");
    labelEl.className = "order-detail-field__label";
    labelEl.textContent = label;
    const valueEl = document.createElement("span");
    valueEl.className = "order-detail-field__value";
    valueEl.textContent = value;
    field.append(labelEl, valueEl);
    dom.orderDetailFields.appendChild(field);
  });

  populateStatusSelect(details.status);
  renderOrderItemsTable(details.items);
  dom.orderDetailsTotal.textContent = formatCurrency(details.total);
}

function populateStatusSelect(currentStatus) {
  dom.orderStatusSelect.innerHTML = "";
  STATUS_VALUES.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    if (value === currentStatus) option.selected = true;
    dom.orderStatusSelect.appendChild(option);
  });
}

function renderOrderItemsTable(items) {
  dom.orderItemsTableBody.innerHTML = "";

  if (!items || items.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5" style="color: var(--muted); text-align: center;">No items</td>`;
    dom.orderItemsTableBody.appendChild(row);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name;
    const sizeCell = document.createElement("td");
    sizeCell.textContent = item.size || "—";
    const priceCell = document.createElement("td");
    priceCell.textContent = formatCurrency(item.unit_price);
    const qtyCell = document.createElement("td");
    qtyCell.textContent = item.qty;
    const subtotalCell = document.createElement("td");
    subtotalCell.textContent = formatCurrency(item.subtotal);

    row.append(nameCell, sizeCell, priceCell, qtyCell, subtotalCell);
    dom.orderItemsTableBody.appendChild(row);
  });
}

async function handleStatusChange() {
  const newStatus = dom.orderStatusSelect.value;
  const orderId = state.selectedOrderId;

  dom.orderStatusSelect.disabled = true;
  try {
    await updateOrder(orderId, { Status: newStatus });
    state.orderDetails.status = newStatus;
    showToast("Status updated", "success");
    await loadOrders();
  } catch (err) {
    showToast(err.message, "error");
    populateStatusSelect(state.orderDetails.status); // revert the select
  } finally {
    dom.orderStatusSelect.disabled = false;
  }
}

async function handleDeleteOrder() {
  const orderId = state.selectedOrderId;
  if (!confirm(`Delete order #${orderId}? This cannot be undone.`)) return;

  dom.deleteOrderBtn.disabled = true;
  try {
    await deleteOrder(orderId);
    showToast("Order deleted", "success");
    closeModal("orderDetailsModal");
    await loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    dom.deleteOrderBtn.disabled = false;
  }
}

function handlePrintBill() {
  window.open(getInvoiceUrl(state.selectedOrderId), "_blank");
}

// ------------------------------------------------------------------
// Edit order
// ------------------------------------------------------------------

function enterEditMode() {
  const details = state.orderDetails;
  if (!details) return;

  dom.editOrderForm.CustName.value = details.custName || "";
  dom.editOrderForm.Phone.value = details.phone || "";
  dom.editOrderForm.Table_number.value = details.tableNumber ?? "";
  dom.editOrderForm.Car_number.value = details.carNumber || "";
  dom.editOrderForm.Staff.value = details.staff || "";
  dom.editOrderForm.Payment_Type.value = details.paymentType || "";
  dom.editOrderForm.Payment_Status.value = details.paymentStatus || "";

  state.editOrderCart = {};
  (details.items || []).forEach((item) => {
    state.editOrderCart[item.menu_id] = item.qty;
  });

  renderMenuPicker(dom.editOrderMenuList, state.editOrderCart, dom.editOrderTotalPreview);

  dom.orderDetailsView.hidden = true;
  dom.editOrderForm.hidden = false;
}

function exitEditMode() {
  dom.editOrderForm.hidden = true;
  if (state.orderDetails) dom.orderDetailsView.hidden = false;
}

async function handleEditOrderSubmit(e) {
  e.preventDefault();
  const items = buildItemsPayload(state.editOrderCart);

  if (items.length === 0) {
    showToast("Add at least one menu item", "error");
    return;
  }

  const form = dom.editOrderForm;
  const payload = {
    CustName: form.CustName.value.trim(),
    Phone: form.Phone.value.trim() || null,
    Table_number: form.Table_number.value ? Number(form.Table_number.value) : null,
    Car_number: form.Car_number.value.trim() || null,
    Staff: form.Staff.value.trim() || null,
    Payment_Type: form.Payment_Type.value || null,
    Payment_Status: form.Payment_Status.value || null,
    Items: items,
  };

  dom.saveEditOrderBtn.disabled = true;
  dom.saveEditOrderBtn.textContent = "Saving…";

  try {
    await updateOrder(state.selectedOrderId, payload);
    showToast("Order updated", "success");
    await loadOrders();
    await openOrderDetails(state.selectedOrderId);
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    dom.saveEditOrderBtn.disabled = false;
    dom.saveEditOrderBtn.textContent = "Save Changes";
  }
}

// ------------------------------------------------------------------
// New order modal
// ------------------------------------------------------------------

function openNewOrderModal() {
  resetNewOrderForm();
  openModal("newOrderModal");
}

function resetNewOrderForm() {
  dom.newOrderForm.reset();
  state.newOrderCart = {};
  renderMenuPicker(dom.newOrderMenuList, state.newOrderCart, dom.newOrderTotalPreview);
}

async function handleNewOrderSubmit(e) {
  e.preventDefault();

  const items = buildItemsPayload(state.newOrderCart);
  if (items.length === 0) {
    showToast("Add at least one menu item", "error");
    return;
  }

  const form = dom.newOrderForm;
  const payload = {
    CustName: form.CustName.value.trim(),
    Phone: form.Phone.value.trim() || null,
    Table_number: form.Table_number.value ? Number(form.Table_number.value) : null,
    Car_number: form.Car_number.value.trim() || null,
    Staff: form.Staff.value.trim() || null,
    Payment_Type: form.Payment_Type.value || null,
    Payment_Status: form.Payment_Status.value || null,
    Items: items,
  };

  dom.createOrderSubmitBtn.disabled = true;
  dom.createOrderSubmitBtn.textContent = "Creating…";

  try {
    await createOrder(payload);
    showToast("Order created", "success");
    closeModal("newOrderModal");
    await loadOrders();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    dom.createOrderSubmitBtn.disabled = false;
    dom.createOrderSubmitBtn.textContent = "Create Order";
  }
}

// ------------------------------------------------------------------
// Shared menu picker (used by New Order + Edit Order)
// ------------------------------------------------------------------

function renderMenuPicker(container, cart, totalPreviewEl) {
  container.innerHTML = "";

  if (state.menu.length === 0) {
    container.innerHTML = `<div class="menu-picker__row"><span class="menu-picker__meta">No menu items available</span></div>`;
    totalPreviewEl.textContent = formatCurrency(0);
    return;
  }

  state.menu.forEach((menuItem) => {
    container.appendChild(createMenuPickerRow(menuItem, cart, totalPreviewEl));
  });

  updateCartTotal(cart, totalPreviewEl);
}

function createMenuPickerRow(menuItem, cart, totalPreviewEl) {
  const row = document.createElement("div");
  row.className = "menu-picker__row";

  const info = document.createElement("div");
  info.className = "menu-picker__info";
  const name = document.createElement("div");
  name.className = "menu-picker__name";
  name.textContent = menuItem.ItemName;
  const meta = document.createElement("div");
  meta.className = "menu-picker__meta";
  meta.textContent = `${menuItem.ItemQuantity} · ${formatCurrency(menuItem.ItemPrice)}`;
  info.append(name, meta);

  const qtyValueEl = document.createElement("span");
  qtyValueEl.className = "qty-control__value";
  qtyValueEl.textContent = cart[menuItem.id] || 0;

  const minusBtn = document.createElement("button");
  minusBtn.type = "button";
  minusBtn.className = "qty-control__btn";
  minusBtn.textContent = "−";
  minusBtn.setAttribute("aria-label", `Decrease ${menuItem.ItemName}`);
  minusBtn.addEventListener("click", () => {
    changeQuantity(cart, menuItem.id, -1);
    qtyValueEl.textContent = cart[menuItem.id] || 0;
    updateCartTotal(cart, totalPreviewEl);
  });

  const plusBtn = document.createElement("button");
  plusBtn.type = "button";
  plusBtn.className = "qty-control__btn";
  plusBtn.textContent = "+";
  plusBtn.setAttribute("aria-label", `Increase ${menuItem.ItemName}`);
  plusBtn.addEventListener("click", () => {
    changeQuantity(cart, menuItem.id, 1);
    qtyValueEl.textContent = cart[menuItem.id] || 0;
    updateCartTotal(cart, totalPreviewEl);
  });

  const qtyControl = document.createElement("div");
  qtyControl.className = "qty-control";
  qtyControl.append(minusBtn, qtyValueEl, plusBtn);

  row.append(info, qtyControl);
  return row;
}

function changeQuantity(cart, menuId, delta) {
  const next = (cart[menuId] || 0) + delta;
  cart[menuId] = Math.max(0, next);
}

function updateCartTotal(cart, totalPreviewEl) {
  totalPreviewEl.textContent = formatCurrency(calcCartTotal(cart));
}

function calcCartTotal(cart) {
  return Object.entries(cart).reduce((sum, [menuId, qty]) => {
    const menuItem = state.menu.find((m) => String(m.id) === String(menuId));
    if (!menuItem || !qty) return sum;
    return sum + Number(menuItem.ItemPrice) * qty;
  }, 0);
}

function buildItemsPayload(cart) {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([menuId, qty]) => ({ menu_id: Number(menuId), qty }));
}

// ------------------------------------------------------------------
// Menu management
// ------------------------------------------------------------------

async function loadMenu() {
  try {
    state.menu = await getMenu();
    renderMenuManagementList();
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openMenuManagementModal() {
  resetMenuItemForm();
  renderMenuManagementList();
  openModal("menuManagementModal");
}

function renderMenuManagementList() {
  dom.menuManagementList.innerHTML = "";

  if (state.menu.length === 0) {
    dom.menuManagementEmpty.hidden = false;
    dom.menuManagementList.hidden = true;
    return;
  }

  dom.menuManagementEmpty.hidden = true;
  dom.menuManagementList.hidden = false;

  state.menu.forEach((item) => {
    dom.menuManagementList.appendChild(createMenuRow(item));
  });
}

function createMenuRow(item) {
  const row = document.createElement("div");
  row.className = "menu-row";

  const info = document.createElement("div");
  info.className = "menu-row__info";
  const name = document.createElement("div");
  name.className = "menu-row__name";
  name.textContent = item.ItemName;
  const meta = document.createElement("div");
  meta.className = "menu-row__meta";
  meta.textContent = item.ItemQuantity;
  info.append(name, meta);

  const actions = document.createElement("div");
  actions.className = "menu-row__actions";

  const price = document.createElement("span");
  price.className = "menu-row__price";
  price.textContent = formatCurrency(item.ItemPrice);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn--secondary btn--small";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEditMenuItem(item));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn btn--danger btn--small";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => handleDeleteMenuItem(item.id, item.ItemName));

  actions.append(price, editBtn, deleteBtn);
  row.append(info, actions);
  return row;
}

function startEditMenuItem(item) {
  state.editingMenuItemId = item.id;
  dom.menuFormHeading.textContent = `Edit ${item.ItemName}`;
  dom.menuItemForm.ItemName.value = item.ItemName;
  dom.menuItemForm.ItemQuantity.value = item.ItemQuantity;
  dom.menuItemForm.ItemPrice.value = item.ItemPrice;
  dom.menuFormSubmitBtn.textContent = "Update Item";
  dom.cancelMenuEditBtn.hidden = false;
}

function resetMenuItemForm() {
  state.editingMenuItemId = null;
  dom.menuFormHeading.textContent = "Add Item";
  dom.menuItemForm.reset();
  dom.menuFormSubmitBtn.textContent = "Add Item";
  dom.cancelMenuEditBtn.hidden = true;
}

async function handleMenuItemFormSubmit(e) {
  e.preventDefault();
  const form = dom.menuItemForm;
  const payload = {
    ItemName: form.ItemName.value.trim(),
    ItemQuantity: form.ItemQuantity.value,
    ItemPrice: Number(form.ItemPrice.value),
  };

  dom.menuFormSubmitBtn.disabled = true;

  try {
    if (state.editingMenuItemId) {
      await updateMenuItem(state.editingMenuItemId, payload);
      showToast("Menu item updated", "success");
    } else {
      await createMenuItem(payload);
      showToast("Menu item added", "success");
    }
    resetMenuItemForm();
    await loadMenu();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    dom.menuFormSubmitBtn.disabled = false;
  }
}

async function handleDeleteMenuItem(itemId, itemName) {
  if (!confirm(`Delete "${itemName}" from the menu?`)) return;

  try {
    await deleteMenuItem(itemId);
    showToast("Menu item deleted", "success");
    if (state.editingMenuItemId === itemId) resetMenuItemForm();
    await loadMenu();
  } catch (err) {
    showToast(err.message, "error");
  }
}