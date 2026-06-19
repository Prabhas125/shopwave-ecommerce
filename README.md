<div align="center">

<img src="https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white"/>
<img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
<img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
<img src="https://img.shields.io/badge/Nginx-Alpine-009639?style=for-the-badge&logo=nginx&logoColor=white"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white"/>

# ⚡ ShopWave — Full-Stack E-Commerce Application

**A production-ready e-commerce platform built from scratch — Node.js · MySQL · Docker**

*Built as part of the [CodeAlpha](https://www.linkedin.com/company/codealpha/) Full-Stack Development Internship*

[Live Demo](#-quick-start) · [API Docs](#-api-reference) · [Screenshots](#-screenshots)

</div>

---

## 📌 What is ShopWave?

ShopWave is a **complete, full-stack e-commerce web application** with real user authentication, a live product catalog, a shopping cart, and a transactional checkout system — all containerized with Docker so anyone can run it in one command.

Every layer was built from scratch:
- **Backend REST API** in Node.js + Express with JWT authentication
- **Relational database** in MySQL with foreign keys, transactions, and seed data
- **Vanilla JS frontend** across 6 pages — no React, no framework dependency
- **Docker + Nginx** for containerized deployment and reverse proxying

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 JWT Authentication | Secure register/login with bcrypt password hashing |
| 🛍️ Product Catalog | Search, filter by category, sort by price, pagination |
| 📦 Product Details | Individual product pages with stock status and quantity picker |
| 🛒 Shopping Cart | Add, update quantity, remove, clear — all user-specific |
| 💳 Checkout | Multi-step form with shipping + payment, MySQL transaction |
| 📋 Order History | View past orders, order detail modal, cancel pending orders |
| 🐳 Docker Ready | One command spins up MySQL + Node.js + Nginx |
| 📱 Responsive | Works on mobile, tablet, and desktop |

---

## 🏗️ Tech Stack

```
Frontend        → HTML5 · CSS3 · Vanilla JavaScript
Backend         → Node.js 20 · Express.js 4 · JWT · bcryptjs
Database        → MySQL 8.0
DevOps          → Docker · Docker Compose · Nginx (reverse proxy)
Auth            → JSON Web Tokens (JWT) · bcryptjs (password hashing)
Validation      → express-validator
```

---

## 📁 Project Structure

```
shopwave/
├── backend/
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── routes/
│   │   ├── auth.js            # POST /register  POST /login  GET /me
│   │   ├── products.js        # GET /products   GET /products/:id
│   │   ├── cart.js            # GET/POST/PUT/DELETE /cart
│   │   └── orders.js          # GET/POST /orders  PATCH /orders/:id/cancel
│   ├── server.js              # Express entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── css/style.css          # Complete design system (CSS variables)
│   ├── js/app.js              # API client · auth helpers · cart badge
│   ├── index.html             # Home — product grid with filters
│   ├── product.html           # Product detail page
│   ├── cart.html              # Shopping cart
│   ├── login.html             # Tabbed login + register
│   ├── checkout.html          # Checkout + success screen
│   ├── orders.html            # Order history + detail modal
│   ├── nginx.conf             # Reverse proxy config
│   └── Dockerfile
│
├── mysql/
│   └── init.sql               # Schema + 12 seeded products
│
├── docker-compose.yml
└── README.md
```

---

## 🗄️ Database Schema

```sql
users       (id, name, email, password_hash, created_at)
products    (id, name, description, price, image, stock, category)
cart        (id, user_id→users, product_id→products, quantity)
orders      (id, user_id→users, total_price, status, shipping_address, payment_method)
order_items (id, order_id→orders, product_id→products, quantity, price)
```

> Relationships use **foreign keys with CASCADE** — deleting a user cleans up their cart and orders automatically.

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Ports **3000**, **5000**, **3306** available

### Run in 3 steps

```bash
# 1. Clone the repo
git clone https://github.com/Prabhas125/shopwave-ecommerce.git
cd shopwave-ecommerce

# 2. Start everything
docker-compose up --build

# 3. Open the app
# Frontend  →  http://localhost:3000
# API       →  http://localhost:5000/api
# Health    →  http://localhost:5000/api/health
```

> MySQL is automatically initialized with the schema and 12 sample products on first run.

### Stop the app

```bash
docker-compose down        # stop containers
docker-compose down -v     # stop + wipe database (fresh start)
```

---

## 🔌 API Reference

All endpoints are prefixed with `/api`. Protected routes require:
```
Authorization: Bearer <jwt_token>
```

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Create new account |
| POST | `/auth/login` | ❌ | Login, receive JWT |
| GET | `/auth/me` | ✅ | Get current user profile |

**Register body:**
```json
{ "name": "Prabhas", "email": "you@example.com", "password": "secret123" }
```

**Login response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "id": 1, "name": "Prabhas", "email": "you@example.com" }
}
```

---

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | ❌ | List all (supports ?search, ?category, ?sort, ?page) |
| GET | `/products/:id` | ❌ | Single product detail |
| GET | `/products/categories` | ❌ | All categories with counts |

**Query params:**
```
?search=headphones          search name + description
?category=Electronics       filter by category
?sort=price_asc             price_asc · price_desc · name
?page=1&limit=12            pagination
```

---

### Cart (🔒 requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/cart` | Get cart with subtotals and total |
| POST | `/cart` | Add item `{ product_id, quantity }` |
| PUT | `/cart/:id` | Update quantity `{ quantity }` |
| DELETE | `/cart/:id` | Remove one item |
| DELETE | `/cart` | Clear entire cart |

---

### Orders (🔒 requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Checkout — creates order from cart |
| GET | `/orders` | All user orders with item count |
| GET | `/orders/:id` | Order detail with all items |
| PATCH | `/orders/:id/cancel` | Cancel pending/processing order |

**Checkout body:**
```json
{
  "shipping_address": {
    "name": "Prabhas",
    "address": "123 Main St",
    "city": "Hyderabad",
    "zip": "500001",
    "country": "IN"
  },
  "payment_method": "card"
}
```

---

## 🧠 How Key Features Work

### JWT Authentication Flow
```
User submits credentials
        ↓
Backend validates email exists + bcrypt.compare(password, hash)
        ↓
jwt.sign({ id, email, name }, SECRET, { expiresIn: '7d' })
        ↓
Token sent to frontend → stored in localStorage
        ↓
Every request: Authorization: Bearer <token>
        ↓
auth middleware → jwt.verify(token, SECRET) → req.user = decoded
```

### Transactional Checkout
```
POST /api/orders
        ↓
BEGIN TRANSACTION
        ↓
1. Validate all cart items have stock
2. Calculate total
3. INSERT into orders
4. INSERT into order_items (one row per product)
5. UPDATE products SET stock = stock - quantity
6. DELETE FROM cart WHERE user_id = ?
        ↓
COMMIT (all succeed) or ROLLBACK (anything fails)
```

> This prevents stock being deducted without an order being created, or orders being created without stock being reduced.

---

## 🌐 Environment Variables

Edit `backend/.env` or pass via `docker-compose.yml`:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend port |
| `DB_HOST` | `mysql` | MySQL host (Docker service name) |
| `DB_USER` | `ecomuser` | MySQL user |
| `DB_PASSWORD` | `ecompassword` | MySQL password |
| `DB_NAME` | `ecommerce` | Database name |
| `JWT_SECRET` | — | ⚠️ Change before deploying to production |
| `JWT_EXPIRES_IN` | `7d` | Token lifespan |

---

## 🐳 Docker Services

| Service | Image | Port | Role |
|---|---|---|---|
| `mysql` | mysql:8.0 | 3306 | Database with auto-init |
| `backend` | node:20-alpine | 5000 | REST API server |
| `frontend` | nginx:alpine | 3000 | Static files + API proxy |

---

## 👨‍💻 Author

**Prabhas**
GitHub: [@Prabhas125](https://github.com/Prabhas125)

---

## 🏆 Acknowledgements

Built as part of the **[CodeAlpha](https://www.linkedin.com/company/codealpha/) Full-Stack Development Internship Program**.

---

<div align="center">

⭐ If this project helped you, please give it a star!

</div>
