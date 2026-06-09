const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

// Importa os middlewares de segurança
const { estaLogado, eAdmin } = require('../middleware/authMiddleware.js');

// 🚨 NOVA ROTA ADICIONADA: Protege e carrega o dashboard do usuário comum (Cidadão)
router.get('/pontos', estaLogado, agendamentoController.listarAgendamentosUsuario);

// Rota para criar um agendamento (POST)
router.post('/agendamentos/novo', estaLogado, agendamentoController.criarAgendamento);

// Protege a tela do painel do admin (GET)
router.get('/admin/dashboard', estaLogado, eAdmin, agendamentoController.listarAgendamentosAdmin);

// Aponta exatamente para 'atualizarStatus' que está no seu controller
router.post('/admin/agendamentos/:id/status', estaLogado, eAdmin, agendamentoController.atualizarStatus);

module.exports = router;