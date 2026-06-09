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
        order: [['createdAt', 'DESC']] 
      });

      const pontosNoBanco = await PontoColeta.findAll();
      const residuosNoBanco = await Residuo.findAll();

      // MÁGICA DO AGRUPAMENTO: Junta os agendamentos do mesmo dia/ponto em 1 linha só!
      const mapAgrupado = {};
      for (let ag of agendamentosBrutos) {
        const dado = ag.toJSON();
        const chave = dado.dataHora + '-' + dado.PontoColetaId;
        
        if (!mapAgrupado[chave]) {
          dado.listaResiduoIds = [dado.ResiduoId || dado.residuoId];
          mapAgrupado[chave] = dado;
        } else {
          mapAgrupado[chave].listaResiduoIds.push(dado.ResiduoId || dado.residuoId);
        }
      }

      const agendamentos = Object.values(mapAgrupado).map(dado => {
        const idDoPonto = dado.PontoColetaId || dado.pontoColetaId;
        const ponto = pontosNoBanco.find(p => p.id === idDoPonto);
        dado.pontoColeta = ponto ? ponto.toJSON() : { nomePonto: '...', endereco: '...' };

        const residuosEscolhidos = residuosNoBanco.filter(r => dado.listaResiduoIds.includes(r.id));
        dado.nomesResiduos = residuosEscolhidos.map(r => r.nomeResiduo).join(', ') || 'Nenhum';
        
        dado.nomeUsuario = req.user.nome || 'Usuário';
        
        return dado;
      });

      res.render('dashboard', { agendamentos, pontos: pontosNoBanco, residuos: residuosNoBanco });
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro interno ao carregar o Dashboard.");
    }
  },

  renderCreate: async (req, res) => {
    try {
      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();
      res.render('cadastrar-ponto', { pontos, residuos, error: null });
    } catch (err) {
      res.status(500).send("Erro ao carregar tela de cadastro.");
    }
  },

  create: async (req, res) => {
    try {
      let { pontoColetaId, residuoId, dataHora, endereco } = req.body;
      
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        const pontos = await PontoColeta.findAll();
        const residuos = await Residuo.findAll();
        return res.render('cadastrar-ponto', { pontos, residuos, error: "Selecione ao menos um resíduo." });
      }

      const listaResiduos = Array.isArray(residuoId) ? residuoId : [residuoId];
      let idPontoLimpo = Array.isArray(pontoColetaId) ? pontoColetaId[0] : pontoColetaId;

      for (let id of listaResiduos) {
        await Agendamento.create({
          dataHora: dataHora || new Date(),
          endereco: endereco || 'Não informado',
          status: 'Pendente',
          UserId: req.user.id,
          PontoColetaId: parseInt(idPontoLimpo, 10) || 1,
          ResiduoId: parseInt(id, 10) || 1
        });
      }
      res.redirect('/pontos');
    } catch (err) {
      res.status(500).send("Erro interno ao salvar.");
    }
  },

  renderEdit: async (req, res) => {
    try {
      const agendamentoRaw = await Agendamento.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (!agendamentoRaw) return res.redirect('/pontos');
      
      const doMesmoGrupo = await Agendamento.findAll({ 
        where: { dataHora: agendamentoRaw.dataHora, PontoColetaId: agendamentoRaw.PontoColetaId, UserId: req.user.id } 
      });

      const agendamento = agendamentoRaw.toJSON();
      agendamento.residuoIdsSelecionados = doMesmoGrupo.map(a => a.ResiduoId.toString());

      const pontos = await PontoColeta.findAll();
      const residuos = await Residuo.findAll();
      res.render('editar-ponto', { agendamento, pontos, residuos });
    } catch (err) {
      res.status(500).send("Erro ao carregar edição.");
    }
  },

  update: async (req, res) => {
    try {
      // 🚨 Removido o "status" daqui. O usuário não tem mais o poder de enviá-lo!
      let { pontoColetaId, residuoId, dataHora, endereco } = req.body;
      
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        return res.status(400).send("É necessário escolher pelo menos um resíduo.");
      }

      const agendamentoRaw = await Agendamento.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (!agendamentoRaw) return res.redirect('/pontos');

      // 🚨 TRAVA DE SEGURANÇA: Guarda o status original antes de deletar
      const statusOriginal = agendamentoRaw.status;

      await Agendamento.destroy({ 
        where: { dataHora: agendamentoRaw.dataHora, PontoColetaId: agendamentoRaw.PontoColetaId, UserId: req.user.id } 
      });

      const listaResiduos = Array.isArray(residuoId) ? residuoId : [residuoId];
      let idPontoLimpo = Array.isArray(pontoColetaId) ? pontoColetaId[0] : pontoColetaId;

      for (let id of listaResiduos) {
        await Agendamento.create({
          dataHora, 
          endereco, 
          status: statusOriginal, // 🚨 Força o status original a ser salvo novamente
          UserId: req.user.id, 
          PontoColetaId: parseInt(idPontoLimpo, 10), 
          ResiduoId: parseInt(id, 10)
        });
      }
      res.redirect('/pontos');
    } catch (err) {
      console.error(err);
      res.status(500).send("Erro ao atualizar.");
    }
  },

  delete: async (req, res) => {
    try {
      const agendamentoRaw = await Agendamento.findOne({ where: { id: req.params.id, UserId: req.user.id } });
      if (agendamentoRaw) {
        await Agendamento.destroy({ 
          where: { dataHora: agendamentoRaw.dataHora, PontoColetaId: agendamentoRaw.PontoColetaId, UserId: req.user.id } 
        });
      }
      res.redirect('/pontos');
    } catch (err) {
      res.status(500).send("Erro ao deletar.");
    }
  }
};