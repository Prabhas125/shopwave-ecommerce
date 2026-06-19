-- ============================================
-- E-Commerce Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500) DEFAULT NULL,
    stock INT DEFAULT 100,
    category VARCHAR(100) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_item (user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50) DEFAULT 'card',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ============================================
-- Sample Products Data
-- ============================================
INSERT INTO products (name, description, price, image, stock, category) VALUES
('Wireless Noise-Cancelling Headphones', 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design. Compatible with all Bluetooth devices.', 299.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 50, 'Electronics'),
('Mechanical Keyboard - RGB', 'Compact TKL mechanical keyboard with Cherry MX switches, per-key RGB backlighting, and durable aluminum frame. Perfect for gaming and productivity.', 149.99, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', 75, 'Electronics'),
('Minimalist Leather Wallet', 'Slim bifold wallet crafted from full-grain leather. Features 6 card slots, 2 bill compartments, and RFID blocking technology.', 49.99, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 120, 'Accessories'),
('4K Webcam Pro', 'Professional 4K webcam with autofocus, built-in ring light, noise-cancelling microphone. Ideal for remote work, streaming, and content creation.', 199.99, 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500', 30, 'Electronics'),
('Premium Running Shoes', 'Lightweight performance running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole. Available in multiple colors.', 129.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 60, 'Footwear'),
('Stainless Steel Water Bottle', 'Double-walled vacuum insulated bottle keeps drinks cold 24hrs or hot 12hrs. BPA-free, leak-proof lid, fits most cup holders. 32oz capacity.', 34.99, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 200, 'Lifestyle'),
('Smart Fitness Tracker', 'Advanced fitness band with heart rate monitor, sleep tracking, GPS, and 7-day battery. Water resistant to 50m. Compatible with iOS and Android.', 89.99, 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500', 90, 'Electronics'),
('Portable Bluetooth Speaker', 'Waterproof portable speaker with 360° surround sound, 20-hour playtime, and built-in powerbank. Perfect for outdoor adventures.', 79.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', 45, 'Electronics'),
('Organic Cotton T-Shirt', 'Sustainably made from 100% organic cotton. Features a relaxed fit, pre-shrunk fabric, and reinforced seams. Available in 8 colors, sizes XS-3XL.', 29.99, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 150, 'Clothing'),
('Ceramic Pour-Over Coffee Set', 'Handcrafted ceramic dripper with carafe. Includes stainless steel filter, measure scoop, and linen travel bag. Makes 2-4 cups.', 59.99, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500', 35, 'Kitchen'),
('Laptop Stand Adjustable', 'Ergonomic aluminum laptop stand with 6 height levels, non-slip silicone pads, and foldable design. Compatible with 10–17 inch laptops.', 44.99, 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500', 80, 'Electronics'),
('Scented Soy Candle Set', 'Hand-poured soy wax candles in 3 premium scents: Sandalwood, Vanilla Latte, and Sea Breeze. Each burns for 45+ hours. Gift-ready packaging.', 39.99, 'https://images.unsplash.com/photo-1603905571340-96c2e04b6b5e?w=500', 100, 'Lifestyle');
