// ─── API Configuration ────────────────────────────────────────────────────────
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';

// ─── Token Management ─────────────────────────────────────────────────────────
const Auth = {
    getToken: () => localStorage.getItem('token'),
    getUser: () => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    },
    setAuth: (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
    clear: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    isLoggedIn: () => !!localStorage.getItem('token')
};

// ─── API Fetch Helper ─────────────────────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
        const data = await res.json();
        if (res.status === 401) {
            Auth.clear();
            updateNav();
        }
        return { ok: res.ok, status: res.status, data };
    } catch (err) {
        return { ok: false, data: { message: 'Network error. Is the backend running?' } };
    }
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── Cart Badge ───────────────────────────────────────────────────────────────
async function updateCartBadge() {
    if (!Auth.isLoggedIn()) return;
    const { ok, data } = await apiFetch('/cart');
    if (ok) {
        const badge = document.getElementById('cart-badge');
        if (badge) badge.textContent = data.data.item_count || '';
    }
}

// ─── Nav State ────────────────────────────────────────────────────────────────
function updateNav() {
    const user = Auth.getUser();
    const navAuth = document.getElementById('nav-auth');
    const navUser = document.getElementById('nav-user');
    const navCart = document.getElementById('nav-cart');

    if (navCart) navCart.style.display = Auth.isLoggedIn() ? 'flex' : 'none';

    if (Auth.isLoggedIn() && user) {
        if (navAuth) navAuth.style.display = 'none';
        if (navUser) {
            navUser.style.display = 'flex';
            const nameEl = navUser.querySelector('.user-name');
            if (nameEl) nameEl.textContent = user.name.split(' ')[0];
        }
    } else {
        if (navAuth) navAuth.style.display = 'flex';
        if (navUser) navUser.style.display = 'none';
    }
    updateCartBadge();
}

function logout() {
    Auth.clear();
    updateNav();
    showToast('Logged out successfully');
    setTimeout(() => window.location.href = '/index.html', 800);
}

// ─── Product Card Builder ─────────────────────────────────────────────────────
function buildProductCard(p) {
    return `
        <div class="product-card" onclick="window.location.href='/product.html?id=${p.id}'">
            <div class="product-img-wrap">
                <img src="${p.image || 'https://via.placeholder.com/400x300?text=No+Image'}" 
                     alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <span class="product-badge">${p.category}</span>
            </div>
            <div class="product-info">
                <h3 class="product-name">${p.name}</h3>
                <p class="product-desc">${p.description ? p.description.substring(0, 80) + '...' : ''}</p>
                <div class="product-footer">
                    <span class="product-price">$${parseFloat(p.price).toFixed(2)}</span>
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart(${p.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>`;
}

// ─── Add to Cart ──────────────────────────────────────────────────────────────
async function addToCart(productId, quantity = 1) {
    if (!Auth.isLoggedIn()) {
        showToast('Please login to add items to cart', 'info');
        setTimeout(() => window.location.href = '/login.html', 1000);
        return;
    }

    const { ok, data } = await apiFetch('/cart', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity })
    });

    if (ok) {
        showToast('Added to cart!');
        updateCartBadge();
    } else {
        showToast(data.message || 'Failed to add to cart', 'error');
    }
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
    updateNav();
});
