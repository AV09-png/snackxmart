# X SnackSmart

A modern e-commerce platform for premium global snacks.

## Features

- Browse and search global snacks
- Shopping cart functionality
- Order placement
- Responsive design
- Category filtering
- Product discounts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The application will be available at http://localhost:3000

## Project Structure

```
x-snacksmart/
├── public/
│   ├── index.html
│   ├── styles.css
│   ├── images/
│   └── js/
│       ├── products.js
│       └── cart.js
├── data/
│   ├── products.json
│   ├── orders/
│   └── carts/
└── server.js
```

## API Endpoints

- `GET /api/products` - Get all products
- `GET /api/cart/:userId` - Get user's cart
- `POST /api/cart/:userId` - Update user's cart
- `POST /api/orders` - Place a new order
- `GET /api/orders/:orderId` - Get order details

## Technologies Used

- Node.js
- Express.js
- Vanilla JavaScript
- HTML5
- CSS3
- Font Awesome Icons

## Development

1. The server uses a file-based storage system for simplicity
2. Cart and order data are stored in JSON files
3. Static files are served from the `public` directory

## License

MIT 