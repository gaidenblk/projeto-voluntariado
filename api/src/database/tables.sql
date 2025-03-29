-- Criação das tabelas Iniciais
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    apelido VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo VARCHAR(10) DEFAULT ('usuario') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    data TIMESTAMP NOT NULL,
    local VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_activity (
    atividade_id INT REFERENCES activities(id) ON DELETE CASCADE,
    usuario_id INT REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (atividade_id, usuario_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
