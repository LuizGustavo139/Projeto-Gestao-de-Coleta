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
      const agendamentosBrutos = await Agendamento.findAll({ 
        where: { UserId: req.user.id },
        order: [['createdAt', 'DESC']] // Mostra os mais recentes primeiro
      });

      const pontosNoBanco = await PontoColeta.findAll();
      const residuosNoBanco = await Residuo.findAll();

      const pontos = pontosNoBanco;
      const residuos = residuosNoBanco;

      const agendamentos = agendamentosBrutos.map(agendamento => {
        const dado = agendamento.toJSON();

        const idDoPonto = dado.PontoColetaId || dado.pontoColetaId;
        const pontoEncontrado = pontosNoBanco.find(p => p.id === idDoPonto);
        dado.pontoColeta = pontoEncontrado ? pontoEncontrado.toJSON() : { nomePonto: 'Ponto não encontrado', endereco: dado.endereco || 'Não disponível' };

        const valorResiduoId = dado.ResiduoId || dado.residuoId;
        if (!valorResiduoId) {
          dado.nomesResiduos = 'Nenhum selecionado';
          return dado;
        }

        const listaIds = [valorResiduoId.toString()];
        const residuosEscolhidos = residuosNoBanco.filter(r => listaIds.includes(r.id.toString()));
        dado.nomesResiduos = residuosEscolhidos.map(r => r.nomeResiduo).join(', ') || 'Nenhum selecionado';
        
        return dado;
      });

      res.render('dashboard', { agendamentos, pontos, residuos });
    } catch (err) {
      console.error("ERRO COMPLETO NO GETALL:", err);
      res.status(500).send("Erro interno ao carregar o Dashboard.");
    }
  },

  renderCreate: async (req, res) => {
    try {
      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();
      res.render('cadastrar-ponto', { pontos, residuos, error: null });
    } catch (err) {
      console.error("Erro no renderCreate:", err);
      res.status(500).send("Erro ao carregar tela de cadastro.");
    }
  },

  create: async (req, res) => {
    try {
      let { pontoColetaId, residuoId, dataHora, endereco } = req.body;
      
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        const pontos = await PontoColeta.findAll();
        const residuos = await Residuo.findAll();
        return res.render('cadastrar-ponto', { 
          pontos, 
          residuos, 
          error: "Por favor, selecione ao menos um tipo de resíduo para prosseguir." 
        });
      }

      // 🚨 A MÁGICA ACONTECE AQUI: Transforma em array sempre para contarmos quantos checkboxes foram marcados
      const listaResiduos = Array.isArray(residuoId) ? residuoId : [residuoId];

      let idPontoLimpo = Array.isArray(pontoColetaId) ? pontoColetaId[0] : pontoColetaId;
      idPontoLimpo = parseInt(idPontoLimpo, 10);

      // 🚨 Laço de Repetição: Cria um agendamento no banco para CADA resíduo marcado!
      for (let id of listaResiduos) {
        await Agendamento.create({
          dataHora: dataHora || new Date(),
          endereco: endereco || 'Não informado',
          status: 'Pendente',
          UserId: req.user.id,
          PontoColetaId: idPontoLimpo || 1,
          ResiduoId: parseInt(id, 10) || 1
        });
      }
      
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro detalhado no create do banco:", err);
      res.status(500).send("Erro interno ao tentar salvar. Veja os logs do Render.");
    }
  },

  renderEdit: async (req, res) => {
    try {
      const agendamentoRaw = await Agendamento.findOne({ 
        where: { id: req.params.id, UserId: req.user.id } 
      });
      if (!agendamentoRaw) return res.redirect('/pontos');
      
      const agendamento = agendamentoRaw.toJSON();
      const valorResiduoId = agendamento.ResiduoId || agendamento.residuoId;
      agendamento.residuoIdsSelecionados = valorResiduoId ? [valorResiduoId.toString()] : [];

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
      let { pontoColetaId, residuoId, dataHora, endereco, status } = req.body;
      
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        return res.status(400).send("É necessário escolher pelo menos um resíduo.");
      }

      // Como o update edita uma linha específica por vez, pegamos só o que ele selecionar
      let idResiduoLimpo = Array.isArray(residuoId) ? residuoId[0] : residuoId;
      idResiduoLimpo = parseInt(idResiduoLimpo, 10);
      
      let idPontoLimpo = Array.isArray(pontoColetaId) ? pontoColetaId[0] : pontoColetaId;
      idPontoLimpo = parseInt(idPontoLimpo, 10);

      await Agendamento.update(
        { 
          PontoColetaId: idPontoLimpo, 
          ResiduoId: idResiduoLimpo, 
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
      await Agendamento.destroy({ 
        where: { id: req.params.id, UserId: req.user.id } 
      });
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro no delete:", err);
      res.status(500).send("Erro ao deletar.");
    }
  }
};