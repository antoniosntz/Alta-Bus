const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const BANCO_FILE = path.join(__dirname, 'banco.json');

// Função para criptografar em MD5
const md5 = (senha) => crypto.createHash('md5').update(senha).digest('hex');

// Função para ler o banco JSON
const lerBanco = () => {
    try {
        if (!fs.existsSync(BANCO_FILE)) return [];
        const data = fs.readFileSync(BANCO_FILE, 'utf8');
        return JSON.parse(data || "[]");
    } catch (err) {
        return [];
    }
};

// Rota de Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const usuarios = lerBanco();
    const senhaHash = md5(senha);

    const usuario = usuarios.find(u => u.email === email && u.senha === senhaHash);

    if (usuario) {
        res.json({ 
            success: true, 
            redirect: usuario.tipo === 'motorista' ? 'motorista.html' : 'pontos.html' 
        });
    } else {
        res.json({ success: false, message: "E-mail ou senha incorretos!" });
    }
});

/*
// Rota de Cadastro com MySQL
app.post('/cadastrar', (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    const usuarios = lerBanco();

    if (usuarios.find(u => u.email === email)) {
        return res.json({ success: false, message: "E-mail já cadastrado!" });
    }

    const novoUsuario = { nome, email, senha: md5(senha), tipo };
    usuarios.push(novoUsuario);

    try {
        fs.writeFileSync(BANCO_FILE, JSON.stringify(usuarios, null, 2));
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erro ao salvar dados." });
    }
});
*/

app.post('/cadastrar', (req, res) => {
    const { nome, email, senha, tipo } = req.body;
    
    // 1. Ler os usuários atuais
    let usuarios = [];
    if (fs.existsSync(BANCO_FILE)) {
        usuarios = JSON.parse(fs.readFileSync(BANCO_FILE, 'utf-8'));
    }

    // 2. Verificar se o email já existe
    if (usuarios.find(u => u.email === email)) {
        return res.json({ success: false, message: "E-mail já cadastrado!" });
    }

    // 3. Criar novo usuário com senha em MD5
    const novoUsuario = { 
        nome, 
        email, 
        senha: md5(senha), 
        tipo 
    };

    // 4. Salvar de volta no arquivo
    usuarios.push(novoUsuario);
    fs.writeFileSync(BANCO_FILE, JSON.stringify(usuarios, null, 2));

    res.json({ success: true });
});


const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA2ODM5NWRlZjQ2YzQ0MzlhNTE5Mzg1ZTBhYWU0MjhjIiwiaCI6Im11cm11cjY0In0=";

// Adicione esta lista no seu servidor.js
const pontos = [
    {nome:"Ponto 1 - Posto Castelinho", lat:-20.521139, lng:-40.985417},
    {nome:"Ponto 2 - Posto Beira Rio", lat:-20.596750, lng:-41.023194},
    {nome:"Ponto 3 - Campo de fruteiras", lat:-20.604611, lng:-41.028278},
    {nome:"Ponto 4 - Departamento", lat:-20.618194, lng:-41.024694},
    {nome:"Ponto 5 - Rancho da Lagoa", lat:-20.627472, lng:-41.016222},
    {nome:"Ponto 6 - Ponte do AYD", lat:-20.636999, lng:-41.014028},
    {nome:"Ponto 7 - Supermercado da Vila Esperança", lat:-20.655694, lng:-41.019333},
    {nome:"Ponto 8 - Rodoviária de Vargem Alta", lat:-20.673694, lng:-41.010972},
    {nome:"Ponto 9 - Oficina Jacigua", lat:-20.706889, lng:-41.027472},
    {nome:"Ponto 10 - Casarão", lat:-20.705000, lng:-41.019889},
    {nome:"Ponto 11 - Bar do Machados", lat:-20.705500, lng:-41.017694},
    {nome:"Ponto 12 - Bar da Linha", lat:-20.710750, lng:-41.016222},
    {nome:"Ponto 14 - CEET Giuseppe Altoe", lat:-20.721583, lng:-41.010861}
];
app.post("/localizacao", (req,res)=>{

    const {lat,lng} = req.body;

    localizacaoOnibus = {lat,lng};

    console.log("Localização recebida:",localizacaoOnibus);

    res.json({ok:true});

});

app.get("/tempo", async (req,res)=>{

const pontoNome = req.query.ponto;

if(!localizacaoOnibus){

return res.json({
distancia_km:"--",
tempo_min:"--",
ponto:"--"
});

}

try{

// encontrar o ponto escolhido
const pontoSelecionado =
pontos.find(p => p.nome === pontoNome);

if(!pontoSelecionado){

return res.json({
distancia_km:"--",
tempo_min:"--",
ponto:"Selecione um ponto"
});

}

const resposta = await axios.get(
"https://api.openrouteservice.org/v2/directions/driving-car",
{
headers:{ Authorization: API_KEY },
params:{
start:`${localizacaoOnibus.lng},${localizacaoOnibus.lat}`,
end:`${pontoSelecionado.lng},${pontoSelecionado.lat}`
}
}
);

const dados = resposta.data;

const distancia =
dados.features[0].properties.summary.distance;

const duracao =
dados.features[0].properties.summary.duration;

res.json({

ponto:pontoSelecionado.nome,
distancia_km:(distancia/1000).toFixed(2),
tempo_min:Math.round(duracao/60)

});

}catch(e){

console.log(e.message);

res.json({
distancia_km:"--",
tempo_min:"--",
ponto:"Erro"
});

}

});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));