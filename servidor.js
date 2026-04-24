const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const BANCO_FILE = path.join(__dirname, 'banco.json');

const md5 = (senha) => crypto.createHash('md5').update(String(senha || '')).digest('hex');

const PONTOS = [
  { nome: 'Ponto 1 - Posto Castelinho', lat: -20.521139, lng: -40.985417 },
  { nome: 'Ponto 2 - Posto Beira Rio', lat: -20.596750, lng: -41.023194 },
  { nome: 'Ponto 3 - Campo de fruteiras', lat: -20.604611, lng: -41.028278 },
  { nome: 'Ponto 4 - Departamento', lat: -20.618194, lng: -41.024694 },
  { nome: 'Ponto 5 - Rancho da Lagoa', lat: -20.627472, lng: -41.016222 },
  { nome: 'Ponto 6 - Ponte do AYD', lat: -20.636999, lng: -41.014028 },
  { nome: 'Ponto 7 - Supermercado da Vila Esperança', lat: -20.655694, lng: -41.019333 },
  { nome: 'Ponto 8 - Rodoviária de Vargem Alta', lat: -20.673694, lng: -41.010972 },
  { nome: 'Ponto 9 - Oficina Jacigua', lat: -20.706889, lng: -41.027472 },
  { nome: 'Ponto 10 - Casarão', lat: -20.705000, lng: -41.019889 },
  { nome: 'Ponto 11 - Bar do Machados', lat: -20.705500, lng: -41.017694 },
  { nome: 'Ponto 12 - Bar da Linha', lat: -20.710750, lng: -41.016222 },
  { nome: 'Ponto 14 - CEET Giuseppe Altoe', lat: -20.721583, lng: -41.010861 },
];

let localizacaoAtual = {
  lat: -20.721583,
  lng: -41.010861,
  atualizadoEm: null,
};

// Variável para guardar o estado atual do ônibus na memória do servidor
let statusAtualOnibus = 'normal'; 

function normalizarUsuarios(usuarios) {
  return (Array.isArray(usuarios) ? usuarios : []).map((u) => ({
    nome: u.nome || 'Usuário',
    email: String(u.email || '').trim().toLowerCase(),
    senha: u.senha || md5('123456'),
    tipo: u.tipo || 'cliente',
  }));
}

function lerBanco() {
  try {
    if (!fs.existsSync(BANCO_FILE)) return [];
    const data = fs.readFileSync(BANCO_FILE, 'utf8');
    return normalizarUsuarios(JSON.parse(data || '[]'));
  } catch (err) {
    console.error('Erro ao ler banco.json:', err);
    return [];
  }
}

function salvarBanco(usuarios) {
  if (IS_VERCEL) {
    throw new Error('Ambiente Vercel não permite persistência local em arquivo.');
  }
  fs.writeFileSync(BANCO_FILE, JSON.stringify(normalizarUsuarios(usuarios), null, 2));
}

function distanciaKm(lat1, lon1, lat2, lon2) {
  const toRad = (graus) => (graus * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get('/health', (req, res) => {
  res.json({ ok: true, vercel: IS_VERCEL, localizacaoAtual });
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  const usuarios = lerBanco();
  const senhaHash = md5(senha);
  const usuario = usuarios.find(
    (u) => u.email === String(email || '').trim().toLowerCase() && u.senha === senhaHash
  );

  if (!usuario) {
    return res.status(401).json({ success: false, message: 'E-mail ou senha incorretos!' });
  }

  return res.json({
    success: true,
    tipo: usuario.tipo,
    redirect: usuario.tipo === 'motorista' ? 'motorista.html' : 'pontos.html',
  });
});

app.post('/cadastrar', (req, res) => {
  const { nome, email, senha, tipo } = req.body || {};

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, message: 'Preencha nome, e-mail e senha.' });
  }

  const usuarios = lerBanco();
  const emailNormalizado = String(email).trim().toLowerCase();

  if (usuarios.find((u) => u.email === emailNormalizado)) {
    return res.status(409).json({ success: false, message: 'E-mail já cadastrado!' });
  }

  const novoUsuario = {
    nome: String(nome).trim(),
    email: emailNormalizado,
    senha: md5(senha),
    tipo: tipo === 'motorista' ? 'motorista' : 'cliente',
  };

  try {
    salvarBanco([...usuarios, novoUsuario]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'No Vercel o cadastro em arquivo não persiste. Para funcionar online, use um banco de dados.',
    });
  }
});

app.post('/localizacao', (req, res) => {
  const { lat, lng } = req.body || {};
  const latNum = Number(lat);
  const lngNum = Number(lng);

  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
    return res.status(400).json({ success: false, message: 'Latitude e longitude inválidas.' });
  }

  localizacaoAtual = {
    lat: latNum,
    lng: lngNum,
    atualizadoEm: new Date().toISOString(),
  };

  return res.json({ success: true, localizacaoAtual });
});

/* ROTA DE ATUALIZAÇÃO DO MOTORISTA */
app.post('/atualizar-status-onibus', (req, res) => {
    const { status } = req.body;
    if (status) {
        statusAtualOnibus = status;
        console.log(`Status do ônibus atualizado para: ${status}`);
        return res.sendStatus(200);
    }
    res.sendStatus(400);
});

/* ROTA UNIFICADA DO ALUNO (Calcula distância E busca o status) */
app.get('/tempo', (req, res) => {
  const nomePonto = req.query.ponto;
  const ponto = PONTOS.find((p) => p.nome === nomePonto);

  if (!ponto) {
    return res.status(404).json({ success: false, message: 'Ponto não encontrado.' });
  }

  // Seus cálculos de distância originais que estavam funcionando
  const distKm = distanciaKm(localizacaoAtual.lat, localizacaoAtual.lng, ponto.lat, ponto.lng);
  const velocidadeMediaKmH = 35;
  const tempoMin = Math.max(1, Math.round((distKm / velocidadeMediaKmH) * 60));

  // Objeto de tradução do motorista
  const mensagensStatus = {
      'normal': 'A caminho...',
      'transito': 'Trânsito Lento ⚠️',
      'quebrado': 'Ônibus Quebrou ❌',
      'desvio': 'Rota Desviada ↪️'
  };

  // Resposta unificada de sucesso!
  return res.json({
    success: true,
    ponto: ponto.nome,
    distancia_km: distKm.toFixed(2),
    tempo_min: tempoMin,
    onibus: localizacaoAtual,
    status_texto: mensagensStatus[statusAtualOnibus] || 'A caminho...' // Linha mágica adicionada
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!IS_VERCEL) {
  app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
}

module.exports = app;