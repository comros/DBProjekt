const bcrypt = require('bcryptjs');
const { User } = require('../models/pg/index');
const log = require('../middleware/logger');

exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Rejestracja', errors: [], old: {} });
};

exports.postRegister = async (req, res) => {
  const { name, email, password, password2 } = req.body;
  const errors = [];

  if (!name || name.length < 2) errors.push('Imię jest za krótkie.');
  if (!email) errors.push('Podaj e-mail.');
  if (!password || password.length < 6) errors.push('Hasło musi mieć min. 6 znaków.');
  if (password !== password2) errors.push('Hasła nie są takie same.');

  if (errors.length) {
    return res.render('auth/register', { title: 'Rejestracja', errors, old: { name, email } });
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.render('auth/register', {
        title: 'Rejestracja',
        errors: ['Ten e-mail jest już zajęty.'],
        old: { name, email }
      });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password_hash });

    await log(req, 'register', { user_id: user.id });

    req.session.userId = user.id;
    req.flash('success', `Witaj, ${user.name}!`);
    res.redirect('/shop');
  } catch (err) {
    console.error(err);
    res.render('auth/register', {
      title: 'Rejestracja',
      errors: ['Błąd serwera, spróbuj ponownie.'],
      old: { name, email }
    });
  }
};

exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Logowanie', errors: [] });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render('auth/login', { title: 'Logowanie', errors: ['Nieprawidłowy e-mail lub hasło.'] });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render('auth/login', { title: 'Logowanie', errors: ['Nieprawidłowy e-mail lub hasło.'] });
    }

    req.session.userId = user.id;
    await log(req, 'login', { user_id: user.id });

    req.flash('success', `Zalogowano jako ${user.name}.`);

    if (user.role === 'admin') return res.redirect('/admin');
    res.redirect('/shop');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Logowanie', errors: ['Błąd serwera.'] });
  }
};

exports.logout = async (req, res) => {
  await log(req, 'logout');
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
