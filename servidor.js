/*
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');
// Configurações para conexão com o Traccar API
const TRACCAR_URL = 'https://demo4.traccar.org';
const DEVICE_ID = '13519'; 
const TRACCAR_TOKEN = 'RzBFAiBMAVwbm0fVj-WSv7oWQpn7iySaJW3xtH6IZ_PANBbKyQIhAMVNS34VL2Dn89bH2rTurqsv6F3-eOugE2qvWPyo4gPPeyJpIjo0Njg1NTQzNTEyNjIyODA2Mzg5LCJ1Ijo0OTYyNCwiZSI6IjIwMjYtMDUtMDhUMDM6MDA6MDAuMDAwKzAwOjAwIn0';

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

/* Não será usado
let localizacaoAtual = {
  lat: -20.721583,
  lng: -41.010861,
  atualizadoEm: null,
};
*/
/*
function localizacaoOnibus() {
  const response = axios.get(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
            headers: { 
                'Authorization': `Bearer ${TRACCAR_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.length > 0) {
            console.log(
              response.data[0].latitude,
              response.data[0].longitude,
            );
        } else {
            console.log("⚠️ Conectado, mas o dispositivo não enviou localizações ainda.");
        }
        /*
    try {
        
    } catch (error) {
        console.error("❌ Erro ao conectar:", error.response ? error.response.status : error.message);
    }
        
}*/
/*
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

/* Banco de Dados Local (JSON) - Não serpa usado
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
*/
/*
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

  localizacaoOnibus = {
    lat: latNum,
    lng: lngNum
  };

  return res.json({ success: true, localizacaoOnibus });
});

/* ROTA DE ATUALIZAÇÃO DO MOTORISTA */
/*
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
/*
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

// Rota que alimenta o mapa
app.get('/api/rastreio', async (req, res) => {
    try {
        const response = axios.get(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
            headers: { 
                'Authorization': `Bearer ${TRACCAR_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.length > 0) {
            const gps = response.data[0];
            res.json({
                success: true,
                lat: gps.latitude,
                lng: gps.longitude,
                speed: (gps.speed * 1.852).toFixed(1), // Nós para Km/h
                lastUpdate: gps.deviceTime
            });
        } else {
            res.json({ success: false, message: "Aguardando sinal do GPS..." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Erro na API Traccar" });
    }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!IS_VERCEL) {
  app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));
}

app.listen(PORT, () => {
    console.log(`\n✅ AltaBus Online: http://localhost:${PORT}`);
    console.log(`📍 Rastreando Dispositivo: ${DEVICE_ID}\n`);
});

module.exports = app;
*/



const express = require('express');
const cors = require('cors');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;
const BANCO_FILE = path.join(__dirname, 'banco.json');

const TRACCAR_URL = process.env.TRACCAR_URL || 'https://demo4.traccar.org';
const DEVICE_ID = process.env.TRACCAR_DEVICE_ID || '13519';
const TRACCAR_TOKEN = process.env.TRACCAR_TOKEN || 'RzBFAiBMAVwbm0fVj-WSv7oWQpn7iySaJW3xtH6IZ_PANBbKyQIhAMVNS34VL2Dn89bH2rTurqsv6F3-eOugE2qvWPyo4gPPeyJpIjo0Njg1NTQzNTEyNjIyODA2Mzg5LCJ1Ijo0OTYyNCwiZSI6IjIwMjYtMDUtMDhUMDM6MDA6MDAuMDAwKzAwOjAwIn0';

const md5 = (senha) =>
  crypto.createHash('md5').update(String(senha || '')).digest('hex');

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

//let statusAtualOnibus = 'normal';

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
    console.error('Erro ao ler banco.json:', err.message);
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

async function buscarLocalizacaoOnibus() {
  const response = await axios.get(
    `${TRACCAR_URL}/api/positions?deviceId=${encodeURIComponent(DEVICE_ID)}`,
    {
      headers: {
        Authorization: `Bearer ${TRACCAR_TOKEN}`,
        Accept: 'application/json',
      },
    }
  );

  if (response.data && response.data.length > 0) {
    const gps = response.data[0];
    return {
      lat: Number(gps.latitude),
      lng: Number(gps.longitude),
      speed: gps.speed ? Number((gps.speed * 1.852).toFixed(1)) : 0,
      lastUpdate: gps.deviceTime || gps.fixTime || gps.serverTime || null,
    };

  }

  return null;
}

async function verificarLocalizacao() {
  try {
    const response = await axios.get(
      `${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TRACCAR_TOKEN}`,
          Accept: 'application/json'
        }
      }
    );

    if (response.data && response.data.length > 0) {
      console.log('📍 Localização atual:', response.data[0].latitude, response.data[0].longitude, response.data[0].fixTime);
    } else {
      console.log('⚠️ Conectado, mas o dispositivo não enviou localizações ainda.');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.response ? error.response.status : error.message);
  }
}

app.get('/health', async (req, res) => {
  try {
    const localizacaoAtual = await buscarLocalizacaoOnibus();
    res.json({ ok: true, vercel: IS_VERCEL, localizacaoAtual });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Erro ao consultar Traccar.',
      detalhe: error.response?.data || error.message,
    });
  }
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body || {};
  const usuarios = lerBanco();
  const senhaHash = md5(senha);

  const usuario = usuarios.find(
    (u) =>
      u.email === String(email || '').trim().toLowerCase() &&
      u.senha === senhaHash
  );

  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'E-mail ou senha incorretos!',
    });
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
    return res.status(400).json({
      success: false,
      message: 'Preencha nome, e-mail e senha.',
    });
  }

  const usuarios = lerBanco();
  const emailNormalizado = String(email).trim().toLowerCase();

  if (usuarios.find((u) => u.email === emailNormalizado)) {
    return res.status(409).json({
      success: false,
      message: 'E-mail já cadastrado!',
    });
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
      message: 'No Vercel o cadastro em arquivo não persiste. Use PostgreSQL.',
    });
  }
});

app.post('/atualizar-status-onibus', (req, res) => {
  const { status } = req.body || {};
  if (!status) {
    return res.status(400).json({ success: false, message: 'Status inválido.' });
  }

  statusAtualOnibus = status;
  return res.json({ success: true, status: statusAtualOnibus });
});

app.get('/tempo', async (req, res) => {
  const nomePonto = req.query.ponto;
  const ponto = PONTOS.find((p) => p.nome === nomePonto);

  if (!ponto) {
    return res.status(404).json({ success: false, message: 'Ponto não encontrado.' });
  }

  try {
    const response = await axios.get(
      `${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`,
      {
        headers: {
          Authorization: `Bearer ${TRACCAR_TOKEN}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo sem localização.'
      });
    }

    const gps = response.data[0];

    const distKm = distanciaKm(
      Number(gps.latitude),
      Number(gps.longitude),
      ponto.lat,
      ponto.lng
    );

    const velocidadeMediaKmH = 35;
    const tempoMin = Math.max(1, Math.round((distKm / velocidadeMediaKmH) * 60));

    
    const raioChegadaKm = 0.05;
const chegou = distKm <= raioChegadaKm;

return res.json({
  success: true,
  ponto: ponto.nome,
  distancia_km: distKm.toFixed(2),
  tempo_min: chegou ? 0 : tempoMin,
  chegou,
  onibus: {
    lat: Number(gps.latitude),
    lng: Number(gps.longitude),
    speed: gps.speed ? Number((gps.speed * 1.852).toFixed(1)) : 0,
    fixTime: gps.fixTime || null
  },
  status_texto: chegou ? 'Ônibus chegou!' : 'A caminho...'
});
  } catch (error) {
    console.error('Erro na rota /tempo:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar localização do ônibus.'
    });
  }
});

app.get('/api/rastreio', async (req, res) => {
  try {
    const localizacaoAtual = await buscarLocalizacaoOnibus();

    if (!localizacaoAtual) {
      return res.json({
        success: false,
        message: 'Aguardando sinal do GPS...',
      });
    }

    return res.json({
      success: true,
      lat: localizacaoAtual.lat,
      lng: localizacaoAtual.lng,
      speed: localizacaoAtual.speed,
      lastUpdate: localizacaoAtual.lastUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro na API Traccar',
      detalhe: error.response?.data || error.message,
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ AltaBus Online: http://localhost:${PORT}`);
    console.log(`📍 Rastreando Dispositivo: ${DEVICE_ID}`);
    verificarLocalizacao();
  });
}

module.exports = app;
