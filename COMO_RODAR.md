# 🚌 AltaBus – Como rodar localmente no Windows 11

## Pré-requisitos

- Node.js 20+ instalado
- PostgreSQL 16 instalado e rodando
- Git (opcional)

---

## Passo 1 – Clonar / copiar o projeto

```
git clone https://github.com/tonico-jacs/altabus
cd altabus
```

Ou extraia o ZIP nesta pasta.

---

## Passo 2 – Instalar dependências

```bash
npm install
```

---

## Passo 3 – Criar o banco de dados no PostgreSQL

Abra o **pgAdmin** ou o **psql** e execute:

```sql
CREATE DATABASE altabus_dev;
```

---

## Passo 4 – Configurar o arquivo .env

Copie `.env.example` para `.env`:

```bash
copy .env.example .env
```

Edite o `.env` e ajuste:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/altabus_dev"
SESSION_SECRET="qualquer-string-longa-e-secreta"
TRACCAR_URL="https://demo4.traccar.org"
TRACCAR_DEVICE_ID="13519"
TRACCAR_TOKEN="SEU_TOKEN_TRACCAR"
NODE_ENV="development"
PORT=3000
```

---

## Passo 5 – Gerar o Prisma Client

```bash
npx prisma generate
```

---

## Passo 6 – Criar as tabelas (migration)

```bash
npx prisma migrate dev --name init
```

Isso criará todas as tabelas no PostgreSQL automaticamente.

---

## Passo 7 – Popular dados iniciais (seed)

```bash
npm run db:seed
```

Usuários criados pelo seed:

| E-mail                  | Senha  | Tipo      |
|-------------------------|--------|-----------|
| motorista@altabus.com   | 123456 | motorista |
| cliente@altabus.com     | 123456 | cliente   |
| cliente1@altabus.com    | 123456 | cliente   |
| passonicarol@gmail.com  | 123456 | cliente   |

---

## Passo 8 – Rodar o servidor

```bash
npm start
```

Ou com recarga automática:

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## Passo 9 – Visualizar o banco (opcional)

```bash
npm run db:studio
```

Abre o Prisma Studio no navegador para ver e editar os dados.

---

## Estrutura de arquivos

```
altabus/
├── public/                 ← HTML, CSS, JS do front-end
│   ├── index.html          ← Página inicial (requer login)
│   ├── login.html          ← Login
│   ├── cadastro.html       ← Cadastro
│   ├── pontos.html         ← Seleção de ponto (requer login)
│   ├── cliente.html        ← Mapa + rastreio (requer login)
│   ├── auth-guard.js       ← Guard de autenticação (incluso em páginas protegidas)
│   ├── style.css
│   └── stylelogin.css
├── prisma/
│   ├── schema.prisma       ← Modelo do banco de dados
│   └── seed.js             ← Dados iniciais
├── servidor.js             ← Backend Express + Prisma + Sessão
├── package.json
├── .env                    ← NÃO commitar (está no .gitignore)
├── .env.example            ← Template público
└── COMO_RODAR.md           ← Este arquivo
```

---

## Como funciona a autenticação

1. O usuário acessa `login.html` e envia e-mail + senha.
2. O servidor valida com `bcrypt.compare()` contra o hash salvo no PostgreSQL.
3. Uma sessão é criada e salva na tabela `session` do PostgreSQL (via `connect-pg-simple`).
4. O cookie de sessão é enviado ao navegador.
5. Todas as páginas protegidas (`index.html`, `pontos.html`, `cliente.html`) carregam `auth-guard.js`, que consulta `/sessao`. Se não houver sessão, redireciona para `login.html`.
6. O logout destrói a sessão no banco e limpa o cookie.

---

## Tabelas criadas pelo Prisma

| Tabela          | Conteúdo                             |
|-----------------|--------------------------------------|
| `usuarios`      | Usuários cadastrados                 |
| `pontos`        | Pontos de embarque                   |
| `veiculos`      | Ônibus e ID do dispositivo Traccar   |
| `loc_historico` | Histórico de posições do ônibus      |
| `session`       | Sessões de login (criada pelo middleware) |

