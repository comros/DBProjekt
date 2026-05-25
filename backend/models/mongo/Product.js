const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  category_id: {
    type: Number,
    required: true,
    comment: 'ID z tabeli categories w PostgreSQL'
  },
  images: [{
    type: String
  }],
  attributes: {
    type: Map,
    of: String,
    default: {}
    // np. { "kolor": "czarny", "rozmiar": "XL", "materiał": "bawełna" }
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category_id: 1 });

module.exports = mongoose.model('Product', productSchema);
