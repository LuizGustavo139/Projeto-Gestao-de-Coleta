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

      const token = jwt.sign(
        { id: user.id, isAdmin: user.isAdmin }, 
        process.env.JWT_SECRET, 
        { expiresIn: '1d' }
      );

      res.cookie('token', token, { httpOnly: true });

      if (user.isAdmin) {
        return res.redirect('/admin/dashboard');
      }

      res.redirect('/pontos');
    } catch (err) {
      console.error(err);
      res.render('login', { error: 'Erro interno no servidor.' });
    }
  },

  logout: (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
  }, 

  renderAlterarSenha: (req, res) => {
    res.render('alterar-senha', { error: null, success: null });
  },

  
  alterarSenha: async (req, res) => {
    try {
      const { email, novaSenha } = req.body; // Pega o e-mail e a nova senha vindos do formulário
      
      // 1. Busca o usuário pelo e-mail no banco de dados
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.render('alterar-senha', { error: 'E-mail não encontrado no sistema.', success: null });
      }

      // 2. Cria a nova criptografia com salt do bcrypt para a nova senha
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(novaSenha, salt);

      // 3. Atualiza e salva o registro no MySQL usando o Sequelize
      user.senha = hashedPassword;
      await user.save();

      res.render('alterar-senha', { error: null, success: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (err) {
      console.error(err);
      res.render('alterar-senha', { error: 'Erro interno ao tentar redefinir a senha.', success: null });
    }
  }
};