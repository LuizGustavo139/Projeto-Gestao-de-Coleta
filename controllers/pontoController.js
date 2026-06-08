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
      // 1. Voltamos para a busca simples e original que seu sistema já aceitava sem erros
      const agendamentosBrutos = await Agendamento.findAll({ 
        where: { UserId: req.user.id }
      });

      // 2. Buscamos as tabelas auxiliares de apoio
      const pontosNoBanco = await PontoColeta.findAll();
      const residuosNoBanco = await Residuo.findAll();

      const pontos = pontosNoBanco;
      const residuos = residuosNoBanco;

      // 3. Cruzamento manual e seguro dos IDs via JavaScript
      const agendamentos = agendamentosBrutos.map(agendamento => {
        const dado = agendamento.toJSON();

        // --- ASSOCIAÇÃO DO PONTO DE COLETA ---
        const idDoPonto = dado.PontoColetaId || dado.pontoColetaId;
        const pontoEncontrado = pontosNoBanco.find(p => p.id === idDoPonto);
        
        // Alimenta a propriedade pontoColeta para o dashboard.ejs ler sem quebrar o layout
        dado.pontoColeta = pontoEncontrado ? pontoEncontrado.toJSON() : { nomePonto: 'Ponto não encontrado', endereco: dado.endereco || 'Não disponível' };

        // --- ASSOCIAÇÃO DOS MÚLTIPLOS RESÍDUOS ---
        const valorResiduoId = dado.ResiduoId || dado.residuoId;
        let listaIds = [];

        if (!valorResiduoId) {
          dado.nomesResiduos = 'Nenhum selecionado';
          return dado;
        }

        try {
          // Tenta ler o formato de array em String JSON (ex: '["1","3"]')
          listaIds = JSON.parse(valorResiduoId);
        } catch (e) {
          // Se for um agendamento com id simples clássico (ex: '2'), isola em formato array
          listaIds = [valorResiduoId.toString()];
        }

        if (Array.isArray(listaIds)) {
          const residuosEscolhidos = residuosNoBanco.filter(r => listaIds.includes(r.id.toString()));
          dado.nomesResiduos = residuosEscolhidos.map(r => r.nomeResiduo).join(', ') || 'Nenhum selecionado';
        } else {
          dado.nomesResiduos = 'Nenhum selecionado';
        }
        
        return dado;
      });

      res.render('dashboard', { agendamentos, pontos, residuos });
    } catch (err) {
      console.error("ERRO COMPLETO NO GETALL:", err);
      res.status(500).send("Erro interno ao carregar o Dashboard. Verifique o terminal.");
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
      const { pontoColetaId, residuoId, dataHora, endereco } = req.body;
      
      // Validação obrigatória contra dados vazios
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        const pontos = await PontoColeta.findAll();
        const residuos = await Residuo.findAll();
        return res.render('cadastrar-ponto', { 
          pontos, 
          residuos, 
          error: "Por favor, selecione ao menos um tipo de resíduo para prosseguir." 
        });
      }

      const residuoIdJson = Array.isArray(residuoId) ? JSON.stringify(residuoId) : JSON.stringify([residuoId]);

      await Agendamento.create({
        dataHora,
        endereco,
        UserId: req.user.id,
        PontoColetaId: pontoColetaId,
        ResiduoId: residuoIdJson
      });
      
      res.redirect('/pontos');
    } catch (err) {
      console.error("Erro detalhado no create do banco:", err);
      res.status(500).send("Erro ao agendar.");
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
      
      try {
        agendamento.residuoIdsSelecionados = JSON.parse(valorResiduoId);
      } catch (e) {
        agendamento.residuoIdsSelecionados = valorResiduoId ? [valorResiduoId.toString()] : [];
      }

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
      
      if (!residuoId || (Array.isArray(residuoId) && residuoId.length === 0)) {
        return res.status(400).send("É necessário escolher pelo menos um resíduo.");
      }

      const residuoIdJson = Array.isArray(residuoId) ? JSON.stringify(residuoId) : JSON.stringify([residuoId]);

      await Agendamento.update(
        { 
          PontoColetaId: pontoColetaId, 
          ResiduoId: residuoIdJson, 
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