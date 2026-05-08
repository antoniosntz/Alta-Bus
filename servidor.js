// ============================================================
// AltaBus – servidor.js  v2.0  (PostgreSQL + Sessões + Traccar)
// ============================================================
require('dotenv').config();

const express        = require('express');
const cors           = require('cors');
const path           = require('path');
const bcrypt         = require('bcryptjs');
const session        = require('express-session');
const pgSession      = require('connect-pg-simple')(session);
const { Pool }       = require('pg');
const axios          = require('axios');
const { PrismaClient } = require('@prisma/client');

const app    = express();
const prisma = new PrismaClient();
const PORT   = process.env.PORT || 3000;

// ─── POOL PostgreSQL para sessões ──────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── MIDDLEWARES ───────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ─── SESSÃO ────────────────────────────────────────────────
app.use(session({
  store: new pgSession({
    pool,
    tableName: 'session',
    createTableIfMissing: true,   // cria a tabela de sessões automaticamente
  }),
  secret: process.env.SESSION_SECRET || 'altabus-secret-troque-em-producao',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 8 * 60 * 60 * 1000,  // 8 horas
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  },
}));

// ─── TRACCAR ───────────────────────────────────────────────
const TRACCAR_URL   = process.env.TRACCAR_URL   || 'https://demo4.traccar.org';
const TRACCAR_TOKEN = process.env.TRACCAR_TOKEN || 'RzBFAiBMAVwbm0fVj-WSv7oWQpn7iySaJW3xtH6IZ_PANBbKyQIhAMVNS34VL2Dn89bH2rTurqsv6F3-eOugE2qvWPyo4gPPeyJpIjo0Njg1NTQzNTEyNjIyODA2Mzg5LCJ1Ijo0OTYyNCwiZSI6IjIwMjYtMDUtMDhUMDM6MDA6MDAuMDAwKzAwOjAwIn0';
const DEVICE_ID     = process.env.TRACCAR_DEVICE_ID || '13519';

// ─── HELPERS ───────────────────────────────────────────────
function distanciaKm(lat1, lon1, lat2, lon2) {
  const toRad = (g) => (g * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function buscarLocalizacaoTraccar() {
  const resp = await axios.get(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
    headers: { Authorization: `Bearer ${TRACCAR_TOKEN}`, Accept: 'application/json' },
    timeout: 8000,
  });
  if (!resp.data || resp.data.length === 0) return null;
  const gps = resp.data[0];
  return {
    lat:       Number(gps.latitude),
    lng:       Number(gps.longitude),
    speed:     gps.speed ? Number((gps.speed * 1.852).toFixed(1)) : 0,
    fixTime:   gps.fixTime || null,
  };
}

// ─── MIDDLEWARE DE AUTENTICAÇÃO ─────────────────────────────
function requerLogin(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.status(401).json({ success: false, message: 'Não autenticado. Faça login.' });
}

function requerTipo(...tipos) {
  return (req, res, next) => {
    if (req.session?.usuario && tipos.includes(req.session.usuario.tipo)) return next();
    return res.status(403).json({ success: false, message: 'Acesso não autorizado.' });
  };
}

// ─── ROTAS PÚBLICAS ────────────────────────────────────────

// Health check
app.get('/health', (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// Sessão atual (o front usa para saber se está logado)
app.get('/sessao', (req, res) => {
  if (req.session?.usuario) {
    return res.json({ logado: true, usuario: req.session.usuario });
  }
  return res.json({ logado: false });
});

// Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
  }
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }
    const ok = await bcrypt.compare(String(senha), usuario.senhaHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos.' });
    }
    req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo };
    const redirect = usuario.tipo === 'motorista' ? 'motorista.html' : 'pontos.html';
    return res.json({ success: true, tipo: usuario.tipo, redirect });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
});

// Cadastro
app.post('/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body || {};
  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha nome, e-mail e senha.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ success: false, message: 'A senha deve ter pelo menos 6 caracteres.' });
  }
  try {
    const emailNorm = String(email).trim().toLowerCase();
    const existe = await prisma.usuario.findUnique({ where: { email: emailNorm } });
    if (existe) {
      return res.status(409).json({ success: false, message: 'E-mail já cadastrado.' });
    }
    const senhaHash = await bcrypt.hash(String(senha), 12);
    await prisma.usuario.create({
      data: { nome: String(nome).trim(), email: emailNorm, senhaHash, tipo: 'cliente' },
    });
    return res.json({ success: true, message: 'Cadastro realizado! Faça login.' });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
  }
});

// ─── ROTAS PROTEGIDAS (requer login) ───────────────────────

// Lista de pontos do banco
app.get('/pontos', requerLogin, async (req, res) => {
  try {
    const pontos = await prisma.ponto.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' },
    });
    return res.json({ success: true, pontos });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar pontos.' });
  }
});

// Localização atual do ônibus via Traccar
app.get('/localizacao-atual', requerLogin, async (req, res) => {
  try {
    const loc = await buscarLocalizacaoTraccar();
    if (!loc) return res.json({ success: false, message: 'Aguardando sinal GPS...' });
    return res.json({ success: true, ...loc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao consultar Traccar.' });
  }
});

// Tempo estimado até ponto
app.get('/tempo', requerLogin, async (req, res) => {
  const nomePonto = req.query.ponto;
  try {
    const ponto = await prisma.ponto.findFirst({ where: { nome: nomePonto, ativo: true } });
    if (!ponto) return res.status(404).json({ success: false, message: 'Ponto não encontrado.' });

    const gps = await buscarLocalizacaoTraccar();
    if (!gps) return res.json({ success: false, message: 'Aguardando sinal GPS...' });

    const distKm   = distanciaKm(gps.lat, gps.lng, ponto.latitude, ponto.longitude);
    const chegou   = distKm <= 0.05;
    const tempoMin = chegou ? 0 : Math.max(1, Math.round((distKm / 35) * 60));

    // Salva no histórico
    const veiculo = await prisma.veiculo.findFirst({ where: { deviceIdTraccar: DEVICE_ID } });
    if (veiculo) {
      await prisma.locHistorico.create({
        data: {
          veiculoId:  veiculo.id,
          latitude:   gps.lat,
          longitude:  gps.lng,
          velocidade: gps.speed,
          fixTime:    gps.fixTime ? new Date(gps.fixTime) : null,
        },
      });
    }

    return res.json({
      success: true,
      ponto: ponto.nome,
      distancia_km: distKm.toFixed(2),
      tempo_min: tempoMin,
      chegou,
      onibus: gps,
      status_texto: chegou ? '🚌 Ônibus chegou!' : '⏱ A caminho...',
    });
  } catch (err) {
    console.error('Erro em /tempo:', err.message);
    return res.status(500).json({ success: false, message: 'Erro ao calcular tempo.' });
  }
});

// Rastreio simplificado (para mapa)
app.get('/api/rastreio', requerLogin, async (req, res) => {
  try {
    const loc = await buscarLocalizacaoTraccar();
    if (!loc) return res.json({ success: false, message: 'Aguardando sinal GPS...' });
    return res.json({ success: true, ...loc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Erro ao consultar Traccar.' });
  }
});

// ─── ROTA CATCH-ALL (SPA) ──────────────────────────────────
app.get('/', (req, res) => {
  // Se a requisição for para um arquivo estático não encontrado, retorna 404
  if (req.path.includes('.')) return res.status(404).send('Not found');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── INICIALIZAÇÃO ─────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n✅ AltaBus rodando em: http://localhost:${PORT}`);
  console.log(`📍 Traccar Device ID : ${DEVICE_ID}`);
  try {
    await prisma.$connect();
    console.log('🗄️  PostgreSQL conectado com sucesso\n');
  } catch (e) {
    console.error('❌ Falha ao conectar no PostgreSQL:', e.message);
  }
});

module.exports = app;
