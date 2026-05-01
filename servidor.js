const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios'); // Você precisará instalar: npm install axios

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// CONFIGURAÇÕES DO TRACCAR
const TRACCAR_URL = 'https://demo4.traccar.org'; // Ou o IP do seu servidor Traccar
const TRACCAR_TOKEN = 'EyJkYXRhIjo1MzU1OX0uWDdPSGQxS2dvQ2oyM25GZWVSZytGWkFQdFpSbVlJNC9YWmNyZE5Cbld6QQ'; // CHAVE DE API
const DEVICE_ID = '97194109'; // O ID do dispositivo que você cadastrou no Traccar

// Rota para o Aluno buscar a posição do ônibus (vinda do Traccar)
app.get('/api/rastreio', async (req, res) => {
    try {
        // Chamada oficial para a API do Traccar usando sua chave
        const response = await axios.get(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
            headers: {
                'Authorization': `Bearer ${TRACCAR_TOKEN}` // Se for Token
                // 'Authorization': `Basic ${btoa('email:senha')}` // Se for login comum
            }
        });

        const dadosGps = response.data[0]; // Pega a posição mais recente

        if (dadosGps) {
            res.json({
                success: true,
                lat: dadosGps.latitude,
                lng: dadosGps.longitude,
                velocidade: dadosGps.speed,
                ultimaAtualizacao: dadosGps.deviceTime
            });
        } else {
            res.json({ success: false, message: "Ônibus offline" });
        }
    } catch (error) {
        console.error("Erro Traccar:", error);
        res.status(500).json({ success: false });
    }
});

app.listen(3000, () => {
    console.log("------------------------------------------");
    console.log("🚀 AltaBus conectado ao TRACCAR DEMO4");
    console.log("📍 Endereço: http://localhost:3000");
    console.log("------------------------------------------");
});