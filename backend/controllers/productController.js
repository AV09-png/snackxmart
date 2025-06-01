const db = require('../config/database');
const oracledb = require('oracledb');

const productController = {
    // Get all products with brand and category details
    async getAllProducts(req, res) {
        let connection;
        try {
            connection = await db.getConnection();
            const result = await connection.execute(
                `SELECT p.*, b.name as brand_name, c.name as category_name 
                 FROM products p 
                 LEFT JOIN brands b ON p.brand = b.name
                 LEFT JOIN categories c ON p.category = c.name`,
                [],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            res.json(result.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error fetching products' });
        } finally {
            if (connection) {
                await db.closeConnection(connection);
            }
        }
    },

    // Get product by ID
    async getProductById(req, res) {
        let connection;
        try {
            const { id } = req.params;
            connection = await db.getConnection();
            const result = await connection.execute(
                `SELECT p.*, b.name as brand_name, c.name as category_name 
                 FROM products p 
                 LEFT JOIN brands b ON p.brand = b.name
                 LEFT JOIN categories c ON p.category = c.name
                 WHERE p.product_id = :id`,
                [id],
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error fetching product' });
        } finally {
            if (connection) {
                await db.closeConnection(connection);
            }
        }
    },

    // Create new product
    async createProduct(req, res) {
        let connection;
        try {
            const { name, brand, price, weight, description, category } = req.body;
            connection = await db.getConnection();
            
            // Verify brand exists
            const brandCheck = await connection.execute(
                'SELECT name FROM brands WHERE name = :brand',
                [brand]
            );
            if (brandCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid brand' });
            }

            // Verify category exists
            const categoryCheck = await connection.execute(
                'SELECT name FROM categories WHERE name = :category',
                [category]
            );
            if (categoryCheck.rows.length === 0) {
                return res.status(400).json({ error: 'Invalid category' });
            }
            
            const result = await connection.execute(
                `INSERT INTO products (name, brand, price, weight, description, category) 
                 VALUES (:name, :brand, :price, :weight, :description, :category)
                 RETURNING product_id INTO :id`,
                {
                    name, brand, price, weight, description, category,
                    id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
                },
                { autoCommit: true }
            );
            
            res.status(201).json({ 
                message: 'Product created successfully',
                productId: result.outBinds.id[0]
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error creating product' });
        } finally {
            if (connection) {
                await db.closeConnection(connection);
            }
        }
    },

    // Update product
    async updateProduct(req, res) {
        let connection;
        try {
            const { id } = req.params;
            const { name, brand, price, weight, description, category } = req.body;
            
            connection = await db.getConnection();

            // Verify brand exists
            if (brand) {
                const brandCheck = await connection.execute(
                    'SELECT name FROM brands WHERE name = :brand',
                    [brand]
                );
                if (brandCheck.rows.length === 0) {
                    return res.status(400).json({ error: 'Invalid brand' });
                }
            }

            // Verify category exists
            if (category) {
                const categoryCheck = await connection.execute(
                    'SELECT name FROM categories WHERE name = :category',
                    [category]
                );
                if (categoryCheck.rows.length === 0) {
                    return res.status(400).json({ error: 'Invalid category' });
                }
            }
            
            const result = await connection.execute(
                `UPDATE products 
                 SET name = :name, 
                     brand = :brand, 
                     price = :price, 
                     weight = :weight, 
                     description = :description, 
                     category = :category
                 WHERE product_id = :id`,
                [name, brand, price, weight, description, category, id],
                { autoCommit: true }
            );
            
            if (result.rowsAffected === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json({ message: 'Product updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error updating product' });
        } finally {
            if (connection) {
                await db.closeConnection(connection);
            }
        }
    },

    // Delete product
    async deleteProduct(req, res) {
        let connection;
        try {
            const { id } = req.params;
            connection = await db.getConnection();
            
            // Check if product is referenced in order_items
            const orderCheck = await connection.execute(
                'SELECT 1 FROM order_items WHERE product_id = :id',
                [id]
            );
            
            if (orderCheck.rows.length > 0) {
                return res.status(400).json({ 
                    error: 'Cannot delete product as it is referenced in orders' 
                });
            }
            
            const result = await connection.execute(
                'DELETE FROM products WHERE product_id = :id',
                [id],
                { autoCommit: true }
            );
            
            if (result.rowsAffected === 0) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            res.json({ message: 'Product deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error deleting product' });
        } finally {
            if (connection) {
                await db.closeConnection(connection);
            }
        }
    }
};

module.exports = productController; 