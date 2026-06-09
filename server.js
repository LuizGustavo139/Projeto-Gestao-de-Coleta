const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// ALTERADO: Adicionado 'User' na desestruturação dos modelos
const { sequelize, PontoColeta, Residuo, User } = require('./models');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const agendamentoController = require('./controllers/agendamentoController');
const authRoutes = require('./routes/authRoutes');
const pontoRoutes = require('./routes/pontoRoutes');
const residuoRoutes = require('./routes/residuoRoutes');
const pontoColetaRoutes = require('./routes/pontoColetaRoutes');

// IMPORTAÇÃO DOS MIDDLEWARES DE SEGURANÇA
const { estaLogado, eAdmin } = require('./middleware/authMiddleware');

const app = express(); // 🚀 CORRIGIDO: Removido o 'report ||' que quebrava o script

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Rota raiz
app.get('/dashboard', (req, res) => res.redirect('/pontos'));
app.get('/', (req, res) => res.render('index'));

app.use('/auth', authRoutes);
app.use('/pontos', pontoRoutes);            
app.use('/residuos', residuoRoutes);        
app.use('/pontos-coleta', pontoColetaRoutes);

// ROTAS PROTEGIDAS COM MIDDLEWARES
app.get('/admin/dashboard', estaLogado, eAdmin, agendamentoController.listarAgendamentosAdmin);
app.post('/agendamentos/novo', estaLogado, agendamentoController.criarAgendamento);
app.post('/admin/agendamentos/:id/status', estaLogado, eAdmin, agendamentoController.atualizarStatus);

const PORT = process.env.PORT || 3000;

// 🚀 Retornado para force: false para estabilizar seu banco de dados
sequelize.sync({ force: false }).then(async () => {
  
  // =========================================================================
  // LOGICA DE CRIAÇÃO DO ADMINISTRADOR PADRÃO EM TEXTO PURO (SEM REQUERER BCRYPT)
  // =========================================================================
  try {
    const adminExistente = await User.findOne({ where: { email: 'admin@coleta.com' } });
    
    if (!adminExistente) {
      await User.create({
        nome: "Administrador Geral",
        email: "admin@coleta.com",
        senha: "admin", // Salva o texto puro. O authController que alteramos vai fazer o desvio!
        isAdmin: true   // 🚨 Usando a coluna exata 'isAdmin' booleana que o seu controller lê
      });
      console.log('ℹ️ Usuário administrador alinhado e salvo com sucesso!');
    }
  } catch (error) {
    console.error('⚠️ Erro ao executar o seed do administrador:', error);
  }
  // =========================================================================

  const contagemPontos = await PontoColeta.count();
  if (contagemPontos === 0) {
    await PontoColeta.bulkCreate([
      { nomePonto: 'EcoPonto Centro', endereco: 'Rua Principal, 100', residuosAceitos: 'Plástico, Vidro' },
      { nomePonto: 'EcoPonto Bairro Norte', endereco: 'Av. das Nações, 450', residuosAceitos: 'Papel, Metal' },
      { nomePonto: 'Posto Eletrônicos', endereco: 'Rua da Tecnologia, 77', residuosAceitos: 'Eletrônicos' }
    ]);

    await Residuo.bulkCreate([
      { nomeResiduo: 'Papel', descricao: 'Jornais, revistas, caixas de papelão e embalagens.' },
      { nomeResiduo: 'Vidro', descricao: 'Garrafas, potes e frascos inteiros.' },
      { nomeResiduo: 'Eletrônico', descricao: 'Celulares velhos, pilhas, baterias e computadores.' },
      { nomeResiduo: 'Metal', descricao: 'Latinhas de alumínio e tampas de metal.' }
    ]);
    console.log('✅ Dados de demonstração injetados com sucesso.');
  }

  app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
});