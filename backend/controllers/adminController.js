const Product     = require('../models/mongo/Product');
const ActivityLog = require('../models/mongo/ActivityLog');
const { Order, OrderItem, Payment, Category, User } = require('../models/pg/index');
const log = require('../middleware/logger');

// DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalProducts, recentOrders] = await Promise.all([
      Order.count(),
      User.count(),
      Product.countDocuments({ is_active: true }),
      Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [{ association: 'user' }]
      })
    ]);
    res.render('admin/dashboard', {
      title: 'Panel admina',
      totalOrders, totalUsers, totalProducts, recentOrders
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Błąd dashboardu.' });
  }
};

// PRODUKTY
exports.getProducts = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  const categories = await Category.findAll();
  res.render('admin/products', { title: 'Produkty — admin', products, categories });
};

exports.getAddProduct = async (req, res) => {
  const categories = await Category.findAll();
  res.render('admin/product-form', { title: 'Dodaj produkt', product: null, categories });
};

exports.postAddProduct = async (req, res) => {
  const { name, slug, description, price, stock, category_id, attributes_keys, attributes_vals } = req.body;
  try {
    const attrs = {};
    if (attributes_keys) {
      const keys = Array.isArray(attributes_keys) ? attributes_keys : [attributes_keys];
      const vals = Array.isArray(attributes_vals) ? attributes_vals : [attributes_vals];
      keys.forEach((k, i) => { if (k.trim()) attrs[k.trim()] = vals[i]?.trim() || ''; });
    }

    const images = req.files ? req.files.map(f => '/images/' + f.filename) : [];

    await Product.create({
      name, slug, description, price: parseFloat(price),
      stock: parseInt(stock), category_id: parseInt(category_id),
      images, attributes: attrs
    });

    await log(req, 'admin_add_product', { slug });
    req.flash('success', 'Produkt dodany.');
    res.redirect('/admin/products');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Błąd dodawania produktu: ' + err.message);
    res.redirect('/admin/products/add');
  }
};

exports.getEditProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  const categories = await Category.findAll();
  if (!product) return res.redirect('/admin/products');
  res.render('admin/product-form', { title: 'Edytuj produkt', product, categories });
};

exports.postEditProduct = async (req, res) => {
  const { name, slug, description, price, stock, category_id, attributes_keys, attributes_vals, is_active } = req.body;
  try {
    const attrs = {};
    if (attributes_keys) {
      const keys = Array.isArray(attributes_keys) ? attributes_keys : [attributes_keys];
      const vals = Array.isArray(attributes_vals) ? attributes_vals : [attributes_vals];
      keys.forEach((k, i) => { if (k.trim()) attrs[k.trim()] = vals[i]?.trim() || ''; });
    }

    await Product.findByIdAndUpdate(req.params.id, {
      name, slug, description,
      price: parseFloat(price), stock: parseInt(stock),
      category_id: parseInt(category_id),
      attributes: attrs,
      is_active: is_active === 'on'
    });

    await log(req, 'admin_edit_product', { id: req.params.id });
    req.flash('success', 'Produkt zaktualizowany.');
    res.redirect('/admin/products');
  } catch (err) {
    req.flash('error', 'Błąd edycji: ' + err.message);
    res.redirect('back');
  }
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { is_active: false });
  await log(req, 'admin_delete_product', { id: req.params.id });
  req.flash('success', 'Produkt usunięty.');
  res.redirect('/admin/products');
};

// ZAMÓWIENIA
exports.getOrders = async (req, res) => {
  const orders = await Order.findAll({
    include: [{ association: 'user' }, { association: 'payment' }],
    order: [['created_at', 'DESC']]
  });
  res.render('admin/orders', { title: 'Zamówienia — admin', orders });
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  await Order.update({ status }, { where: { id: req.params.id } });
  await log(req, 'admin_update_order_status', { order_id: req.params.id, status });
  req.flash('success', 'Status zamówienia zaktualizowany.');
  res.redirect('/admin/orders');
};

// LOGI
exports.getLogs = async (req, res) => {
  const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(100);
  res.render('admin/logs', { title: 'Logi aktywności', logs });
};

// KATEGORIE
exports.getCategories = async (req, res) => {
  const categories = await Category.findAll({ include: [{ association: 'subcategories' }] });
  res.render('admin/categories', { title: 'Kategorie', categories });
};

exports.postAddCategory = async (req, res) => {
  const { name, slug, parent_id } = req.body;
  await Category.create({ name, slug, parent_id: parent_id || null });
  req.flash('success', 'Kategoria dodana.');
  res.redirect('/admin/categories');
};

exports.deleteCategory = async (req, res) => {
  await Category.destroy({ where: { id: req.params.id } });
  req.flash('success', 'Kategoria usunięta.');
  res.redirect('/admin/categories');
};
