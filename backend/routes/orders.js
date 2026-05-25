const express = require('express');
const router  = express.Router();
const orderController = require('../controllers/orderController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

router.get('/checkout', orderController.getCheckout);
router.post('/checkout', orderController.postCheckout);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;
