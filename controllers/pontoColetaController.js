const { PontoColeta } = require('../models');

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

  
  renderCreate: (req, res) => {
    res.render('pontos-coleta/form', { ponto: null, erro: null });
  },

  
  create: async (req, res) => {
    try {
      const { nomePonto, endereco, residuosAceitos } = req.body;
      if (!nomePonto || !endereco || !residuosAceitos) {
        return res.render('pontos-coleta/form', { ponto: null, erro: 'Todos os campos são obrigatórios.' });
      }
      await PontoColeta.create({ nomePonto: nomePonto.trim(), endereco: endereco.trim(), residuosAceitos: residuosAceitos.trim() });
      res.redirect('/pontos-coleta');
    } catch (err) {
      console.error('Erro ao criar ponto:', err);
      res.render('pontos-coleta/form', { ponto: null, erro: 'Erro ao salvar. Tente novamente.' });
    }
  },
    renderEdit: async (req, res) => {
    try {
      const ponto = await PontoColeta.findByPk(req.params.id);
      if (!ponto) return res.redirect('/pontos-coleta');
      res.render('pontos-coleta/form', { ponto, erro: null });
    } catch (err) {
      console.error('Erro ao buscar ponto:', err);
      res.status(500).send('Erro ao carregar edição.');
    }
  },
  update: async (req, res) => {
    try {
      const { nomePonto, endereco, residuosAceitos } = req.body;
      if (!nomePonto || !endereco || !residuosAceitos) {
        const ponto = await PontoColeta.findByPk(req.params.id);
        return res.render('pontos-coleta/form', { ponto, erro: 'Todos os campos são obrigatórios.' });
      }
      await PontoColeta.update(
        { nomePonto: nomePonto.trim(), endereco: endereco.trim(), residuosAceitos: residuosAceitos.trim() },
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
