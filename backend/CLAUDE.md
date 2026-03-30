# Backend — VIGORA API

Express 5 + TypeScript + PostgreSQL via Drizzle ORM.

## Estrutura

```
backend/
├── src/
│   ├── index.ts          # Entry point — lê PORT e inicia o servidor
│   ├── app.ts            # Express app — CORS, JSON, pinoHttp, router
│   ├── lib/
│   │   └── logger.ts     # Instância Pino
│   ├── middlewares/
│   │   └── auth.ts       # authMiddleware (JWT) + generateToken
│   ├── routes/
│   │   ├── index.ts      # Monta todos os routers em /api
│   │   ├── auth.ts       # POST /auth/login, /register  GET /auth/me
│   │   ├── clientes.ts   # CRUD /clientes
│   │   ├── processos.ts  # CRUD /processos
│   │   ├── prazos.ts     # CRUD /prazos
│   │   ├── tarefas.ts    # CRUD /tarefas
│   │   ├── alertas.ts    # GET /alertas, PUT marcar lido
│   │   ├── dashboard.ts  # GET /dashboard/stats
│   │   ├── equipe.ts     # CRUD /equipe/membros + /equipe/times
│   │   ├── contatos-whatsapp.ts
│   │   ├── notificacoes-processos.ts
│   │   └── health.ts     # GET /healthz
│   └── db/
│       ├── index.ts      # Conexão Drizzle (pool pg)
│       └── schema/       # Tabelas Drizzle
│           ├── usuarios.ts
│           ├── equipes.ts
│           ├── clientes.ts
│           ├── processos.ts
│           ├── prazos.ts
│           ├── tarefas.ts
│           ├── alertas.ts
│           ├── contatos_whatsapp.ts
│           └── processo_contato_whatsapp.ts
├── build.mjs             # Build com esbuild → dist/index.mjs
├── drizzle.config.ts     # Config do Drizzle Kit
├── package.json
├── tsconfig.json
└── .env.example
```

## Comandos

```bash
npm run dev        # build + watch (requer .env)
npm run build      # compila para dist/
npm run start      # roda dist/index.mjs
npm run db:push    # aplica schema no banco (sem migrations)
npm run db:studio  # abre Drizzle Studio na porta 4983
npm run db:generate # gera arquivos de migration
npm run typecheck  # verifica tipos TypeScript
```

## Rotas da API

Todas as rotas ficam sob `/api`. Rotas protegidas exigem `Authorization: Bearer <token>`.

| Método | Rota                              | Auth | Descrição                       |
|--------|-----------------------------------|------|---------------------------------|
| GET    | /healthz                          | Não  | Health check                    |
| POST   | /api/auth/login                   | Não  | Login → retorna token + user    |
| POST   | /api/auth/register                | Não  | Cadastro → retorna token + user |
| GET    | /api/auth/me                      | Sim  | Dados do usuário logado         |
| GET    | /api/clientes                     | Sim  | Lista clientes                  |
| POST   | /api/clientes                     | Sim  | Cria cliente                    |
| GET    | /api/clientes/:id                 | Sim  | Detalhe cliente                 |
| PUT    | /api/clientes/:id                 | Sim  | Atualiza cliente                |
| DELETE | /api/clientes/:id                 | Sim  | Remove cliente                  |
| GET    | /api/processos                    | Sim  | Lista processos                 |
| POST   | /api/processos                    | Sim  | Cria processo                   |
| GET    | /api/processos/:id                | Sim  | Detalhe processo                |
| PUT    | /api/processos/:id                | Sim  | Atualiza processo               |
| DELETE | /api/processos/:id                | Sim  | Remove processo                 |
| GET    | /api/prazos                       | Sim  | Lista prazos                    |
| POST   | /api/prazos                       | Sim  | Cria prazo                      |
| GET    | /api/prazos/:id                   | Sim  | Detalhe prazo                   |
| PUT    | /api/prazos/:id                   | Sim  | Atualiza prazo                  |
| DELETE | /api/prazos/:id                   | Sim  | Remove prazo                    |
| GET    | /api/tarefas                      | Sim  | Lista tarefas                   |
| POST   | /api/tarefas                      | Sim  | Cria tarefa                     |
| PUT    | /api/tarefas/:id                  | Sim  | Atualiza tarefa                 |
| DELETE | /api/tarefas/:id                  | Sim  | Remove tarefa                   |
| GET    | /api/alertas                      | Sim  | Lista alertas                   |
| PUT    | /api/alertas/:id/lido             | Sim  | Marca alerta como lido          |
| PUT    | /api/alertas/marcar-todos-lidos   | Sim  | Marca todos alertas como lidos  |
| GET    | /api/dashboard/stats              | Sim  | Estatísticas do dashboard       |
| GET    | /api/equipe/membros               | Sim  | Lista membros da equipe         |
| POST   | /api/equipe/membros               | Sim  | Adiciona membro                 |
| GET    | /api/equipe/times                 | Sim  | Lista times                     |
| POST   | /api/equipe/times                 | Sim  | Cria time                       |

## Schema do Banco

Todas as tabelas têm `usuario_id` (isolamento multi-tenant por usuário).

- **usuarios** — Contas de usuário com `role` (owner/socio/coordenador/advogado/estagiario/financeiro)
- **equipes** — Times dentro do escritório
- **clientes** — Clientes do escritório (PF ou PJ)
- **processos** — Processos judiciais vinculados a clientes
- **prazos** — Prazos processuais com prioridade e status
- **tarefas** — Tarefas com status kanban
- **alertas** — Notificações automáticas do sistema
- **contatos_whatsapp** — Contatos para disparo via WhatsApp
- **processo_contato_whatsapp** — Vínculo N:N processo ↔ contato

## Build

O build usa `esbuild` via `build.mjs`. O output é um único arquivo `dist/index.mjs` (ESM).
O `esbuild-plugin-pino` é necessário para o Pino funcionar corretamente com workers após bundle.

## Adicionando uma Nova Rota

1. Crie `src/routes/novo-recurso.ts` com um `Router` Express
2. Registre em `src/routes/index.ts`: `router.use("/novo-recurso", novoRecursoRouter)`
3. Se precisar de nova tabela, crie em `src/db/schema/novo-recurso.ts` e exporte em `src/db/schema/index.ts`
4. Execute `npm run db:push` para aplicar no banco
