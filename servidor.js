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
// Rota de Cadastro
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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Servidor em http://localhost:${PORT}`));