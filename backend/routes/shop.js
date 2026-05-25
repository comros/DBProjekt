const express = require('express');
const router  = express.Router();
const shopController  = require('../controllers/shopController');
const { requireLogin } = require('../middleware/auth');

router.get('/',          shopController.getHome);
router.get('/products',  shopController.getProducts);
router.get('/product/:slug', shopController.getProduct);

router.get('/cart',      shopController.getCart);
router.post('/cart/add', shopController.addToCart);
router.post('/cart/remove', shopController.removeFromCart);

router.post('/product/:slug/review', requireLogin, shopController.postReview);

module.exports = router;
