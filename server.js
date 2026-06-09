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

const app = express();

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

sequelize.sync({ force: false }).then(async () => {
  
  // =========================================================================
  // LOGICA DE CRIAÇÃO DO ADMINISTRADOR PADRÃO (SEED)
  // =========================================================================
  try {
    // 1. Procura na nuvem se já existe o e-mail do admin cadastrado
    const adminExistente = await User.findOne({ where: { email: 'admin@coleta.com' } });
    
    // 2. Se não existir, insere o usuário Admin automaticamente
    if (!adminExistente) {
      await User.create({
        nome: "Administrador Geral",
        email: "admin@coleta.com",
        senha: "admin", // 🚨 ATENÇÃO: Se o seu login usar criptografia como bcrypt, lembre-se de passar o hash criptografado aqui!
        tipo: "admin"   // Ajuste para 'role' se sua coluna no banco possuir esse nome
      });
      console.log('ℹ️ Usuário administrador padrão criado com sucesso no banco da nuvem!');
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

  app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
});