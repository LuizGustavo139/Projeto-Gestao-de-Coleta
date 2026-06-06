const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');
const authMiddleware = require('../middleware/authMiddleware');

// Protege todas as rotas abaixo com o middleware de autenticação
router.use(authMiddleware);

router.get('/', pontoController.getAll);
router.get('/novo', pontoController.renderCreate);
router.post('/novo', pontoController.create);
router.get('/editar/:id', pontoController.renderEdit);
router.post('/editar/:id', pontoController.update);

// Rota para deletar agendamento (Adicionada agora)
router.get('/deletar/:id', pontoController.delete);

module.exports = router;