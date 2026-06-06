const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

// Rota principal para o Dashboard
router.get('/', pontoController.getAll);

module.exports = router;