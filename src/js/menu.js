// ============================
// menu.js – Menu & Order Form
// ============================

const API_BASE = '/api';

let currentOrderId = null;
let selectedItems = {};          // { menu_item_id: quantity }
let menuCache = [];

// ---------- Fetch Menu (cached) ----------
async function getMenu() {
    if (menuCache.length > 0) return menuCache;
    try {
        const res = await fetch(`${API_BASE}/menu/`);
        if (!res.ok) throw new Error('Menu fetch failed');
        menuCache = await res.json();
        return menuCache;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// ---------- Render Menu in Modal ----------
async function loadMenuForModal() {
    const items = await getMenu();
    const container = document.getElementById('menuItemsList');
    container.innerHTML = '';
    if (items.length === 0) {
        container.innerHTML = '<p style="color:#999;">No menu items available.</p>';
        return;
    }
    items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'menu-item-row';
        row.innerHTML = `
            <span>${item.name} (₹${parseFloat(item.price).toFixed(2)})</span>
            <div class="menu-item-controls">
                <button data-id="${item.id}" class="minus">−</button>
                <span id="qty-${item.id}">0</span>
                <button data-id="${item.id}" class="plus">+</button>
            </div>
        `;
        container.appendChild(row);
    });

    // Attach events
    container.querySelectorAll('.plus').forEach(btn => {
        btn.onclick = () => changeQty(btn.dataset.id, 1);
    });
    container.querySelectorAll('.minus').forEach(btn => {
        btn.onclick = () => changeQty(btn.dataset.id, -1);
    });

    // Reset selected quantities
    selectedItems = {};
    document.querySelectorAll('.menu-item-controls span').forEach(el => el.textContent = '0');
    updateTotal();
}

// ---------- Quantity Change ----------
function changeQty(itemId, delta) {
    if (!selectedItems[itemId]) selectedItems[itemId] = 0;
    selectedItems[itemId] = Math.max(0, selectedItems[itemId] + delta);
    const span = document.getElementById(`qty-${itemId}`);
    if (span) span.textContent = selectedItems[itemId];
    updateTotal();
}

// ---------- Update Total ----------
async function updateTotal() {
    const menu = await getMenu();
    let total = 0;
    for (const [id, qty] of Object.entries(selectedItems)) {
        if (qty > 0) {
            const item = menu.find(i => i.id == id);
            if (item) total += item.price * qty;
        }
    }
    document.getElementById('totalAmount').textContent = total.toFixed(2);
}

// ---------- Open Add Order ----------
async function openAddOrder() {
    document.getElementById('modalTitle').textContent = '🆕 New Order';
    document.getElementById('orderForm').reset();
    currentOrderId = null;
    // Reset quantities in UI
    document.querySelectorAll('.menu-item-controls span').forEach(el => el.textContent = '0');
    selectedItems = {};
    await updateTotal();
    document.getElementById('orderModal').classList.remove('hidden');
    // Load menu if not already loaded
    if (!document.getElementById('menuItemsList').children.length) {
        await loadMenuForModal();
    }
}
window.openAddOrder = openAddOrder;

// ---------- Open Edit Order ----------
async function openEditOrder(orderId) {
    try {
        const res = await fetch(`${API_BASE}/orders/${orderId}/`);
        if (!res.ok) throw new Error('Order not found');
        const order = await res.json();
        document.getElementById('modalTitle').textContent = '✏️ Edit Order';
        document.getElementById('customerName').value = order.customer_name;
        document.getElementById('carNumber').value = order.car_number || '';
        document.getElementById('callerName').value = order.caller_name || '';
        currentOrderId = orderId;

        // Load menu and populate quantities
        await loadMenuForModal();
        // Set quantities from order items
        selectedItems = {};
        order.items.forEach(item => {
            selectedItems[item.menu_item] = item.quantity;
        });
        // Update UI spans
        for (const [id, qty] of Object.entries(selectedItems)) {
            const span = document.getElementById(`qty-${id}`);
            if (span) span.textContent = qty;
        }
        await updateTotal();
        document.getElementById('orderModal').classList.remove('hidden');
    } catch (err) {
        alert('Error loading order: ' + err.message);
    }
}
window.openEditOrder = openEditOrder;

// ---------- Form Submit ----------
document.getElementById('orderForm').onsubmit = async (e) => {
    e.preventDefault();
    const customerName = document.getElementById('customerName').value.trim();
    if (!customerName) {
        alert('Please enter customer name.');
        return;
    }
    const carNumber = document.getElementById('carNumber').value.trim();
    const callerName = document.getElementById('callerName').value.trim();

    const items = [];
    for (const [menu_item, quantity] of Object.entries(selectedItems)) {
        if (quantity > 0) {
            items.push({ menu_item: parseInt(menu_item), quantity });
        }
    }
    if (items.length === 0) {
        alert('Please add at least one menu item.');
        return;
    }

    const payload = {
        customer_name: customerName,
        car_number: carNumber || undefined,
        caller_name: callerName || undefined,
        items: items,
        status: 'pending',
    };

    const url = currentOrderId ? `${API_BASE}/orders/${currentOrderId}/` : `${API_BASE}/orders/`;
    const method = currentOrderId ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            document.getElementById('orderModal').classList.add('hidden');
            window.loadOrders();   // refresh dashboard
        } else {
            const err = await res.json();
            alert('Error: ' + JSON.stringify(err));
        }
    } catch (err) {
        alert('Network error: ' + err.message);
    }
};