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

      // 🚨 TRAVA DE SEGURANÇA BACK-END: Impede senhas com menos de 5 dígitos no cadastro
      if (!senha || senha.trim().length < 5) {
        return res.render('register', { error: 'A senha precisa conter no mínimo 5 caracteres.' });
      }

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

      // 🚨 BRECHA DE EMERGÊNCIA PARA AS 22H: Se for o admin padrão, gera o token e ignora o banco de dados
      if (email === 'admin@coleta.com' && senha === 'admin') {
        const token = jwt.sign(
          { id: 9999, isAdmin: true }, // Injeta diretamente que você É admin
          process.env.JWT_SECRET, 
          { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true });
        return res.redirect('/admin/dashboard'); // Redireciona direto para o painel administrativo!
      }

      // --- Daqui para baixo continua o fluxo normal do banco para usuários comuns ---
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      const isMatch = await bcrypt.compare(senha, user.senha);
      if (!isMatch) {
        return res.render('login', { error: 'E-mail ou senha inválidos.' });
      }

      // Se o usuário existir e bater no banco comum, usa a coluna do banco
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
      const { email, novaSenha } = req.body;

      // 🚨 TRAVA DE SEGURANÇA BACK-END: Impede senhas com menos de 5 dígitos na redefinição
      if (!novaSenha || novaSenha.trim().length < 5) {
        return res.render('alterar-senha', { error: 'A nova senha precisa conter no mínimo 5 caracteres.', success: null });
      }
      
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.render('alterar-senha', { error: 'E-mail não encontrado no sistema.', success: null });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(novaSenha, salt);

      user.senha = hashedPassword;
      await user.save();

      res.render('alterar-senha', { error: null, success: 'Senha redefinida com sucesso! Você já pode fazer login.' });
    } catch (err) {
      console.error(err);
      res.render('alterar-senha', { error: 'Erro interno ao tentar redefinir a senha.', success: null });
    }
  }
};