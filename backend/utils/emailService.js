const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send order notification to admin
const sendOrderNotification = async (order) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmail,
        subject: `New Order Received - #${order.orderNumber}`,
        html: `
            <h2>New Order Received</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.customer.firstName} ${order.customer.lastName}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Total Amount:</strong> $${order.totals.total.toFixed(2)}</p>
            
            <h3>Order Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Item</th>
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Quantity</th>
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">${item.name}</td>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">${item.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3>Shipping Information:</h3>
            <p>${order.customer.address}</p>
            <p>${order.customer.city}, ${order.customer.province} ${order.customer.postalCode}</p>
            <p><strong>Shipping Method:</strong> ${order.shipping.method}</p>

            <h3>Payment Information:</h3>
            <p><strong>Method:</strong> ${order.payment.method}</p>
            ${order.payment.cardLastFour ? `<p><strong>Card ending in:</strong> ${order.payment.cardLastFour}</p>` : ''}

            <p style="margin-top: 20px;">
                <a href="http://localhost:5000/admin/orders/${order.orderNumber}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    View Order Details
                </a>
            </p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order notification email sent to admin');
    } catch (error) {
        console.error('Error sending order notification email:', error);
        throw error;
    }
};

// Send order confirmation to customer
const sendOrderConfirmation = async (order) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customer.email,
        subject: `Order Confirmation - #${order.orderNumber}`,
        html: `
            <h2>Thank You for Your Order!</h2>
            <p>Dear ${order.customer.firstName},</p>
            <p>Your order has been successfully placed. Here are your order details:</p>
            
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            
            <h3>Order Summary:</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Item</th>
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Quantity</th>
                        <th style="padding: 10px; border: 1px solid #dee2e6;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">${item.name}</td>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">${item.quantity}</td>
                            <td style="padding: 10px; border: 1px solid #dee2e6;">$${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <h3>Order Total:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <tr>
                    <td style="padding: 5px;">Subtotal:</td>
                    <td style="padding: 5px; text-align: right;">$${order.totals.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Shipping:</td>
                    <td style="padding: 5px; text-align: right;">$${order.totals.shipping.toFixed(2)}</td>
                </tr>
                <tr>
                    <td style="padding: 5px;">Tax:</td>
                    <td style="padding: 5px; text-align: right;">$${order.totals.tax.toFixed(2)}</td>
                </tr>
                <tr style="font-weight: bold;">
                    <td style="padding: 5px;">Total:</td>
                    <td style="padding: 5px; text-align: right;">$${order.totals.total.toFixed(2)}</td>
                </tr>
            </table>

            <h3>Shipping Information:</h3>
            <p>${order.customer.address}</p>
            <p>${order.customer.city}, ${order.customer.province} ${order.customer.postalCode}</p>
            <p><strong>Shipping Method:</strong> ${order.shipping.method}</p>

            <p style="margin-top: 20px;">
                <a href="http://localhost:3000/track-order/${order.orderNumber}" 
                   style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Track Your Order
                </a>
            </p>

            <p style="margin-top: 20px;">
                If you have any questions about your order, please contact our customer support:
                <br>
                Email: support@xsnacksmart.com
                <br>
                Phone: 1-800-SNACKS
            </p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent to customer');
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
};

module.exports = {
    sendOrderNotification,
    sendOrderConfirmation
}; 