const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

// Importa os middlewares de segurança
const { estaLogado, eAdmin } = require('../middleware/authMiddleware.js');

// Rota para criar um agendamento (POST)
router.post('/agendamentos/novo', estaLogado, agendamentoController.criarAgendamento);

// Protege a tela do painel do admin (GET)
router.get('/admin/dashboard', estaLogado, eAdmin, agendamentoController.listarAgendamentosAdmin);

// 🚨 CORREÇÃO AQUI: Aponta exatamente para 'atualizarStatus' que está no seu controller
router.post('/admin/agendamentos/:id/status', estaLogado, eAdmin, agendamentoController.atualizarStatus);

module.exports = router;