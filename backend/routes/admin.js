const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../frontend/public/images')),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'))
});
const upload = multer({ storage });

router.use(requireAdmin);

router.get('/',                    adminController.getDashboard);
router.get('/products',            adminController.getProducts);
router.get('/products/add',        adminController.getAddProduct);
router.post('/products/add',       upload.array('images', 5), adminController.postAddProduct);
router.get('/products/edit/:id',   adminController.getEditProduct);
router.post('/products/edit/:id',  upload.array('images', 5), adminController.postEditProduct);
router.post('/products/delete/:id', adminController.deleteProduct);

router.get('/orders',              adminController.getOrders);
router.post('/orders/:id/status',  adminController.updateOrderStatus);

router.get('/categories',          adminController.getCategories);
router.post('/categories/add',     adminController.postAddCategory);
router.post('/categories/delete/:id', adminController.deleteCategory);

router.get('/logs',                adminController.getLogs);

module.exports = router;
