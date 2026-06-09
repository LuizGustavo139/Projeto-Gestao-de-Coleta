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
            const dado = ag.toJSON();
            const chave = dado.dataHora + '-' + dado.PontoColetaId + '-' + dado.UserId;
            
            if (!mapAgrupado[chave]) {
                dado.nomesResiduos = dado.residuo ? dado.residuo.nomeResiduo : 'Nenhum';
                // Garante que a propriedade nomeUsuario exista para a tabela ler sem quebrar
                dado.nomeUsuario = dado.User ? dado.User.nome : 'Usuário Desconhecido';
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