const sequelize = require('../../config/postgres');
const User     = require('./User');
const Address  = require('./Address');
const Category = require('./Category');
const Order    = require('./Order');
const OrderItem = require('./OrderItem');
const Payment  = require('./Payment');

// Relacje
User.hasMany(Address,  { foreignKey: 'user_id', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

module.exports = { sequelize, User, Address, Category, Order, OrderItem, Payment };
