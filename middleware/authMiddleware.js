const jwt = require('jsonwebtoken');
const { User } = require('../models');


const estaLogado = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'nome', 'email', 'isAdmin'] });
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};


const eAdmin = (req, res, next) => {
  // Como o 'estaLogado' roda antes, o 'req.user' já vai estar preenchido aqui
  if (req.user && req.user.isAdmin === true) {
    return next(); // É admin! Pode entrar no painel
  }
  
  
  return res.status(403).send("Acesso negado. Esta área é restrita para administradores.");
};


module.exports = {
  estaLogado,
  eAdmin
};
