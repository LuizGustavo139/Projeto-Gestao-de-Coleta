const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário completo no banco para ter nome e email disponíveis nas views
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'nome', 'email'] });
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    req.user = user;
    res.locals.user = user; // Disponível em todos os templates EJS
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};
