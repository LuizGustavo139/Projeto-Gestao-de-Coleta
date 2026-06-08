const express = require('express');
const router = express.Router();
const pontoColetaController = require('../controllers/pontoColetaController');

// ALTERAÇÃO AQUI: Importando a função específica 'estaLogado'
const { estaLogado } = require('../middleware/authMiddleware');

// ALTERAÇÃO AQUI: Atualizado para usar a função de verificação de login
router.use(estaLogado);

router.get('/', pontoColetaController.getAll);
router.get('/novo', pontoColetaController.renderCreate);
router.post('/novo', pontoColetaController.create);
router.get('/editar/:id', pontoColetaController.renderEdit);
router.post('/editar/:id', pontoColetaController.update);
router.get('/deletar/:id', pontoColetaController.delete);

module.exports = router;