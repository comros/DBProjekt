require('dotenv').config();
const express        = require('express');
const session        = require('express-session');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const path           = require('path');

const connectMongo  = require('./backend/config/mongodb');
const { sequelize } = require('./backend/models/pg/index');
const { loadUser }  = require('./backend/middleware/auth');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'frontend/views'));

// Static files
app.use(express.static(path.join(__dirname, 'frontend/public')));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24h
}));

// Flash messages
app.use(flash());

// Globals dla widoków
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  res.locals.cart    = req.session.cart || [];
  next();
});

// Ładowanie zalogowanego użytkownika do res.locals
app.use(loadUser);

// Routes
app.use('/auth',   require('./backend/routes/auth'));
app.use('/shop',   require('./backend/routes/shop'));
app.use('/orders', require('./backend/routes/orders'));
app.use('/admin',  require('./backend/routes/admin'));

// Redirect z / do /shop
app.get('/', (req, res) => res.redirect('/shop'));

// 404
app.use((req, res) => {
  res.status(404).render('error', { message: 'Strona nie istnieje (404).' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Błąd serwera (500).' });
});

// Start
const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectMongo();
    await sequelize.authenticate();
    console.log('✅ PostgreSQL połączone');
    await sequelize.sync({ alter: true });
    console.log('✅ Tabele PostgreSQL zsynchronizowane');

    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Serwer działa na: http://localhost:${PORT}`);
      console.log(`   Panel admina:      http://localhost:${PORT}/admin`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} jest już zajęty. Zatrzymaj poprzedni proces i spróbuj ponownie.`);
      } else {
        console.error('❌ Błąd serwera:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('❌ Błąd startu:', err);
    process.exit(1);
  }
})();
