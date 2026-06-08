const express = require('express');
const router = express.Router();
const residuoController = require('../controllers/residuoController');

// ALTERAÇÃO AQUI: Importando a função específica 'estaLogado'
const { estaLogado } = require('../middleware/authMiddleware');

// ALTERAÇÃO AQUI: Atualizado para usar a função correta
router.use(estaLogado);

router.get('/', residuoController.getAll);
router.get('/novo', residuoController.renderCreate);
router.post('/novo', residuoController.create);
router.get('/editar/:id', residuoController.renderEdit);
router.post('/editar/:id', residuoController.update);
router.get('/deletar/:id', residuoController.delete);

module.exports = router;