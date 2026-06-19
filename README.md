# ⚡ ShopWave — Full-Stack E-Commerce Application

> A production-ready e-commerce web app built with **Node.js + Express**, **MySQL**, **Vanilla JS**, and **Docker**. Developed as part of the **CodeAlpha Internship Program**.

---

## 📁 Folder Structure

```
ecommerce/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Register / Login / Profile
│   │   ├── products.js          # Product listing & details
│   │   ├── cart.js              # Cart CRUD operations
│   │   └── orders.js            # Checkout & order history
│   ├── .env                     # Environment variables
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                # Express app entry point
│
├── frontend/
│   ├── css/
│   │   └── style.css            # Global design system
│   ├── js/
│   │   └── app.js               # API client, auth helpers, utilities
│   ├── index.html               # Home / product listing page
│   ├── product.html             # Product detail page
│   ├── cart.html                # Shopping cart page
│   ├── login.html               # Login & Register page
│   ├── checkout.html            # Checkout page
│   ├── orders.html              # Order history page
│   ├── nginx.conf               # Nginx reverse proxy config
│   └── Dockerfile
│
├── mysql/
│   └── init.sql                 # Database schema + seed data
│
├── docker-compose.yml           # Orchestrates all 3 services
└── README.md
```

---

## 🗄️ Database Schema

```sql
users        → id, name, email, password, created_at
products     → id, name, description, price, image, stock, category, created_at
cart         → id, user_id, product_id, quantity, created_at
orders       → id, user_id, total_price, status, shipping_address, payment_method, created_at
order_items  → id, order_id, product_id, quantity, price, created_at
```

---

## 🚀 Quick Start (Docker — Recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports **3000**, **5000**, **3306** free on your machine

### Step 1 — Clone the project
```bash
git clone https://github.com/yourusername/shopwave-ecommerce.git
cd shopwave-ecommerce
```

### Step 2 — Launch all services
```bash
docker-compose up --build
```

This single command:
- Starts **MySQL** and seeds it with 12 sample products
- Builds and starts the **Node.js backend** on port 5000
- Builds and starts the **Nginx frontend** on port 3000
- Sets up an internal Docker network between all services

### Step 3 — Open the app
| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000        |
| Backend API | http://localhost:5000/api  |
| API Health | http://localhost:5000/api/health |

### Step 4 — Stop the app
```bash
docker-compose down          # Stop containers
docker-compose down -v       # Stop + remove database volume (fresh start)
```

---

## 🛠️ Local Development (Without Docker)

### Prerequisites
- Node.js 18+
- MySQL 8.0 running locally

### Backend Setup
```bash
cd backend
npm install

# Edit .env with your local MySQL credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=yourpassword

npm run dev     # Starts with nodemon (auto-reload)
```

### Frontend Setup
```bash
# Option 1: VS Code Live Server extension (recommended)
# Open frontend/index.html with Live Server on port 5500

# Option 2: Python simple server
cd frontend
python3 -m http.server 3000

# Option 3: npx
npx serve frontend -p 3000
```

> **Note:** Update `API_BASE` in `frontend/js/app.js` to `http://localhost:5000/api` for local dev.

### Database Setup
```bash
mysql -u root -p < mysql/init.sql
```

---

## 🔌 REST API Reference & Postman Testing

Base URL: `http://localhost:5000/api`

---

### 🔐 Auth Endpoints

#### POST `/api/auth/register` — Create new account
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

Body (raw JSON):
{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "secret123"
}

✅ Success 201:
{
    "success": true,
    "message": "Registration successful.",
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com" }
}

❌ Error 409 (duplicate email):
{ "success": false, "message": "Email already registered." }
```

---

#### POST `/api/auth/login` — Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

Body:
{
    "email": "jane@example.com",
    "password": "secret123"
}

✅ Success 200:
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com" }
}
```

> 💡 **Postman Tip:** Copy the `token` value. In Postman, go to the request's **Authorization** tab → select **Bearer Token** → paste it. All protected endpoints below require this.

---

#### GET `/api/auth/me` — Get profile 🔒
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your_token>

✅ Success 200:
{
    "success": true,
    "user": { "id": 1, "name": "Jane Smith", "email": "jane@example.com", "created_at": "..." }
}
```

---

### 📦 Product Endpoints

#### GET `/api/products` — List all products
```
GET http://localhost:5000/api/products

# With filters (query params):
GET http://localhost:5000/api/products?category=Electronics&sort=price_asc&page=1&limit=6
GET http://localhost:5000/api/products?search=headphones

✅ Success 200:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Wireless Noise-Cancelling Headphones",
            "description": "Premium over-ear...",
            "price": "299.99",
            "image": "https://...",
            "stock": 50,
            "category": "Electronics"
        },
        ...
    ],
    "pagination": { "total": 12, "page": 1, "limit": 12, "pages": 1 }
}

Query Parameters:
  ?category=Electronics     Filter by category
  ?search=headphones        Search name & description
  ?sort=price_asc           price_asc | price_desc | name | (empty = newest)
  ?page=1&limit=6           Pagination
```

---

#### GET `/api/products/:id` — Single product
```
GET http://localhost:5000/api/products/1

✅ Success 200:
{
    "success": true,
    "data": { "id": 1, "name": "...", "price": "299.99", ... }
}

❌ Error 404:
{ "success": false, "message": "Product not found." }
```

---

#### GET `/api/products/categories` — All categories
```
GET http://localhost:5000/api/products/categories

✅ Success 200:
{
    "success": true,
    "data": [
        { "category": "Electronics", "count": 6 },
        { "category": "Accessories", "count": 2 },
        ...
    ]
}
```

---

### 🛒 Cart Endpoints (All require Auth 🔒)

#### GET `/api/cart` — View cart
```
GET http://localhost:5000/api/cart
Authorization: Bearer <token>

✅ Success 200:
{
    "success": true,
    "data": {
        "items": [
            {
                "id": 1,
                "quantity": 2,
                "product_id": 1,
                "name": "Wireless Headphones",
                "price": "299.99",
                "image": "https://...",
                "subtotal": "599.98"
            }
        ],
        "total": 599.98,
        "item_count": 1
    }
}
```

---

#### POST `/api/cart` — Add item to cart
```
POST http://localhost:5000/api/cart
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "product_id": 1,
    "quantity": 2
}

✅ Success 201:
{ "success": true, "message": "Item added to cart." }

❌ Error 400 (out of stock):
{ "success": false, "message": "Insufficient stock." }
```

---

#### PUT `/api/cart/:id` — Update quantity
```
PUT http://localhost:5000/api/cart/1
Authorization: Bearer <token>
Content-Type: application/json

Body:
{ "quantity": 3 }

✅ Success 200:
{ "success": true, "message": "Cart updated." }
```

---

#### DELETE `/api/cart/:id` — Remove one item
```
DELETE http://localhost:5000/api/cart/1
Authorization: Bearer <token>

✅ Success 200:
{ "success": true, "message": "Item removed from cart." }
```

---

#### DELETE `/api/cart` — Clear entire cart
```
DELETE http://localhost:5000/api/cart
Authorization: Bearer <token>

✅ Success 200:
{ "success": true, "message": "Cart cleared." }
```

---

### 📋 Order Endpoints (All require Auth 🔒)

#### POST `/api/orders` — Place order (Checkout)
```
POST http://localhost:5000/api/orders
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
    "shipping_address": {
        "name": "Jane Smith",
        "address": "123 Main Street",
        "city": "New York",
        "zip": "10001",
        "country": "US"
    },
    "payment_method": "card"
}

✅ Success 201:
{
    "success": true,
    "message": "Order placed successfully.",
    "data": {
        "order_id": 1,
        "total": 599.98,
        "status": "pending",
        "item_count": 1
    }
}

❌ Error 400 (empty cart):
{ "success": false, "message": "Cart is empty." }
```

---

#### GET `/api/orders` — Order history
```
GET http://localhost:5000/api/orders
Authorization: Bearer <token>

✅ Success 200:
{
    "success": true,
    "data": [
        {
            "id": 1,
            "total_price": "599.98",
            "status": "pending",
            "item_count": 1,
            "created_at": "2024-01-15T10:30:00.000Z"
        }
    ]
}
```

---

#### GET `/api/orders/:id` — Order details with items
```
GET http://localhost:5000/api/orders/1
Authorization: Bearer <token>

✅ Success 200:
{
    "success": true,
    "data": {
        "id": 1,
        "total_price": "599.98",
        "status": "pending",
        "shipping_address": "{\"name\":\"Jane Smith\",...}",
        "payment_method": "card",
        "items": [
            {
                "id": 1,
                "product_id": 1,
                "name": "Wireless Headphones",
                "image": "https://...",
                "quantity": 2,
                "price": "299.99",
                "subtotal": "599.98"
            }
        ]
    }
}
```

---

#### PATCH `/api/orders/:id/cancel` — Cancel order
```
PATCH http://localhost:5000/api/orders/1/cancel
Authorization: Bearer <token>

✅ Success 200:
{ "success": true, "message": "Order cancelled." }

❌ Error 400 (already shipped):
{ "success": false, "message": "Order cannot be cancelled at this stage." }
```

---

## 🧪 Postman Quick-Start Collection

Import this flow into Postman to test end-to-end:

1. **Register** → `POST /api/auth/register` → save token
2. **Login** → `POST /api/auth/login` → update token
3. **Browse products** → `GET /api/products`
4. **View product** → `GET /api/products/1`
5. **Add to cart** → `POST /api/cart` (product_id: 1, quantity: 2)
6. **View cart** → `GET /api/cart`
7. **Update qty** → `PUT /api/cart/1` (quantity: 3)
8. **Checkout** → `POST /api/orders` with shipping_address
9. **View orders** → `GET /api/orders`
10. **Order detail** → `GET /api/orders/1`

> Set a **Collection Variable** `base_url = http://localhost:5000/api` and `token = <from login>` to reuse across requests.

---

## 🔧 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | 5000 | Backend server port |
| `DB_HOST` | mysql | MySQL host (Docker service name) |
| `DB_PORT` | 3306 | MySQL port |
| `DB_USER` | ecomuser | MySQL username |
| `DB_PASSWORD` | ecompassword | MySQL password |
| `DB_NAME` | ecommerce | Database name |
| `JWT_SECRET` | — | **Change this in production!** |
| `JWT_EXPIRES_IN` | 7d | Token expiry duration |

---

## 🐳 Docker Services Summary

| Service | Image | Port | Purpose |
|---|---|---|---|
| `mysql` | mysql:8.0 | 3306 | Persistent database with seeded products |
| `backend` | node:20-alpine | 5000 | REST API server |
| `frontend` | nginx:alpine | 3000 | Static file server + API proxy |

---

## ✨ Features Implemented

- [x] JWT-based User Registration & Login
- [x] Product listing with search, filter by category, sort, pagination
- [x] Product detail page with quantity selector
- [x] Shopping cart (add / update quantity / remove / clear)
- [x] Transactional checkout with stock validation
- [x] Order history with status tracking
- [x] Order cancellation
- [x] Responsive design (mobile-friendly)
- [x] Docker + Docker Compose full setup
- [x] MySQL schema with foreign keys + seed data
- [x] Nginx reverse proxy for frontend → backend

---

## 🤝 Acknowledgements

Built as part of the **[CodeAlpha](https://www.linkedin.com/company/codealpha/)** Full Stack Development Internship Program.

---

*© 2024 ShopWave — CodeAlpha Internship Project*
