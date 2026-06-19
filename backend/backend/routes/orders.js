const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// GET /api/orders - Get user's orders
router.get('/', async (req, res) => {
    try {
        const [orders] = await db.execute(`
            SELECT o.*, 
                COUNT(oi.id) as item_count
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [req.user.id]);

        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
    }
});

// GET /api/orders/:id - Get specific order with items
router.get('/:id', async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const [items] = await db.execute(`
            SELECT oi.*, p.name, p.image, p.description,
                (oi.price * oi.quantity) as subtotal
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [req.params.id]);

        res.json({
            success: true,
            data: { ...orders[0], items }
        });
    } catch (error) {
        console.error('Order detail error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch order.' });
    }
});

// POST /api/orders - Create order (checkout)
router.post('/', async (req, res) => {
    const { shipping_address, payment_method = 'card' } = req.body;

    if (!shipping_address) {
        return res.status(400).json({ success: false, message: 'Shipping address is required.' });
    }

    const connection = await require('../config/database').getConnection();

    try {
        await connection.beginTransaction();

        // Get user's cart
        const [cartItems] = await connection.execute(`
            SELECT c.*, p.price, p.name, p.stock
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [req.user.id]);

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Cart is empty.' });
        }

        // Validate stock
        for (const item of cartItems) {
            if (item.stock < item.quantity) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${item.name}". Only ${item.stock} left.`
                });
            }
        }

        // Calculate total
        const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        // Create order
        const [orderResult] = await connection.execute(
            'INSERT INTO orders (user_id, total_price, status, shipping_address, payment_method) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, total.toFixed(2), 'pending', JSON.stringify(shipping_address), payment_method]
        );

        const orderId = orderResult.insertId;

        // Insert order items & update stock
        for (const item of cartItems) {
            await connection.execute(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );

            await connection.execute(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }

        // Clear cart
        await connection.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await connection.commit();

        res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            data: {
                order_id: orderId,
                total: parseFloat(total.toFixed(2)),
                status: 'pending',
                item_count: cartItems.length
            }
        });
    } catch (error) {
        await connection.rollback();
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Checkout failed. Please try again.' });
    } finally {
        connection.release();
    }
});

// PATCH /api/orders/:id/cancel - Cancel an order
router.patch('/:id/cancel', async (req, res) => {
    try {
        const [orders] = await db.execute(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        if (!['pending', 'processing'].includes(orders[0].status)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage.'
            });
        }

        await db.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['cancelled', req.params.id]
        );

        res.json({ success: true, message: 'Order cancelled.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to cancel order.' });
    }
});

module.exports = router;
