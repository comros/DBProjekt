const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: Number,
    required: true,
    comment: 'ID z tabeli users w PostgreSQL'
  },
  user_name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  body: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });

module.exports = mongoose.model('Review', reviewSchema);
