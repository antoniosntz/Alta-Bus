// --- FUNÇÕES DE LOGIN E CADASTRO ---

async function validarLogin() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    try {
        const resposta = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (dados.success) {
            window.location.href = dados.redirect;
        } else {
            alert(dados.message || "E-mail ou senha incorretos.");
        }
    } catch (erro) {
        console.error("Erro na conexão:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

async function registrarUsuario() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
        const resposta = await fetch('/cadastrar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha })
        });

        const dados = await resposta.json();

        if (dados.success) {
            alert("Usuário cadastrado com sucesso!");
            window.location.href = "login.html";
        } else {
            alert(dados.message);
        }
    } catch (erro) {
        console.error("Erro ao cadastrar:", erro);
    }
}

// --- FUNÇÕES DE NAVEGAÇÃO ---

function continuar() {
    const select = document.getElementById("pontoSelect");
    if (!select || !select.value) {
        alert("Selecione um ponto!");
        return;
    }
    
    localStorage.setItem("pontoCoordenadas", select.value);
    localStorage.setItem("pontoNome", select.options[select.selectedIndex].text);
    window.location.href = "cliente.html";
}

function voltar() {
    window.history.back();
}

function irParaCadastro() {
    window.location.href = "cadastro.html";
}

// --- LÓGICA DO MAPA (LEAFLET) ---
// Esta parte só vai rodar se o mapa existir na tela (cliente.html)

var map, markerOnibus, markerPonto;

function inicializarMapa() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return; // Se não estiver na tela do mapa, para aqui.

    map = L.map('map').setView([-20.721583, -41.010861], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    markerOnibus = L.marker([-20.721583, -41.010861]).addTo(map).bindPopup("Ônibus AltaBus");
    markerPonto = L.marker([0,0]).addTo(map).bindPopup("Seu Ponto");

    setInterval(atualizarPosicaoMapa, 5000);
}

async function atualizarPosicaoMapa() {
    const coordenadas = localStorage.getItem("pontoCoordenadas");
    if (!coordenadas) return;

    try {
        const [pLat, pLng] = coordenadas.split(',').map(Number);
        markerPonto.setLatLng([pLat, pLng]);

        const respGps = await fetch('/localizacao-atual');
        const gps = await respGps.json();
        
        markerOnibus.setLatLng([gps.lat, gps.lng]);
        // Opcional: map.panTo([gps.lat, gps.lng]); // Seguir o ônibus
    } catch (e) {
        console.error("Erro ao atualizar mapa:", e);
    }
}

// Inicia o mapa se o Leaflet estiver carregado
window.onload = function() {
    if (typeof L !== 'undefined') {
        inicializarMapa();
    }
};