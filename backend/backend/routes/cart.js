const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// All cart routes require authentication
router.use(authMiddleware);

// GET /api/cart - Get user's cart
router.get('/', async (req, res) => {
    try {
        const [items] = await db.execute(`
            SELECT 
                c.id, c.quantity, c.created_at,
                p.id as product_id, p.name, p.price, p.image, p.stock, p.description,
                (p.price * c.quantity) as subtotal
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `, [req.user.id]);

        const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.json({
            success: true,
            data: {
                items,
                total: parseFloat(total.toFixed(2)),
                item_count: items.length
            }
        });
    } catch (error) {
        console.error('Cart fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
    }
});

// POST /api/cart - Add item to cart
router.post('/', async (req, res) => {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
        return res.status(400).json({ success: false, message: 'product_id is required.' });
    }

    try {
        // Check product exists and has stock
        const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const product = products[0];
        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock.' });
        }

        // Upsert cart item
        await db.execute(`
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)
        `, [req.user.id, product_id, quantity]);

        res.status(201).json({
            success: true,
            message: 'Item added to cart.'
        });
    } catch (error) {
        console.error('Cart add error:', error);
        res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
    }
});

// PUT /api/cart/:id - Update cart item quantity
router.put('/:id', async (req, res) => {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
    }

    try {
        const [result] = await db.execute(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }

        res.json({ success: true, message: 'Cart updated.' });
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart.' });
    }
});

// DELETE /api/cart/:id - Remove item from cart
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM cart WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }

        res.json({ success: true, message: 'Item removed from cart.' });
    } catch (error) {
        console.error('Cart remove error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove item.' });
    }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', async (req, res) => {
    try {
        await db.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        res.json({ success: true, message: 'Cart cleared.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to clear cart.' });
    }
});

module.exports = router;
