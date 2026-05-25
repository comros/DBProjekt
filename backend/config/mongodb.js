const mongoose = require('mongoose');
require('dotenv').config();

const connectMongo = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB połączone');
  } catch (err) {
    console.error('❌ Błąd MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = connectMongo;
