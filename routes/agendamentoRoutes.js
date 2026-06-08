const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController.js');

// Rota para criar um agendamento (POST)
router.post('/agendamentos/novo', agendamentoController.criarAgendamento);

// Rota EXATA que o seu navegador está a tentar aceder (GET)
router.get('/admin/dashboard', agendamentoController.listarAgendamentosAdmin);

module.exports = router;