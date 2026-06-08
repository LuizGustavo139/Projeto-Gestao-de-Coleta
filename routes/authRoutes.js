const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// O middleware continua aqui caso precise para outras rotas futuramente
const { estaLogado } = require('../middleware/authMiddleware');

router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.get('/register', authController.renderRegister);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// ALTERAÇÃO AQUI: Removemos o 'estaLogado' para que usuários deslogados consigam redefinir a senha
router.get('/alterar-senha', authController.renderAlterarSenha);
router.post('/alterar-senha', authController.alterarSenha);

module.exports = router;