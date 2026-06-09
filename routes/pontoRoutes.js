const express = require('express');
const router = express.Router();
const pontoController = require('../controllers/pontoController');

// 🚨 1. IMPORTA TAMBÉM O CONTROLADOR DE AGENDAMENTOS
const agendamentoController = require('../controllers/agendamentoController');

const { estaLogado } = require('../middleware/authMiddleware');

router.use(estaLogado);

// 🚨 2. CORREÇÃO: Altera de pontoController.getAll para a nova função com os dados agrupados e data formatada!
router.get('/', agendamentoController.listarAgendamentosUsuario);

// Mantém todas as outras rotas funcionando perfeitamente abaixo
router.get('/novo', pontoController.renderCreate);
router.post('/novo', pontoController.create);
router.get('/editar/:id', pontoController.renderEdit);
router.post('/editar/:id', pontoController.update);
router.get('/deletar/:id', pontoController.delete);

module.exports = router;