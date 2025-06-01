const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { sendOrderNotification, sendOrderConfirmation } = require('../utils/emailService');

// Create new order
router.post('/', async (req, res) => {
    try {
        const orderData = req.body;
        
        // Generate unique order number
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        orderData.orderNumber = orderNumber;

        // Create new order
        const order = new Order(orderData);
        await order.save();

        // Send email notifications
        await Promise.all([
            sendOrderNotification(order),
            sendOrderConfirmation(order)
        ]);

        res.status(201).json({
            success: true,
            orderNumber: order.orderNumber,
            message: 'Order created successfully'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
});

// Get order by order number
router.get('/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
});

// Update order status
router.patch('/:orderNumber/status', async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.status = status;
        await order.save();

        res.json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
});

module.exports = router; 