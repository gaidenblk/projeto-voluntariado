# _🌟 Vombora!_

## Projeto Voluntariado

Este é um sistema de **gestão de atividades voluntárias** desenvolvido com foco em simplicidade, performance e organização.

> 🔐 Possui autenticação JWT, controle de participação por data e limite de vagas, e interface protegida para administradores.

---

## 🚀 Tecnologias Utilizadas

- **Node.js (puro)** – sem frameworks!
- **HTML, CSS e JavaScript puro (vanilla)**
- **PostgreSQL**
- **Docker**
- **Rate Limiting personalizado**

---

## 📋 Funcionalidades

### 👥 Usuários

- Registro e login com autenticação JWT
- Participação em atividades
- Cancelamento da inscrição (antes da data de início)

### 📅 Atividades

- Cadastro de título, descrição (com limite de caracteres), local e data
- Limite de participantes **ajustável**
- Verificação automática de vagas e data para permitir ou negar inscrição

### 🔐 Área Administrativa

- Listagem de todas as atividades com participantes
- Controle de vagas
- Paginação

---

## 🖥️ Demonstração Visual

> _Inscrição em atividades, listagem paginada, e painel administrativo simples e funcional._

![Screenshot](/screenshot.png)

---

## 📦 Como Rodar o Projeto

### Pré-requisitos

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/) + Docker Compose

### 1. Clone o repositório

```bash
# Clone o projeto
git clone https://github.com/gaidenblk/projeto-voluntariado.git
cd projeto-voluntariado
```

### 2. Configurar variáveis de ambiente

> Crie o arquivo **.env** na pasta api/ <br> com base no **.env_example** já fornecido:

```bash
PORT=3000 # Seta a porta da API
DB_PORT=5454 # Aqui é a porta do Banco
HOST='localhost' # Esse é o Host em que acessaremos a aplicação
DB_HOST='localhost' # Aqui é o mesmo para o Banco
SECRET_KEY='123456789' # Essa é a chave JWT - Crie uma bem segura

# Esses são os dados do Banco de Dados
POSTGRES_USER=usuario
POSTGRES_PASSWORD=senha
POSTGRES_DB=nomedobanco

SENHA_ADMIN='senha123' # Essa senha é necessária para a Criação do admin
## Crie uma senha segura para que o usuario seja criado a fim de poder usar a aplicação
```

> 🔐 A senha do admin será usada para acessar a interface administrativa.

### 3. Suba os containers

```bash
docker compose up -d
```

#### Esse comando irá:

- Subir o frontend em localhost:8080

- Subir a API backend em localhost:3000

> Criar o banco de dados, aplicar as migrations e criar o primeiro user admin

### 4. Acesse no navegador

🌐 Frontend: http://localhost:8080

🔌 Backend (API): http://localhost:3000

> Usuário: **admin** <br>
> Senha: **senha fornecida no arquivo .env**

A partir daqui poderá acessar a plataforma com o user admin, ou criar um user comum através da página de registro!

## 🙋 Sobre o Autor

Feito com 💻, 🎮 e ☕ por Leandro Santos (@gaidenblk)
Pixel artista, dev web e apaixonado por jogos e backend.
