const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: false,
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: [
      'register', 'login', 'logout',
      'view_product', 'add_to_cart', 'remove_from_cart',
      'place_order', 'cancel_order',
      'admin_add_product', 'admin_edit_product', 'admin_delete_product',
      'admin_update_order_status'
    ]
  },
  payload: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

activityLogSchema.index({ user_id: 1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
