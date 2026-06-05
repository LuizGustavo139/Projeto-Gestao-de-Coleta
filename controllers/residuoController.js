const { Residuo } = require('../../models');

module.exports = {
  // Listar todos os resíduos
  getAll: async (req, res) => {
    try {
      const residuos = await Residuo.findAll();
      res.render('residuos/index', { residuos });
    } catch (err) {
      console.error('Erro ao listar resíduos:', err);
      res.status(500).send('Erro ao carregar resíduos.');
    }
  },

  // Tela de cadastro
  renderCreate: (req, res) => {
    res.render('residuos/form', { residuo: null, erro: null });
  },

  // Salvar novo resíduo
  create: async (req, res) => {
    try {
      const { nomeResiduo, descricao } = req.body;
      if (!nomeResiduo || !nomeResiduo.trim()) {
        return res.render('residuos/form', { residuo: null, erro: 'O nome do resíduo é obrigatório.' });
      }
      await Residuo.create({ nomeResiduo: nomeResiduo.trim(), descricao });
      res.redirect('/residuos');
    } catch (err) {
      console.error('Erro ao criar resíduo:', err);
      res.render('residuos/form', { residuo: null, erro: 'Erro ao salvar. Tente novamente.' });
    }
  },

  // Tela de edição
  renderEdit: async (req, res) => {
    try {
      const residuo = await Residuo.findByPk(req.params.id);
      if (!residuo) return res.redirect('/residuos');
      res.render('residuos/form', { residuo, erro: null });
    } catch (err) {
      console.error('Erro ao buscar resíduo:', err);
      res.status(500).send('Erro ao carregar edição.');
    }
  },

  // Atualizar resíduo
  update: async (req, res) => {
    try {
      const { nomeResiduo, descricao } = req.body;
      if (!nomeResiduo || !nomeResiduo.trim()) {
        const residuo = await Residuo.findByPk(req.params.id);
        return res.render('residuos/form', { residuo, erro: 'O nome do resíduo é obrigatório.' });
      }
      await Residuo.update(
        { nomeResiduo: nomeResiduo.trim(), descricao },
        { where: { id: req.params.id } }
      );
      res.redirect('/residuos');
    } catch (err) {
      console.error('Erro ao atualizar resíduo:', err);
      res.status(500).send('Erro ao atualizar.');
    }
  },

  // Remover resíduo
  delete: async (req, res) => {
    try {
      await Residuo.destroy({ where: { id: req.params.id } });
      res.redirect('/residuos');
    } catch (err) {
      console.error('Erro ao remover resíduo:', err);
      res.status(500).send('Erro ao remover.');
    }
  }
};
