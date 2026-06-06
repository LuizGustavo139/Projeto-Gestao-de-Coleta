const express = require('express');
const router = express.Router();
const residuoController = require('../controllers/residuoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', residuoController.getAll);
router.get('/novo', residuoController.renderCreate);
router.post('/novo', residuoController.create);
router.get('/editar/:id', residuoController.renderEdit);
router.post('/editar/:id', residuoController.update);
router.get('/deletar/:id', residuoController.delete);

module.exports = router;