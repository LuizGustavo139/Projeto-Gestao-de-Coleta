// Rotas principais do sistema
const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', pontoController.getAll);
router.get('/novo', pontoController.renderCreate);
router.post('/novo', pontoController.create);
router.get('/editar/:id', pontoController.renderEdit);
router.post('/editar/:id', pontoController.update);

router.get('/deletar/:id', pontoController.delete);

module.exports = router;
