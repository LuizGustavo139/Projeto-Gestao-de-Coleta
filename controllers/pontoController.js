
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
