const axios = require('axios');

const TRACCAR_URL = 'https://demo4.traccar.org'; //
const DEVICE_ID = '13519'; //
const TRACCAR_TOKEN = 'RzBFAiBMAVwbm0fVj-WSv7oWQpn7iySaJW3xtH6IZ_PANBbKyQIhAMVNS34VL2Dn89bH2rTurqsv6F3-eOugE2qvWPyo4gPPeyJpIjo0Njg1NTQzNTEyNjIyODA2Mzg5LCJ1Ijo0OTYyNCwiZSI6IjIwMjYtMDUtMDhUMDM6MDA6MDAuMDAwKzAwOjAwIn0';

async function testarConexao() {
    console.log("Tentando conectar ao Demo4...");
    try {
        const response = await axios.get(`${TRACCAR_URL}/api/positions?deviceId=${DEVICE_ID}`, {
            headers: { 
                'Authorization': `Bearer ${TRACCAR_TOKEN}`,
                'Accept': 'application/json'
            }
        });

        if (response.data.length > 0) {
            console.log("✅ Conexão bem-sucedida!");
            console.log("📍 Localização atual:", response.data[0].latitude, response.data[0].longitude, response.data[0].speed);
        } else {
            console.log("⚠️ Conectado, mas o dispositivo não enviou localizações ainda.");
        }
    } catch (error) {
        console.error("❌ Erro ao conectar:", error.response ? error.response.status : error.message);
    }
}

testarConexao();