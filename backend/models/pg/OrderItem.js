const { DataTypes } = require('sequelize');
const sequelize = require('../../config/postgres');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'orders', key: 'id' }
  },
  product_id: {
    type: DataTypes.STRING(24),
    allowNull: false,
    comment: 'MongoDB ObjectId produktu'
  },
  product_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: 'Snapshot nazwy w momencie zakupu'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
