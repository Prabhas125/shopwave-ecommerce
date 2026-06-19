const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET /api/products - List all products (with optional filters)
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, page = 1, limit = 12 } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (sort === 'price_asc') query += ' ORDER BY price ASC';
        else if (sort === 'price_desc') query += ' ORDER BY price DESC';
        else if (sort === 'name') query += ' ORDER BY name ASC';
        else query += ' ORDER BY created_at DESC';

        // Get total count
        const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, params);
        const total = countResult[0].total;

        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            data: products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Products list error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
});

// GET /api/products/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category'
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }
        res.json({ success: true, data: products[0] });
    } catch (error) {
        console.error('Product detail error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch product.' });
    }
});

module.exports = router;
