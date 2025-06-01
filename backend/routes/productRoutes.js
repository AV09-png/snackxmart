const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { body, param } = require('express-validator');

// Validation middleware
const validateProduct = [
    body('name').notEmpty().trim().escape(),
    body('brand').notEmpty().trim().escape(),
    body('price').isFloat({ min: 0 }),
    body('weight').notEmpty().trim().escape(),
    body('description').trim().escape(),
    body('category').notEmpty().trim().escape()
];

// Routes
router.get('/', productController.getAllProducts);
router.get('/:id', param('id').isInt(), productController.getProductById);
router.post('/', validateProduct, productController.createProduct);
router.put('/:id', [param('id').isInt(), ...validateProduct], productController.updateProduct);
router.delete('/:id', param('id').isInt(), productController.deleteProduct);

module.exports = router; 