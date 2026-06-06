const express = require('express');
const router = express.Router();
const pontoColetaController = require('../controllers/pontoColetaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', pontoColetaController.getAll);
router.get('/novo', pontoColetaController.renderCreate);
router.post('/novo', pontoColetaController.create);
router.get('/editar/:id', pontoColetaController.renderEdit);
router.post('/editar/:id', pontoColetaController.update);
router.get('/deletar/:id', pontoColetaController.delete);

module.exports = router;