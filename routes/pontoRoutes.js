const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

router.get('/', pontoController.getAll);

// Rota para renderizar o formulário de novo agendamento (Adicionada agora)
router.get('/novo', pontoController.renderCreate);

module.exports = router;