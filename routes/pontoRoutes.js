const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

router.get('/', pontoController.getAll);
router.get('/novo', pontoController.renderCreate);

// Rota POST para processar e criar o agendamento (Adicionada agora)
router.post('/novo', pontoController.create);

module.exports = router;