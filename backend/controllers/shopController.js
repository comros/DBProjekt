const Product = require('../models/mongo/Product');
const Review  = require('../models/mongo/Review');
const { Category } = require('../models/pg/index');
const log = require('../middleware/logger');

exports.getHome = async (req, res) => {
  try {
    const products = await Product.find({ is_active: true }).limit(8).sort({ createdAt: -1 });
    const categories = await Category.findAll({ where: { parent_id: null } });
    res.render('shop/home', { title: 'Sklep', products, categories });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Błąd ładowania strony.' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter = { is_active: true };

    if (category) filter.category_id = parseInt(category);
    if (search) filter.$text = { $search: search };

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    if (sort === 'price_desc') sortObj = { price: -1 };

    const products = await Product.find(filter).sort(sortObj);
    const categories = await Category.findAll({ where: { parent_id: null } });

    res.render('shop/products', {
      title: 'Produkty',
      products,
      categories,
      currentCategory: category || null,
      search: search || '',
      sort: sort || ''
    });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Błąd ładowania produktów.' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, is_active: true });
    if (!product) return res.status(404).render('error', { message: 'Produkt nie istnieje.' });

    const reviews = await Review.find({ product_id: product._id }).sort({ createdAt: -1 });
    const avgRating = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    await log(req, 'view_product', { product_id: product._id, slug: product.slug });

    res.render('shop/product', { title: product.name, product, reviews, avgRating });
  } catch (err) {
    console.error(err);
    res.render('error', { message: 'Błąd ładowania produktu.' });
  }
};

// --- KOSZYK (przechowywany w sesji) ---

exports.getCart = (req, res) => {
  const cart = req.session.cart || [];
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  res.render('shop/cart', { title: 'Koszyk', cart, total: total.toFixed(2) });
};

exports.addToCart = async (req, res) => {
  const { product_id } = req.body;
  try {
    const product = await Product.findById(product_id);
    if (!product || !product.is_active) {
      req.flash('error', 'Produkt niedostępny.');
      return res.redirect('back');
    }

    if (!req.session.cart) req.session.cart = [];
    const cart = req.session.cart;
    const existing = cart.find(i => i.product_id === product_id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        product_id: product_id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        qty: 1
      });
    }

    await log(req, 'add_to_cart', { product_id });
    req.flash('success', 'Dodano do koszyka.');
    res.redirect('back');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Błąd dodawania do koszyka.');
    res.redirect('back');
  }
};

exports.removeFromCart = (req, res) => {
  const { product_id } = req.body;
  if (req.session.cart) {
    req.session.cart = req.session.cart.filter(i => i.product_id !== product_id);
    log(req, 'remove_from_cart', { product_id });
  }
  res.redirect('/shop/cart');
};

exports.postReview = async (req, res) => {
  const { rating, body } = req.body;
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug });
    if (!product) return res.redirect('/shop');

    await Review.create({
      product_id: product._id,
      user_id: req.session.userId,
      user_name: res.locals.currentUser.name,
      rating: parseInt(rating),
      body
    });

    req.flash('success', 'Dziękujemy za opinię!');
    res.redirect(`/shop/product/${slug}`);
  } catch (err) {
    req.flash('error', 'Błąd dodawania opinii.');
    res.redirect('back');
  }
};
