// Cart state management
let cart = {
    items: [],
    total: 0,
    count: 0,
    subtotal: 0,
    tax: 0,
    promoCode: null,
    promoDiscount: 0
};

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        renderCartPage();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

// Add item to cart
function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice,
            image: product.image,
            brand: product.brand,
            weight: product.weight,
            quantity: 1
        });
    }
    
    updateCartTotal();
    saveCart();
    showNotification('Item added to cart!');
}

// Remove item from cart
function removeFromCart(productId) {
    cart.items = cart.items.filter(item => item.id !== productId);
    updateCartTotal();
    saveCart();
    renderCartPage();
    showNotification('Item removed from cart');
}

// Update item quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.items.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(newQuantity));
        updateCartTotal();
        saveCart();
        renderCartPage();
    }
}

// Calculate cart totals
function updateCartTotal() {
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.tax = cart.subtotal * 0.13;
    cart.total = cart.subtotal + cart.tax - cart.promoDiscount;
    cart.count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

// Update cart display
function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = `${cart.count} ${cart.count === 1 ? 'Item' : 'Items'}`;
    }

    // Update summary amounts
    const subtotalAmount = document.querySelector('.subtotal-amount');
    const taxAmount = document.querySelector('.tax-amount');
    const totalAmount = document.querySelector('.total-amount');

    if (subtotalAmount) subtotalAmount.textContent = `$${cart.subtotal.toFixed(2)}`;
    if (taxAmount) taxAmount.textContent = `$${cart.tax.toFixed(2)}`;
    if (totalAmount) totalAmount.textContent = `$${cart.total.toFixed(2)}`;

    // Show/hide empty cart message
    const cartEmpty = document.querySelector('.cart-empty');
    const cartItems = document.querySelector('.cart-items');
    
    if (cartEmpty && cartItems) {
        if (cart.items.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartItems.style.display = 'block';
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('cartNotification');
    if (notification) {
        notification.textContent = message;
        notification.className = `cart-notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart.items = [];
        cart.promoCode = null;
        cart.promoDiscount = 0;
        updateCartTotal();
        saveCart();
        renderCartPage();
        showNotification('Cart cleared');
    }
}

// Save cart for later
function saveCartForLater() {
    const savedCarts = JSON.parse(localStorage.getItem('savedCarts') || '[]');
    savedCarts.push({
        date: new Date().toISOString(),
        items: cart.items
    });
    localStorage.setItem('savedCarts', JSON.stringify(savedCarts));
    showNotification('Cart saved for later');
}

// Share cart
function shareCart() {
    // Create a shareable link or code
    const shareableCart = btoa(JSON.stringify(cart.items));
    // Copy to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/cart.html?share=${shareableCart}`)
        .then(() => {
            showNotification('Cart link copied to clipboard!');
        })
        .catch(() => {
            showNotification('Failed to copy cart link', 'error');
        });
}

// Apply promo code
function applyPromoCode() {
    const promoInput = document.getElementById('promoCode');
    const promoMessage = document.querySelector('.promo-message');
    const code = promoInput.value.trim().toUpperCase();

    // Example promo codes
    const promoCodes = {
        'WELCOME10': { discount: 0.10, message: '10% off applied!' },
        'SAVE20': { discount: 0.20, message: '20% off applied!' },
        'FREESHIP': { discount: 0, message: 'Free shipping applied!' }
    };

    if (promoCodes[code]) {
        cart.promoCode = code;
        cart.promoDiscount = cart.subtotal * promoCodes[code].discount;
        updateCartTotal();
        saveCart();
        renderCartPage();
        promoMessage.textContent = promoCodes[code].message;
        promoMessage.className = 'promo-message success';
        showNotification('Promo code applied successfully!');
    } else {
        promoMessage.textContent = 'Invalid promo code';
        promoMessage.className = 'promo-message error';
        showNotification('Invalid promo code', 'error');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (cart.items.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    // Save cart state
    localStorage.setItem('checkoutCart', JSON.stringify(cart));

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = cart.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-brand">${item.brand}</p>
                <p class="item-weight">${item.weight}</p>
            </div>
            <div class="item-quantity">
                <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="quantity-btn">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" value="${item.quantity}" min="1" 
                    onchange="updateQuantity('${item.id}', this.value)">
                <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="quantity-btn">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="item-price">
                <span class="current-price">$${(item.price * item.quantity).toFixed(2)}</span>
                ${item.originalPrice ? `
                    <span class="original-price">$${(item.originalPrice * item.quantity).toFixed(2)}</span>
                ` : ''}
            </div>
            <button onclick="removeFromCart('${item.id}')" class="remove-item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Render cart page
function renderCartPage() {
    const cartItems = document.querySelector('.cart-items');
    const cartCount = document.querySelector('.cart-header .cart-count');
    const subtotalSpan = document.querySelector('.summary-row:first-child span:last-child');
    const taxSpan = document.querySelector('.summary-row:nth-child(3) span:last-child');
    const totalSpan = document.querySelector('.summary-total span:last-child');
    
    if (!cartItems) return;
    
    // Update cart count
    cartCount.textContent = `${cart.count} Items`;
    
    // Clear existing items
    cartItems.innerHTML = '';
    
    // Render each item
    cart.items.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h3>${item.name}</h3>
                <p class="item-brand">${item.brand}</p>
                <p class="item-weight">${item.weight}</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <input type="number" value="${item.quantity}" min="1" max="99" 
                    onchange="updateQuantity('${item.id}', this.value)">
                <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            <div class="item-price">
                <span class="current-price">$${item.price.toFixed(2)}</span>
                ${item.originalPrice ? `<span class="original-price">$${item.originalPrice.toFixed(2)}</span>` : ''}
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Update summary
    const subtotal = cart.total;
    const tax = subtotal * 0.13;
    const total = subtotal + tax;
    
    subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
    taxSpan.textContent = `$${tax.toFixed(2)}`;
    totalSpan.textContent = `$${total.toFixed(2)}`;
}

// Initialize cart functionality
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    
    // Check for shared cart in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCart = urlParams.get('share');
    
    if (sharedCart) {
        try {
            const sharedItems = JSON.parse(atob(sharedCart));
            cart.items = sharedItems;
            updateCartTotal();
            saveCart();
            showNotification('Shared cart loaded successfully!');
        } catch (error) {
            showNotification('Invalid shared cart link', 'error');
        }
    }
    
    // Initialize cart page if we're on it
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
    
    // Add to cart buttons on product pages
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            const product = {
                id: productCard.dataset.productId,
                name: productCard.querySelector('h4').textContent,
                price: parseFloat(productCard.querySelector('.current-price').textContent.replace('$', '')),
                originalPrice: productCard.querySelector('.original-price') ? 
                    parseFloat(productCard.querySelector('.original-price').textContent.replace('$', '')) : null,
                image: productCard.querySelector('img').src,
                brand: productCard.dataset.brand,
                weight: productCard.dataset.weight
            };
            addToCart(product);
        });
    });
}); 