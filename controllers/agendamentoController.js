const Agendamento = require('../models/Agendamento');
const User = require('../models/User');
const PontoColeta = require('../models/PontoColeta');
const Residuo = require('../models/Residuo');

exports.criarAgendamento = async (req, res) => {
    try {
        let { pontoColetaId, residuoId, endereco, dataHora } = req.body;
        
        const listaResiduos = Array.isArray(residuoId) ? residuoId : [residuoId];
        let idPontoLimpo = Array.isArray(pontoColetaId) ? pontoColetaId[0] : pontoColetaId;
        const userId = (req.user && req.user.id) ? req.user.id : 9999; 

        for (let id of listaResiduos) {
            await Agendamento.create({
                dataHora: dataHora || new Date(),
                endereco: endereco || 'Ecoponto selecionado',
                status: 'Pendente',
                UserId: userId,
                PontoColetaId: parseInt(idPontoLimpo, 10) || 1,
                ResiduoId: parseInt(id, 10) || 1
            });
        }
        res.redirect('/pontos'); 
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro interno ao tentar agendar a coleta.");
    }
};

exports.listarAgendamentosAdmin = async (req, res) => {
    try {
        const agendamentosBrutos = await Agendamento.findAll({
            include: [
                { model: User },
                { model: PontoColeta, as: 'pontoColeta' },
                { model: Residuo, as: 'residuo' }
            ],
            order: [['createdAt', 'DESC']]
        });

        const mapAgrupado = {};
        for (let ag of agendamentosBrutos) {
            const dataCriacaoOriginal = ag.createdAt; // 📅 Captura a data pura antes do JSON
            const dado = ag.toJSON();
            const chave = dado.dataHora + '-' + dado.PontoColetaId + '-' + dado.UserId;
            
            if (!mapAgrupado[chave]) {
                dado.nomesResiduos = dado.residuo ? dado.residuo.nomeResiduo : 'Nenhum';
                dado.nomeUsuario = dado.User ? dado.User.nome : 'Usuário Desconhecido';
                
                // Formata a data para o Admin
                dado.solicitadoEmFormatado = dataCriacaoOriginal ? new Date(dataCriacaoOriginal).toLocaleString('pt-BR') : '—';
                
                mapAgrupado[chave] = dado;
            } else {
                if (dado.residuo && dado.residuo.nomeResiduo) {
                    mapAgrupado[chave].nomesResiduos += ', ' + dado.residuo.nomeResiduo;
                }
            }
        }

        res.render('admin-dashboard', { agendamentos: Object.values(mapAgrupado) });
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao carregar os dados.");
    }
};

// 🚨 NOVA FUNÇÃO CORRIGIDA PARA O DASHBOARD DO USUÁRIO COMUM
exports.listarAgendamentosUsuario = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : 9999;

        // Busca os dados complementares para os cards do dashboard do usuário
        const pontos = await PontoColeta.findAll();
        const residuos = await Residuo.findAll();

        // Busca apenas os agendamentos do usuário logado
        const agendamentosBrutos = await Agendamento.findAll({
            where: { UserId: userId },
            include: [
                { model: User },
                { model: PontoColeta, as: 'pontoColeta' },
                { model: Residuo, as: 'residuo' }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Agrupamento igual ao do Admin para juntar múltiplos resíduos na mesma linha
        const mapAgrupado = {};
        for (let ag of agendamentosBrutos) {
            const dataCriacaoOriginal = ag.createdAt; 
            const dado = ag.toJSON();
            const chave = dado.dataHora + '-' + dado.PontoColetaId + '-' + dado.UserId;
            
            if (!mapAgrupado[chave]) {
                dado.nomesResiduos = dado.residuo ? dado.residuo.nomeResiduo : 'Nenhum';
                dado.nomeUsuario = dado.User ? dado.User.nome : 'Eu';
                
                // 🔥 Injeta a variável solicitadoEmFormatado necessária para a tabela do Usuário!
                dado.solicitadoEmFormatado = dataCriacaoOriginal ? new Date(dataCriacaoOriginal).toLocaleString('pt-BR') : '—';
                
                mapAgrupado[chave] = dado;
            } else {
                if (dado.residuo && dado.residuo.nomeResiduo) {
                    mapAgrupado[chave].nomesResiduos += ', ' + dado.residuo.nomeResiduo;
                }
            }
        }

        // Renderiza a view do usuário passando todas as listas que ela pede
        res.render('dashboard', { 
            user: req.user || { nome: "Cidadão" },
            pontos: pontos,
            residuos: residuos,
            agendamentos: Object.values(mapAgrupado) 
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao carregar o dashboard do usuário.");
    }
};

exports.atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params; 
        const { novoStatus } = req.body; 

        const agendamentoRaw = await Agendamento.findOne({ where: { id: id } });
        if (agendamentoRaw) {
            await Agendamento.update(
                { status: novoStatus },
                { where: { dataHora: agendamentoRaw.dataHora, PontoColetaId: agendamentoRaw.PontoColetaId, UserId: agendamentoRaw.UserId } }
            );
        }

        res.redirect('/admin/dashboard');
    } catch (erro) {
        console.error(erro);
        res.status(500).send("Erro ao processar a alteração de status.");
    }
};