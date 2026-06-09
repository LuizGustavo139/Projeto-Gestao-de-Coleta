// 🚨 IMPORTANTE: Certifique-se de importar tanto o PontoColeta quanto o Residuo
const { PontoColeta, Residuo } = require('../models');

module.exports = {
  getAll: async (req, res) => {
    try {
      const pontos = await PontoColeta.findAll();
      res.render('pontos-coleta/index', { pontos });
    } catch (err) {
      console.error('Erro ao listar pontos:', err);
      res.status(500).send('Erro ao carregar pontos de coleta.');
    }
  },

  // 🚨 ATUALIZADO: Agora busca os resíduos do banco para listar no form de criação
  renderCreate: async (req, res) => {
    try {
      const residuos = await Residuo.findAll();
      res.render('pontos-coleta/form', { ponto: null, residuos, erro: null });
    } catch (err) {
      console.error('Erro ao carregar tela de criação:', err);
      res.status(500).send('Erro ao carregar formulário.');
    }
  },

  // 🚨 ATUALIZADO: Processa os checkboxes e junta com vírgula
  create: async (req, res) => {
    try {
      let { nomePonto, endereco, residuosAceitos } = req.body;
      
      if (!nomePonto || !endereco || !residuosAceitos) {
        const residuos = await Residuo.findAll();
        return res.render('pontos-coleta/form', { ponto: null, residuos, erro: 'Todos os campos são obrigatórios.' });
      }

      // TRATAMENTO DO CHECKBOX: Se veio um array (múltiplos), junta com vírgula. Se veio uma string (um só), usa ela.
      let residuosTexto = '';
      if (residuosAceitos) {
        residuosTexto = Array.isArray(residuosAceitos) ? residuosAceitos.join(', ') : residuosAceitos;
      }

      await PontoColeta.create({ 
        nomePonto: nomePonto.trim(), 
        endereco: endereco.trim(), 
        residuosAceitos: residuosTexto.trim() 
      });
      
      res.redirect('/pontos-coleta');
    } catch (err) {
      console.error('Erro ao criar ponto:', err);
      const residuos = await Residuo.findAll();
      res.render('pontos-coleta/form', { ponto: null, residuos, erro: 'Erro ao salvar. Tente novamente.' });
    }
  },

  // 🚨 ATUALIZADO: Busca os resíduos para a tela de edição também
  renderEdit: async (req, res) => {
    try {
      const ponto = await PontoColeta.findByPk(req.params.id);
      if (!ponto) return res.redirect('/pontos-coleta');
      
      const residuos = await Residuo.findAll();
      res.render('pontos-coleta/form', { ponto, residuos, erro: null });
    } catch (err) {
      console.error('Erro ao buscar ponto:', err);
      res.status(500).send('Erro ao carregar edição.');
    }
  },

  // 🚨 ATUALIZADO: Processa os checkboxes na hora de atualizar o ponto
  update: async (req, res) => {
    try {
      let { nomePonto, endereco, residuosAceitos } = req.body;
      
      if (!nomePonto || !endereco || !residuosAceitos) {
        const ponto = await PontoColeta.findByPk(req.params.id);
        const residuos = await Residuo.findAll();
        return res.render('pontos-coleta/form', { ponto, residuos, erro: 'Todos os campos são obrigatórios.' });
      }

      // TRATAMENTO DO CHECKBOX: Junta os selecionados na edição
      let residuosTexto = '';
      if (residuosAceitos) {
        residuosTexto = Array.isArray(residuosAceitos) ? residuosAceitos.join(', ') : residuosAceitos;
      }

      await PontoColeta.update(
        { 
          nomePonto: nomePonto.trim(), 
          endereco: endereco.trim(), 
          residuosAceitos: residuosTexto.trim() 
        },
        { where: { id: req.params.id } }
      );
      
      res.redirect('/pontos-coleta');
    } catch (err) {
      console.error('Erro ao atualizar ponto:', err);
      res.status(500).send('Erro ao atualizar.');
    }
  },

  delete: async (req, res) => {
    try {
      await PontoColeta.destroy({ where: { id: req.params.id } });
      res.redirect('/pontos-coleta');
    } catch (err) {
      console.error('Erro ao remover ponto:', err);
      res.status(500).send('Erro ao remover.');
    }
  }
};