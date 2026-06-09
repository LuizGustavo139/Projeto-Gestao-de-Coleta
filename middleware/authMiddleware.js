const jwt = require('jsonwebtoken');
const { User } = require('../models');

const estaLogado = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_emergencia_22h');

    // 🚨 BRECHA DE EMERGÊNCIA: Se for o ID fake do nosso super admin, pula a busca no banco!
    if (decoded.id === 9999) {
      const adminFake = { id: 9999, nome: "Administrador Geral", email: "admin@coleta.com", isAdmin: true };
      req.user = adminFake;
      res.locals.user = adminFake;
      return next(); // Deixa passar direto para o Painel!
    }

    // Fluxo normal para os demais usuários comuns do banco
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
  // Se for o nosso id de emergência do admin, permite o acesso direto!
  if (req.user && (req.user.isAdmin === true || req.user.id === 9999)) {
    return next(); 
  }
  
  return res.status(403).send("Acesso negado. Esta área é restrita para administradores.");
};

module.exports = {
  estaLogado,
  eAdmin
};