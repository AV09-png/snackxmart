-- Create Products Table
CREATE TABLE products (
    product_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    brand VARCHAR2(50) NOT NULL,
    price NUMBER(10,2) NOT NULL,
    weight VARCHAR2(20) NOT NULL,
    description VARCHAR2(1000),
    category VARCHAR2(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders Table
CREATE TABLE orders (
    order_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id VARCHAR2(50) NOT NULL,
    total_amount NUMBER(10,2) NOT NULL,
    status VARCHAR2(20) DEFAULT 'pending',
    shipping_address VARCHAR2(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items Table
CREATE TABLE order_items (
    order_item_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id NUMBER NOT NULL,
    product_id NUMBER NOT NULL,
    quantity NUMBER(5) NOT NULL,
    price_at_time NUMBER(10,2) NOT NULL,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(order_id),
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Create Categories Table
CREATE TABLE categories (
    category_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Brands Table
CREATE TABLE brands (
    brand_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE,
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE TRIGGER products_update_trigger
    BEFORE UPDATE ON products
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Sample data insertion
INSERT INTO categories (name, description) VALUES
    ('Chips', 'Various types of potato and corn chips'),
    ('Bhujia', 'Traditional Indian snacks'),
    ('Confectionary', 'Sweet treats and candies'),
    ('Drinks', 'Beverages and drinks'),
    ('Masala', 'Spice mixes and seasonings');

INSERT INTO brands (name, description) VALUES
    ('Balaji', 'Premium Indian snacks manufacturer'),
    ('Kurkure', 'Popular snack brand'),
    ('MDH', 'Traditional Indian spices and seasonings'),
    ('Garvi Gujarat', 'Authentic Gujarati snacks'),
    ('Gokul', 'Quality Indian grocery products');

-- Sample products
INSERT INTO products (name, brand, price, weight, description, category) VALUES
    ('Cream & Onion Chips', 'Balaji', 2.49, '135g', 'Crispy potato chips with cream and onion flavor', 'Chips'),
    ('Classic Bhujia', 'Garvi Gujarat', 3.99, '200g', 'Traditional Gujarati style bhujia', 'Bhujia'),
    ('Masala Munch', 'Kurkure', 1.99, '100g', 'Crunchy corn puffs with Indian spices', 'Chips'),
    ('Garam Masala', 'MDH', 4.99, '100g', 'Blend of ground spices for Indian cuisine', 'Masala'),
    ('Jeera Soda', 'Gokul', 1.49, '300ml', 'Refreshing cumin flavored carbonated drink', 'Drinks');

SELECT table_name, column_name, data_type, data_length
FROM user_tab_columns
WHERE table_name IN ('PRODUCTS', 'CATEGORIES', 'BRANDS', 'ORDERS', 'ORDER_ITEMS')
ORDER BY table_name, column_id; 