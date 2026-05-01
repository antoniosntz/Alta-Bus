// Inicia o mapa (Leaflet)
var map = L.map('map', { zoomControl: false }).setView([-20.721, -41.010], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Ícone do ônibus
var iconBus = L.icon({
    iconUrl: 'ALTA_BUS__3_-removebg-preview (2).png',
    iconSize: [50, 50]
});
var markerBus = L.marker([-20.721, -41.010], { icon: iconBus }).addTo(map);

// public/js/cliente.js

async function atualizarPosicao() {
    const res = await API.buscarGpsTraccar(); // Função que criamos no api.js
    
    if (res && res.success) {
        // 1. Move o marcador no mapa
        markerBus.setLatLng([res.lat, res.lng]);

        // 2. Atualiza os textos na tela (IDs precisam bater com seu HTML)
        document.getElementById("distancia").innerText = "2.5 km"; // Exemplo fixo por enquanto
        document.getElementById("tempo").innerText = "10 min";    // Exemplo fixo por enquanto
        
        // 3. Atualiza o ponto (buscando do localStorage que salvamos na tela anterior)
        const pontoSalvo = localStorage.getItem("pontoEscolhido");
        if(pontoSalvo) {
            document.querySelector(".seu-ponto-classe").innerText = pontoSalvo;
        }
    }
}

// Atualiza a cada 3 segundos (3000ms)
setInterval(atualizarPosicao, 3000);
atualizarPosicao();