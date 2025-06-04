# SNACKXMART

A modern e-commerce platform for premium global snacks.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snackxmart.git
   cd snackxmart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   - Create a PostgreSQL database named 'snackxmart'
   ```sql
   CREATE DATABASE snackxmart;
   ```
   - The tables will be automatically created when you first run the application

4. **Environment Variables**
   Create a .env file in the root directory with the following variables:
   ```
   PORT=3000
   NODE_ENV=development
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=snackxmart
   DB_USER=your_username
   DB_PASSWORD=your_password
   JWT_SECRET=your_jwt_secret_key
   ```

5. **Run the application**
   ```bash
   npm start
   ```

## Database Schema

The application uses the following tables:

### Customers
- id (SERIAL PRIMARY KEY)
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR)
- phone (VARCHAR)
- address (VARCHAR)
- city (VARCHAR)
- province (VARCHAR)
- postal_code (VARCHAR)
- shipping_method (VARCHAR)
- delivery_instructions (TEXT)
- created_at (TIMESTAMP)

### Orders
- id (SERIAL PRIMARY KEY)
- order_number (VARCHAR)
- customer_id (INTEGER, FOREIGN KEY)
- items (JSONB)
- subtotal (DECIMAL)
- tax (DECIMAL)
- total (DECIMAL)
- shipping_method (VARCHAR)
- payment_method (VARCHAR)
- status (VARCHAR)
- created_at (TIMESTAMP)

## API Endpoints

### Customer Endpoints
- POST /api/save-customer - Save customer information
- GET /api/customer/:id - Get customer details

### Order Endpoints
- POST /api/place-order - Place a new order
- GET /api/order/:id - Get order details
- GET /api/orders - List all orders

## Common Issues and Solutions

1. **Database Connection Issues**
   - Make sure PostgreSQL is running
   - Verify database credentials in .env file
   - Check if database exists and user has proper permissions

2. **Port Already in Use**
   - Change the PORT in .env file
   - Kill the process using the current port

3. **Table Creation Fails**
   - Run the following command to manually create tables:
   ```bash
   node initDb.js
   ```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details 