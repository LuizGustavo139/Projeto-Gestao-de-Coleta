// Importação dupla de segurança para evitar erros de caminhos no Sequelize
let models;
try {
  models = require('../models');
} catch (e) {
  models = {
    Agendamento: require('../models/Agendamento'),
    PontoColeta: require('../models/PontoColeta'),
    Residuo: require('../models/Residuo')
  };
}
const { Agendamento, PontoColeta, Residuo } = models;

module.exports = {
  // Exibir o Dashboard com dados consolidados e relacionados
  getAll: async (req, res) => {
    try {
      const agendamentos = await Agendamento.findAll({ 
        where: { UserId: req.user.id },
        include: [
          { model: PontoColeta, as: 'pontoColeta' },
          { model: Residuo, as: 'residuo' }
        ]
      });
      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();

      res.render('dashboard', { agendamentos, pontos, residuos });
    } catch (err) {
      console.error("Erro no getAll:", err);
      res.status(500).send("Erro ao carregar o Dashboard.");
    }
  },

  // Tela para criar novo agendamento
  renderCreate: async (req, res) => {
    try {
      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();
      res.render('cadastrar-ponto', { pontos, residuos });
    } catch (err) {
      console.error("Erro no renderCreate:", err);
      res.status(500).send("Erro ao carregar tela de cadastro.");
    }
  },

  // Salvar novo agendamento
  create: async (req, res) => {
    try {
      const { pontoColetaId, residuoId, dataHora, endereco } = req.body;
      
      await Agendamento.create({
        dataHora,
        endereco,
        UserId: req.user.id,
        PontoColetaId: pontoColetaId,
        ResiduoId: residuoId
      });
      
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro detalhado no create do banco:", err);
      res.status(500).send("Erro ao agendar.");
    }
  },

  // Tela para editar agendamento
  renderEdit: async (req, res) => {
    try {
      const agendamento = await Agendamento.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (!agendamento) return res.redirect('/pontos');
      
      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();
      res.render('editar-ponto', { agendamento, pontos, residuos });
    } catch (err) {
      console.error("Erro no renderEdit:", err);
      res.status(500).send("Erro ao carregar edição.");
    }
  },

  // Atualizar agendamento
  update: async (req, res) => {
    try {
      const { pontoColetaId, residuoId, dataHora, endereco, status } = req.body;
      
      await Agendamento.update(
        { 
          PontoColetaId: pontoColetaId, 
          ResiduoId: residuoId, 
          dataHora, 
          endereco, 
          status 
        },
        { where: { id: req.params.id, UserId: req.user.id } }
      );
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro no update do banco:", err);
      res.status(500).send("Erro ao atualizar.");
    }
  },

  // Cancelar/Deletar agendamento
  delete: async (req, res) => {
    try {
      await Agendamento.destroy({ where: { id: req.params.id, UserId: req.user.id } });
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro no delete:", err);
      res.status(500).send("Erro ao deletar.");
    }
  }
};