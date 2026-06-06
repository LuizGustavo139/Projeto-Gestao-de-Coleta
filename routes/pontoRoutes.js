const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

router.get('/', pontoController.getAll);
router.get('/novo', pontoController.renderCreate);
router.post('/novo', pontoController.create);

// Rotas para renderização e atualização da edição (Adicionadas agora)
router.get('/editar/:id', pontoController.renderEdit);
router.post('/editar/:id', pontoController.update);

module.exports = router;