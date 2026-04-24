-- Criar o banco de dados (opcional, caso não tenha)
CREATE DATABASE IF NOT EXISTS altabus_db;
USE altabus_db;

-- Criar a tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Recomendado guardar o HASH da senha, não o texto puro
    tipo_usuario ENUM('aluno', 'motorista') DEFAULT 'aluno',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuários de teste
-- Nota: Em um sistema real, a senha '123456' estaria criptografada
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES 
('Antônio Almeida', 'cliente@altabus.com', '123456', 'aluno'),
('Motorista Principal', 'motorista@altabus.com', 'rota123', 'motorista');