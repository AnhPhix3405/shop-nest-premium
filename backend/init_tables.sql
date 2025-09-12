-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT
);

-- CATEGORIES
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- PRODUCTS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- PRODUCT IMAGES
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- CARTS
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

-- CART ITEMS
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0)
);

-- ORDERS
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,  -- pending, paid, shipped, completed, cancelled
    shipping_address TEXT NOT NULL,
    total_price NUMERIC(12,2) NOT NULL
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    price NUMERIC(12,2) NOT NULL
);

-- PAYMENTS
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,  -- cod, vnpay, stripe...
    amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL   -- pending, success, failed
);

-- REVIEWS
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT
);
