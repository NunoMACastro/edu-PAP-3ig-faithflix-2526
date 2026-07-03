# Arranque local da MF9

Este ficheiro explica como arrancar o FaithFlix localmente antes de trabalhar nos BKs da `MF9`.

A `MF9` depende de backend e frontend em simultâneo: planos Pro/Família, qualidade por plano, partilha familiar, privacidade operacional e validação final precisam da API ligada e da interface web a comunicar com ela.

## Pré-requisitos

Antes de começar, confirma:

- Node.js `20` ou superior instalado.
- npm disponível no terminal.
- MongoDB disponível localmente ou uma ligação MongoDB Atlas configurada.
- Repositório aberto na raiz do projeto FaithFlix.

Para confirmar a versão do Node.js:

```bash
node --version
```

Se a versão for inferior a `20`, atualiza o Node.js antes de continuar.

## 1. Preparar variáveis de ambiente

O backend e o frontend têm ficheiros de exemplo. Cria os ficheiros locais apenas se ainda não existirem.

Em macOS, Linux ou Git Bash:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Em Windows PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Não publiques credenciais reais no repositório, em screenshots ou em relatórios. O ficheiro `backend/.env` pode conter dados sensíveis, como a ligação à base de dados.

Valores locais esperados:

- `backend/.env`
  - `PORT=3000`
  - `FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`
  - `MONGODB_URI=mongodb://127.0.0.1:27017` ou a ligação Atlas fornecida pelo professor.
  - `MONGODB_DB_NAME=faithflix`
- `frontend/.env`
  - `VITE_API_BASE_URL=http://localhost:3000`

Se alterares a porta do backend, atualiza também `VITE_API_BASE_URL` no frontend.

## 2. Instalar dependências

Executa estes comandos a partir da raiz do projeto:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Este passo instala as dependências da API Express e da app React/Vite.

## 3. Arrancar o backend

Abre um terminal na raiz do projeto e executa:

```bash
npm --prefix backend run dev
```

O backend deve ficar disponível em:

```text
http://localhost:3000
```

Para confirmar que a API arrancou, abre no browser:

```text
http://localhost:3000/health
```

Se aparecer uma resposta JSON, o backend está a responder.

## 4. Arrancar o frontend

Mantém o terminal do backend aberto. Abre um segundo terminal na raiz do projeto e executa:

```bash
npm --prefix frontend run dev
```

O frontend deve ficar disponível em:

```text
http://localhost:5173
```

Abre esse endereço no browser e confirma que a aplicação carrega.

Se o Vite escolher outra porta, por exemplo `5174`, a comunicação com o backend pode falhar por CORS. Neste projeto, o caminho mais simples é libertar a porta `5173` e voltar a arrancar o frontend.

## 5. Validação rápida antes de começar um BK

Antes de iniciar qualquer BK da `MF9`, confirma:

- O backend está ligado no terminal.
- O frontend está ligado noutro terminal.
- `http://localhost:3000/health` responde.
- `http://localhost:5173` abre a app.
- O ficheiro `frontend/.env` aponta para `http://localhost:3000`.
- O ficheiro `backend/.env` autoriza `http://localhost:5173` em `FRONTEND_ORIGIN`.
- A base de dados configurada em `MONGODB_URI` está acessível.

## 6. Validações úteis durante a MF9

Para validar o backend:

```bash
npm --prefix backend test
```

Para validar o frontend:

```bash
npm --prefix frontend run build
```

Estes comandos não substituem os testes manuais pedidos em cada BK, mas ajudam a detetar erros de código antes da validação final.

## 7. Problemas comuns

### Porta ocupada

Se o backend não arrancar porque a porta `3000` está ocupada, fecha o processo antigo ou muda a porta no `backend/.env`.

Se mudares para `PORT=3001`, atualiza também:

```text
VITE_API_BASE_URL=http://localhost:3001
```

### Frontend não comunica com backend

Confirma:

- backend ligado;
- `frontend/.env` com `VITE_API_BASE_URL=http://localhost:3000`;
- `backend/.env` com `FRONTEND_ORIGIN=http://localhost:5173,http://127.0.0.1:5173`;
- frontend aberto em `http://localhost:5173`.

Depois de alterar ficheiros `.env`, para e volta a arrancar o servidor afetado.

### Erro de MongoDB

Confirma:

- MongoDB local ligado, se usares `mongodb://127.0.0.1:27017`;
- ligação Atlas correta, se usares MongoDB Atlas;
- nome da base de dados em `MONGODB_DB_NAME=faithflix`;
- rede disponível, se a base de dados estiver na cloud.

### Alterações não aparecem no browser

Confirma que editaste ficheiros dentro de `frontend/` ou `backend/` e que o servidor correspondente está ligado. Se necessário, reinicia o servidor afetado.

## Checklist final de arranque

- [ ] Node.js `20+` confirmado.
- [ ] `backend/.env` criado e revisto.
- [ ] `frontend/.env` criado e revisto.
- [ ] Dependências instaladas no backend.
- [ ] Dependências instaladas no frontend.
- [ ] Backend ligado com `npm --prefix backend run dev`.
- [ ] Frontend ligado com `npm --prefix frontend run dev`.
- [ ] Health-check aberto em `http://localhost:3000/health`.
- [ ] App aberta em `http://localhost:5173`.
- [ ] Pronto para começar o BK da `MF9`.
