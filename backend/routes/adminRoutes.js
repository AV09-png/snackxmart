const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Middleware to verify admin token
const verifyAdminToken = (req, res, next) => {
    const token = req.header('x-auth-token');
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

// Admin login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if email matches admin email
        if (email !== process.env.ADMIN_EMAIL) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if password matches admin password
        const isValidPassword = await bcrypt.compare(password, process.env.ADMIN_PASSWORD);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { email: process.env.ADMIN_EMAIL },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in'
        });
    }
});

// Get all orders with pagination and filters
router.get('/orders', verifyAdminToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Get total count
        const total = await Order.countDocuments(query);

        // Get orders
        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        res.json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// Get order details
router.get('/orders/:orderNumber', verifyAdminToken, async (req, res) => {
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
            message: 'Error fetching order details'
        });
    }
});

// Update order status
router.patch('/orders/:orderNumber', verifyAdminToken, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await Order.findOne({ orderNumber: req.params.orderNumber });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (status) order.status = status;
        if (trackingNumber) order.shipping.trackingNumber = trackingNumber;
        
        await order.save();

        res.json({
            success: true,
            message: 'Order updated successfully',
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order'
        });
    }
});

// Get dashboard statistics
router.get('/dashboard', verifyAdminToken, async (req, res) => {
    try {
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get start of current month
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Calculate statistics
        const [
            totalOrders,
            todayOrders,
            monthlyOrders,
            pendingOrders,
            processingOrders,
            shippedOrders,
            deliveredOrders
        ] = await Promise.all([
            Order.countDocuments(),
            Order.countDocuments({ createdAt: { $gte: today } }),
            Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
            Order.countDocuments({ status: 'pending' }),
            Order.countDocuments({ status: 'processing' }),
            Order.countDocuments({ status: 'shipped' }),
            Order.countDocuments({ status: 'delivered' })
        ]);

        // Calculate revenue
        const revenueStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$totals.total' },
                    monthlyRevenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$createdAt', startOfMonth] },
                                '$totals.total',
                                0
                            ]
                        }
                    },
                    dailyRevenue: {
                        $sum: {
                            $cond: [
                                { $gte: ['$createdAt', today] },
                                '$totals.total',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const revenue = revenueStats[0] || {
            totalRevenue: 0,
            monthlyRevenue: 0,
            dailyRevenue: 0
        };

        res.json({
            success: true,
            statistics: {
                orders: {
                    total: totalOrders,
                    today: todayOrders,
                    monthly: monthlyOrders
                },
                status: {
                    pending: pendingOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders
                },
                revenue: {
                    total: revenue.totalRevenue,
                    monthly: revenue.monthlyRevenue,
                    daily: revenue.dailyRevenue
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

module.exports = router; 