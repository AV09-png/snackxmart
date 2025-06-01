# X SnackSmart Backend

This is the backend server for the X SnackSmart e-commerce platform. It handles order management, notifications, and admin functionality.

## Features

- Order management system
- Email notifications for new orders
- Admin dashboard with order statistics
- Secure authentication for admin access
- Order tracking and status updates
- Revenue tracking and reporting

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account for sending notifications (or other SMTP service)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/x-snacksmart
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Admin Configuration
ADMIN_EMAIL=store-owner@xsnacksmart.com
ADMIN_PASSWORD=hashed_admin_password_here
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Orders

- `POST /api/orders` - Create a new order
- `GET /api/orders/:orderNumber` - Get order details
- `PATCH /api/orders/:orderNumber/status` - Update order status

### Admin

- `POST /api/admin/login` - Admin login
- `GET /api/admin/orders` - Get all orders (with pagination and filters)
- `GET /api/admin/orders/:orderNumber` - Get order details
- `PATCH /api/admin/orders/:orderNumber` - Update order
- `GET /api/admin/dashboard` - Get dashboard statistics

## Email Notifications

The system sends two types of emails:
1. Order confirmation to customers
2. New order notifications to admin

To set up email notifications:

1. Use a Gmail account or other SMTP service
2. For Gmail:
   - Enable 2-factor authentication
   - Generate an app-specific password
   - Use the app-specific password in the EMAIL_PASS environment variable

## Security

- JWT authentication for admin routes
- Password hashing using bcrypt
- Environment variables for sensitive data
- CORS enabled for frontend communication

## Error Handling

The API returns consistent error responses in the following format:
```json
{
    "success": false,
    "message": "Error description"
}
```

## Development

To run the server in development mode with auto-reload:
```bash
npm run dev
```

## Production

For production deployment:
1. Set appropriate environment variables
2. Use a process manager like PM2
3. Set up proper MongoDB security
4. Use HTTPS
5. Implement rate limiting
6. Set up monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 