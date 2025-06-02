// Check if Firebase is initialized
if (typeof firebase === 'undefined') {
    console.error('Firebase is not initialized. Make sure Firebase SDK is loaded.');
}

// Checkout state
let checkoutState = {
    currentStep: 1,
    shippingInfo: null,
    paymentInfo: null,
    cart: null,
    shippingMethod: 'standard',
    shippingCost: 0,
    subtotal: 0,
    tax: 0,
    total: 0
};

// Load cart data
function loadCheckoutData() {
    const savedCart = localStorage.getItem('checkoutCart');
    if (savedCart) {
        checkoutState.cart = JSON.parse(savedCart);
        updateOrderSummary();
    } else {
        window.location.href = 'cart.html';
    }
}

// Update order summary
function updateOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const subtotalElement = document.getElementById('summary-subtotal');
    const shippingElement = document.getElementById('summary-shipping');
    const taxElement = document.getElementById('summary-tax');
    const totalElement = document.getElementById('summary-total');

    // Update items
    summaryItems.innerHTML = checkoutState.cart.items.map(item => `
        <div class="summary-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="summary-item-details">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="summary-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
    `).join('');

    // Calculate totals
    checkoutState.subtotal = checkoutState.cart.subtotal;
    checkoutState.tax = checkoutState.cart.tax;
    
    // Update shipping cost based on method
    const shippingCosts = {
        standard: 0,
        express: 9.99,
        overnight: 19.99
    };
    checkoutState.shippingCost = shippingCosts[checkoutState.shippingMethod];
    
    // Calculate total
    checkoutState.total = checkoutState.subtotal + checkoutState.tax + checkoutState.shippingCost;

    // Update display
    subtotalElement.textContent = `$${checkoutState.subtotal.toFixed(2)}`;
    shippingElement.textContent = checkoutState.shippingCost === 0 ? 'Free' : `$${checkoutState.shippingCost.toFixed(2)}`;
    taxElement.textContent = `$${checkoutState.tax.toFixed(2)}`;
    totalElement.textContent = `$${checkoutState.total.toFixed(2)}`;
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('checkout-notification');
    notification.textContent = message;
    notification.className = `checkout-notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Validate shipping form
function validateShippingForm() {
    const form = document.getElementById('shipping-form');
    const inputs = form.querySelectorAll('input, select');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.required && !input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });
    
    return isValid;
}

// Validate payment form
function validatePaymentForm() {
    const activeMethod = document.querySelector('.payment-method-tab.active').dataset.method;
    
    if (activeMethod === 'paypal') {
        return true; // PayPal will handle its own validation
    }
    
    const form = document.getElementById('payment-form');
    const inputs = form.querySelectorAll('input');
    let isValid = true;
    
    inputs.forEach(input => {
        if (input.required && !input.value.trim()) {
            input.style.borderColor = '#dc3545';
            isValid = false;
        } else {
            input.style.borderColor = '#ddd';
        }
    });
    
    return isValid;
}

// Handle shipping method change
function handleShippingMethodChange(e) {
    checkoutState.shippingMethod = e.target.value;
    updateOrderSummary();
}

// Handle payment method change
function handlePaymentMethodChange(method) {
    const tabs = document.querySelectorAll('.payment-method-tab');
    const contents = document.querySelectorAll('.payment-method-content');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    contents.forEach(content => content.style.display = 'none');
    
    document.querySelector(`[data-method="${method}"]`).classList.add('active');
    document.getElementById(`${method}-payment`).style.display = 'block';
}

// Save shipping information
function saveShippingInfo() {
    const form = document.getElementById('shipping-form');
    checkoutState.shippingInfo = {
        firstName: form.querySelector('#firstName').value,
        lastName: form.querySelector('#lastName').value,
        email: form.querySelector('#email').value,
        phone: form.querySelector('#phone').value,
        address: form.querySelector('#address').value,
        city: form.querySelector('#city').value,
        province: form.querySelector('#province').value,
        postalCode: form.querySelector('#postalCode').value,
        shippingMethod: form.querySelector('#shipping-method').value
    };
}

// Save payment information
function savePaymentInfo() {
    const activeMethod = document.querySelector('.payment-method-tab.active').dataset.method;
    
    if (activeMethod === 'card') {
        checkoutState.paymentInfo = {
            method: 'card',
            cardNumber: document.getElementById('cardNumber').value,
            expiryDate: document.getElementById('expiryDate').value,
            cvv: document.getElementById('cvv').value,
            cardName: document.getElementById('cardName').value
        };
    } else {
        checkoutState.paymentInfo = {
            method: 'paypal'
        };
    }
}

// Update step display
function updateStepDisplay() {
    const sections = ['shipping-section', 'payment-section', 'review-section'];
    const steps = document.querySelectorAll('.step');
    
    sections.forEach((section, index) => {
        const element = document.getElementById(section);
        if (index + 1 === checkoutState.currentStep) {
            element.style.display = 'block';
        } else {
            element.style.display = 'none';
        }
    });
    
    steps.forEach((step, index) => {
        if (index + 1 === checkoutState.currentStep) {
            step.classList.add('active');
        } else if (index + 1 < checkoutState.currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
    
    // Update buttons
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const placeOrderBtn = document.getElementById('place-order-btn');
    
    backBtn.style.display = checkoutState.currentStep === 1 ? 'none' : 'block';
    nextBtn.style.display = checkoutState.currentStep === 3 ? 'none' : 'block';
    placeOrderBtn.style.display = checkoutState.currentStep === 3 ? 'block' : 'none';
    
    if (checkoutState.currentStep === 2) {
        nextBtn.textContent = 'Review Order';
    } else {
        nextBtn.textContent = 'Continue to Payment';
    }
}

// Handle next step
function handleNextStep() {
    if (checkoutState.currentStep === 1) {
        if (!validateShippingForm()) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        saveShippingInfo();
    } else if (checkoutState.currentStep === 2) {
        if (!validatePaymentForm()) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        savePaymentInfo();
        updateReviewSection();
    }
    
    checkoutState.currentStep++;
    updateStepDisplay();
}

// Handle back step
function handleBackStep() {
    checkoutState.currentStep--;
    updateStepDisplay();
}

// Update review section
function updateReviewSection() {
    const shippingSummary = document.getElementById('shipping-summary');
    const paymentSummary = document.getElementById('payment-summary');
    
    // Update shipping summary
    shippingSummary.innerHTML = `
        <p>${checkoutState.shippingInfo.firstName} ${checkoutState.shippingInfo.lastName}</p>
        <p>${checkoutState.shippingInfo.address}</p>
        <p>${checkoutState.shippingInfo.city}, ${checkoutState.shippingInfo.province} ${checkoutState.shippingInfo.postalCode}</p>
        <p>Email: ${checkoutState.shippingInfo.email}</p>
        <p>Phone: ${checkoutState.shippingInfo.phone}</p>
        <p>Shipping Method: ${checkoutState.shippingInfo.shippingMethod}</p>
    `;
    
    // Update payment summary
    if (checkoutState.paymentInfo.method === 'card') {
        const lastFour = checkoutState.paymentInfo.cardNumber.slice(-4);
        paymentSummary.innerHTML = `
            <p>Credit Card ending in ${lastFour}</p>
            <p>Name on Card: ${checkoutState.paymentInfo.cardName}</p>
        `;
    } else {
        paymentSummary.innerHTML = '<p>PayPal</p>';
    }
}

// Handle place order
async function handlePlaceOrder() {
    try {
        console.log('Starting order placement...');
        
        // Show loading state
        const placeOrderBtn = document.getElementById('place-order-btn');
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        // Generate order number
        const orderNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
        console.log('Generated order number:', orderNumber);
        
        // Get cart data
        const cart = JSON.parse(localStorage.getItem('checkoutCart') || '{}');
        console.log('Cart data:', cart);
        
        // Prepare order data
        const orderData = {
            id: orderNumber,
            fullName: `${checkoutState.shippingInfo.firstName} ${checkoutState.shippingInfo.lastName}`,
            email: checkoutState.shippingInfo.email,
            phone: checkoutState.shippingInfo.phone,
            address: `${checkoutState.shippingInfo.address}, ${checkoutState.shippingInfo.city}, ${checkoutState.shippingInfo.province} ${checkoutState.shippingInfo.postalCode}`,
            deliveryInstructions: checkoutState.shippingInfo.deliveryInstructions || '',
            items: cart.items || [],
            total: cart.total || 0,
            subtotal: cart.subtotal || 0,
            tax: cart.tax || 0,
            timestamp: new Date().toISOString(),
            status: 'Pending',
            paymentMethod: checkoutState.paymentInfo.method,
            shippingMethod: checkoutState.shippingInfo.shippingMethod
        };
        
        console.log('Order data prepared:', orderData);

        // Save order to localStorage
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        existingOrders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        console.log('Order saved to localStorage');

        try {
            // Fetch existing orders from the JSON file
            const response = await fetch('/data/orders.json');
            if (!response.ok) {
                throw new Error('Failed to fetch orders file');
            }
            const allOrders = await response.json();
            
            // Add new order
            allOrders.orders.push(orderData);

            // Save updated orders back to the file
            const saveResponse = await fetch('/api/save-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if (!saveResponse.ok) {
                throw new Error('Failed to save order to server');
            }

            console.log('Order saved to server');
        } catch (error) {
            console.error('Error saving order to server:', error);
            // Continue with the order process even if server save fails
        }
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('checkoutCart');
        console.log('Cart cleared from localStorage');
        
        // Show success message
        showNotification('Order placed successfully!', 'success');
        
        // Redirect to order confirmation
        window.location.href = `order-confirmation.html?order=${orderNumber}`;
        
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = 'Place Order <i class="fas fa-check"></i>';
    }
}

// Edit section
function editSection(section) {
    if (section === 'shipping') {
        checkoutState.currentStep = 1;
    } else if (section === 'payment') {
        checkoutState.currentStep = 2;
    }
    updateStepDisplay();
}

// Save customer information
function saveCustomerInfo() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const province = document.getElementById('province').value;
    const postalCode = document.getElementById('postalCode').value;
    const deliveryInstructions = document.getElementById('deliveryInstructions').value;
    
    // Save full address
    const fullAddress = `${address}, ${city}, ${province} ${postalCode}`;
    
    localStorage.setItem('customerName', `${firstName} ${lastName}`);
    localStorage.setItem('customerEmail', email);
    localStorage.setItem('customerPhone', phone);
    localStorage.setItem('customerAddress', fullAddress);
    localStorage.setItem('deliveryInstructions', deliveryInstructions);
}

// Load saved customer info if available
window.addEventListener('load', function() {
    const savedName = localStorage.getItem('customerName');
    const savedEmail = localStorage.getItem('customerEmail');
    const savedPhone = localStorage.getItem('customerPhone');
    const savedAddress = localStorage.getItem('customerAddress');
    const savedInstructions = localStorage.getItem('deliveryInstructions');

    if (savedName) {
        const [firstName, lastName] = savedName.split(' ');
        document.getElementById('firstName').value = firstName || '';
        document.getElementById('lastName').value = lastName || '';
    }
    if (savedEmail) document.getElementById('email').value = savedEmail;
    if (savedPhone) document.getElementById('phone').value = savedPhone;
    if (savedAddress) {
        const addressParts = savedAddress.split(', ');
        if (addressParts.length >= 3) {
            document.getElementById('address').value = addressParts[0];
            document.getElementById('city').value = addressParts[1];
            const provincePostal = addressParts[2].split(' ');
            document.getElementById('province').value = provincePostal[0];
            document.getElementById('postalCode').value = provincePostal[1];
        }
    }
    if (savedInstructions) document.getElementById('deliveryInstructions').value = savedInstructions;
});

// Initialize checkout
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutData();
    updateStepDisplay();
    
    // Add event listeners
    document.getElementById('shipping-method').addEventListener('change', handleShippingMethodChange);
    
    document.querySelectorAll('.payment-method-tab').forEach(tab => {
        tab.addEventListener('click', () => handlePaymentMethodChange(tab.dataset.method));
    });
    
    document.getElementById('next-btn').addEventListener('click', handleNextStep);
    document.getElementById('back-btn').addEventListener('click', handleBackStep);
    document.getElementById('place-order-btn').addEventListener('click', handlePlaceOrder);
    
    // Format card inputs
    const cardNumber = document.getElementById('cardNumber');
    const expiryDate = document.getElementById('expiryDate');
    const cvv = document.getElementById('cvv');
    
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });
    
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        e.target.value = value;
    });
    
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    });
}); 