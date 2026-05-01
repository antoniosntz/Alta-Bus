CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_usuario') THEN
        CREATE TYPE tipo_usuario AS ENUM ('motorista', 'cliente');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    tipo tipo_usuario NOT NULL DEFAULT 'cliente',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expira_em TIMESTAMPTZ NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pontos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL UNIQUE,
    latitude NUMERIC(10,6) NOT NULL,
    longitude NUMERIC(10,6) NOT NULL,
    ordem INTEGER,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS localizacoes_onibus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_motorista_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    latitude NUMERIC(10,6) NOT NULL,
    longitude NUMERIC(10,6) NOT NULL,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_localizacoes_atualizado_em ON localizacoes_onibus(atualizado_em DESC);

INSERT INTO pontos (nome, latitude, longitude, ordem) VALUES
('Ponto 1 - Posto Castelinho', -20.521139, -40.985417, 1),
('Ponto 2 - Posto Beira Rio', -20.596750, -41.023194, 2),
('Ponto 3 - Campo de fruteiras', -20.604611, -41.028278, 3),
('Ponto 4 - Departamento', -20.618194, -41.024694, 4),
('Ponto 5 - Rancho da Lagoa', -20.627472, -41.016222, 5),
('Ponto 6 - Ponte do AYD', -20.636999, -41.014028, 6),
('Ponto 7 - Supermercado da Vila Esperança', -20.655694, -41.019333, 7),
('Ponto 8 - Rodoviária de Vargem Alta', -20.673694, -41.010972, 8),
('Ponto 9 - Oficina Jacigua', -20.706889, -41.027472, 9),
('Ponto 10 - Casarão', -20.705000, -41.019889, 10),
('Ponto 11 - Bar do Machados', -20.705500, -41.017694, 11),
('Ponto 12 - Bar da Linha', -20.710750, -41.016222, 12),
('Ponto 14 - CEET Giuseppe Altoe', -20.721583, -41.010861, 14)
ON CONFLICT (nome) DO NOTHING;

INSERT INTO usuarios (nome, email, senha_hash, tipo) VALUES
('Motorista AltaBus', 'motorista@altabus.com', 'HASH_BCRYPT_AQUI', 'motorista'),
('Antonio', 'cliente@altabus.com', 'HASH_BCRYPT_AQUI', 'cliente'),
('Kaillan', 'cliente1@altabus.com', 'HASH_BCRYPT_AQUI', 'cliente'),
('Carolina', 'passonicarol@gmail.com', 'HASH_BCRYPT_AQUI', 'cliente');

