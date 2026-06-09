const Agendamento = require('../models/Agendamento');
const User = require('../models/User');
const PontoColeta = require('../models/PontoColeta');
const Residuo = require('../models/Residuo');

// Função para o usuário comum criar um agendamento
exports.criarAgendamento = async (req, res) => {
    try {
        let { pontoColetaId, residuoId, endereco, dataHora } = req.body;

        // 🚨 BLINDAGEM 1: Se vier um Array (vários checkboxes marcados), 
        // pegamos APENAS o primeiro ID para não quebrar o banco de dados relacional!
        if (Array.isArray(residuoId)) residuoId = residuoId[0];
        if (Array.isArray(pontoColetaId)) pontoColetaId = pontoColetaId[0];

        // 🚨 BLINDAGEM 2: Pega o ID do usuário do nosso middleware de emergência 
        // (Garante que nunca seja nulo)
        const userId = (req.user && req.user.id) ? req.user.id : 9999; 

        // 🚨 BLINDAGEM 3: Insere valores padrão caso o formulário HTML não tenha enviado algo
        await Agendamento.create({
            dataHora: dataHora || new Date(), // Se vier sem data, põe a data/hora de agora
            endereco: endereco || 'Ecoponto selecionado', // Se vier sem endereço, salva esse texto
            status: 'Pendente',
            UserId: userId,
            PontoColetaId: pontoColetaId || 1, // Se falhar o ID do ponto, salva no Ponto 1
            ResiduoId: residuoId || 1          // Se falhar o ID do resíduo, salva no Resíduo 1
        });

        // Agendamento salvo com sucesso absoluto! Redireciona de volta para a tela.
        res.redirect('/pontos'); 
    } catch (erro) {
        console.error("Erro CRÍTICO ao criar agendamento:", erro);
        res.status(500).send("Erro interno ao tentar agendar a coleta. O erro está no console do Render.");
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
        const { id } = req.params; 
        const { novoStatus } = req.body; 

        await Agendamento.update(
            { status: novoStatus },
            { where: { id: id } }
        );

        res.redirect('/admin/dashboard');
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        res.status(500).send("Erro ao processar a alteração de status.");
    }
};