const { User } = require('../models'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  renderLogin: (req, res) => {
    res.render('login', { error: null });
  },

  renderRegister: (req, res) => {
    res.render('register', { error: null });
  },

  
  register: async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

      
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.render('register', { error: 'Este e-mail já está cadastrado.' });
      }

      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(senha, salt);

      
      await User.create({ nome, email, senha: hashedPassword });

      
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('register', { error: 'Erro interno ao realizar o cadastro.' });
    }
  },

  
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      
      const isMatch = await bcrypt.compare(senha, user.senha);
      if (!isMatch) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/pontos');
    } catch (err) {
      console.error(err);
      res.render('login', { error: 'Erro interno no servidor.' });
    }
  },

  logout: (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  }
};
