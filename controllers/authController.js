const { User } = require('../models'); // Importação correta do index.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
  renderLogin: (req, res) => {
    res.render('login', { error: null });
  },

  renderRegister: (req, res) => {
    res.render('register', { error: null });
  },

  // LÓGICA DO CADASTRO (REGISTRO)
  register: async (req, res) => {
    try {
      const { nome, email, senha } = req.body;

      // 1. Verifica se o usuário já existe
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.render('register', { error: 'Este e-mail já está cadastrado.' });
      }

      // 2. Criptografa a senha antes de salvar no banco
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(senha, salt);

      // 3. Salva o usuário com a senha criptografada
      await User.create({ nome, email, senha: hashedPassword });

      // 4. Redireciona para a tela de login
      res.redirect('/auth/login');
    } catch (err) {
      console.error(err);
      res.render('register', { error: 'Erro interno ao realizar o cadastro.' });
    }
  },

  // LÓGICA DO LOGIN
  login: async (req, res) => {
    try {
      const { email, senha } = req.body;

      // 1. Busca o usuário pelo e-mail
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      // 2. Compara a senha digitada com a senha criptografada do banco
      const isMatch = await bcrypt.compare(senha, user.senha);
      if (!isMatch) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      // 3. Se a senha bater, gera o token JWT
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

      // 4. Salva o token nos cookies e manda para o Dashboard
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