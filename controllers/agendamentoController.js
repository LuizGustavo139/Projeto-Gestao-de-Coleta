const Agendamento = require('../models/Agendamento');
const User = require('../models/User');
const PontoColeta = require('../models/PontoColeta');
const Residuo = require('../models/Residuo');

// Função para o usuário comum criar um agendamento
exports.criarAgendamento = async (req, res) => {
    try {
        const { pontoColetaId, residuoId, endereco, dataHora } = req.body;
        // Pega o ID do usuário da sessão (ajuste se estiver usando JWT)
        const userId = req.session ? req.session.userId : req.user.id; 

        await Agendamento.create({
            dataHora: dataHora,
            endereco: endereco,
            status: 'Pendente',
            UserId: userId,
            PontoColetaId: pontoColetaId,
            ResiduoId: residuoId
        });

        res.redirect('/dashboard');
    } catch (erro) {
        console.error("Erro ao criar agendamento:", erro);
        res.status(500).send("Erro interno ao tentar agendar a coleta.");
    }
};

// Função para o administrador listar os agendamentos
exports.listarAgendamentosAdmin = async (req, res) => {
    try {
        const agendamentos = await Agendamento.findAll({
            include: [
                { model: User },
                { model: PontoColeta, as: 'pontoColeta' },
                { model: Residuo, as: 'residuo' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.render('admin-dashboard', { agendamentos });
    } catch (erro) {
        console.error("Erro ao carregar o painel administrativo:", erro);
        res.status(500).send("Erro ao carregar os dados.");
    }
};


exports.atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        const { novoStatus } = req.body; // Pega o status enviado pelo formulário (Aprovado ou Cancelado)

        // Atualiza o status no banco de dados MySQL
        await Agendamento.update(
            { status: novoStatus },
            { where: { id: id } }
        );

        // Recarrega a página do painel do admin para ver a alteração
        res.redirect('/admin/dashboard');
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        res.status(500).send("Erro ao processar a alteração de status.");
    }
};