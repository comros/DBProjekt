const { Order, OrderItem, Payment, Address } = require('../models/pg/index');
const sequelize = require('../config/postgres');
const log = require('../middleware/logger');

exports.getCheckout = async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) {
    req.flash('error', 'Koszyk jest pusty.');
    return res.redirect('/shop/cart');
  }
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const addresses = await Address.findAll({ where: { user_id: req.session.userId } });
  res.render('shop/checkout', { title: 'Zamówienie', cart, total: total.toFixed(2), addresses });
};

exports.postCheckout = async (req, res) => {
  const cart = req.session.cart || [];
  if (cart.length === 0) return res.redirect('/shop/cart');

  const { method, address_street, address_city, address_zip } = req.body;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const t = await sequelize.transaction();
  try {
    const shippingAddress = `${address_street}, ${address_zip} ${address_city}`;

    const order = await Order.create({
      user_id: req.session.userId,
      status: 'pending',
      total: total.toFixed(2),
      shipping_address: shippingAddress
    }, { transaction: t });

    const items = cart.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.name,
      quantity: i.qty,
      unit_price: i.price
    }));
    await OrderItem.bulkCreate(items, { transaction: t });

    await Payment.create({
      order_id: order.id,
      method: method || 'transfer',
      amount: total.toFixed(2),
      status: 'completed',
      paid_at: new Date()
    }, { transaction: t });

    await t.commit();

    req.session.cart = [];
    await log(req, 'place_order', { order_id: order.id, total });

    req.flash('success', `Zamówienie #${order.id} złożone pomyślnie!`);
    res.redirect(`/orders/${order.id}`);
  } catch (err) {
    await t.rollback();
    console.error(err);
    req.flash('error', 'Błąd składania zamówienia.');
    res.redirect('/shop/cart');
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.session.userId },
      include: [{ association: 'items' }, { association: 'payment' }],
      order: [['created_at', 'DESC']]
    });
    res.render('shop/orders', { title: 'Moje zamówienia', orders });
  } catch (err) {
    res.render('error', { message: 'Błąd pobierania zamówień.' });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id, user_id: req.session.userId },
      include: [{ association: 'items' }, { association: 'payment' }]
    });
    if (!order) return res.status(404).render('error', { message: 'Zamówienie nie istnieje.' });
    res.render('shop/order-detail', { title: `Zamówienie #${order.id}`, order });
  } catch (err) {
    res.render('error', { message: 'Błąd pobierania zamówienia.' });
  }
};
