const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

<<<<<<< HEAD
    
=======
    
>>>>>>> 380b667e78c393617802902ac8bb37d7139e124a
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'nome', 'email'] });
    if (!user) {
      res.clearCookie('token');
      return res.redirect('/auth/login');
    }

    req.user = user;
<<<<<<< HEAD
    res.locals.user = user; 
=======
    res.locals.user = user;
>>>>>>> 380b667e78c393617802902ac8bb37d7139e124a
    next();
  } catch (error) {
    res.clearCookie('token');
    return res.redirect('/auth/login');
  }
};
