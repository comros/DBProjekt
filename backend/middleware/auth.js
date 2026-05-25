const { User } = require('../models/pg/index');

const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Musisz się zalogować.');
    return res.redirect('/auth/login');
  }
  next();
};

const requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findByPk(req.session.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).render('error', { message: 'Brak dostępu.' });
    }
    res.locals.currentUser = user;
    next();
  } catch (err) {
    next(err);
  }
};

const loadUser = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findByPk(req.session.userId);
      res.locals.currentUser = user;
    } catch (e) {
      res.locals.currentUser = null;
    }
  } else {
    res.locals.currentUser = null;
  }
  next();
};

module.exports = { requireLogin, requireAdmin, loadUser };
