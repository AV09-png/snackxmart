const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    customer: {
        firstName: String,
        lastName: String,
        email: {
            type: String,
            required: true
        },
        phone: String,
        address: String,
        city: String,
        province: String,
        postalCode: String
    },
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    payment: {
        method: {
            type: String,
            enum: ['card', 'paypal'],
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        },
        cardLastFour: String
    },
    shipping: {
        method: {
            type: String,
            enum: ['standard', 'express', 'overnight'],
            required: true
        },
        cost: Number,
        status: {
            type: String,
            enum: ['processing', 'shipped', 'delivered'],
            default: 'processing'
        },
        trackingNumber: String
    },
    totals: {
        subtotal: Number,
        tax: Number,
        shipping: Number,
        discount: Number,
        total: Number
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema); 