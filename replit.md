# VIGORA — Plataforma de Gestão Jurídica

## Overview

VIGORA é uma plataforma SaaS de segurança operacional para advogados e pequenos escritórios de advocacia. A promessa central é "Nunca mais perca um prazo."

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (Tailwind CSS, Shadcn UI, React Query, Wouter routing)
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Build**: esbuild

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── vigora/             # React + Vite frontend (VIGORA SaaS)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `usuarios` — User accounts (id, nome, email, telefone, senha_hash, role, status, equipe_id, ultimo_acesso)
- `equipes` — Teams (id, nome, descricao, cor, criado_em)
- `clientes` — Legal clients (id, nome, cpf_cnpj, telefone, email, observacoes)
- `processos` — Legal cases (id, numero_processo, tribunal, area, status, observacoes, cliente_id, responsavel_id)
- `prazos` — Deadlines (id, processo_id, tipo, descricao, data_limite, responsavel, prioridade, status)
- `tarefas` — Tasks (id, titulo, descricao, processo_id, prazo_id, responsavel, data_limite, status)
- `alertas` — System alerts (id, tipo, mensagem, referencia_id, referencia_tipo, lido)
- `contatos_whatsapp` — WhatsApp contacts
- `processo_contato_whatsapp` — Join table for processes ↔ WhatsApp contacts

### Role enum (usuarios.role)
`owner` | `socio` | `coordenador` | `advogado` | `estagiario` | `financeiro`

### Status enum (usuarios.status)
`ativo` | `inativo`

## Authentication

- JWT-based authentication (token stored in localStorage as 'vigora_token')
- Token sent as `Authorization: Bearer <token>`
- JWT secret: JWT_SECRET env var (defaults to 'vigora-secret-key-2024')
- Set JWT_SECRET in production environment

## API Routes

All routes under `/api`:
- `POST /auth/login` — Login
- `POST /auth/register` — Register
- `GET /auth/me` — Get current user
- `GET/POST /clientes` — List/create clients
- `GET/PUT/DELETE /clientes/:id` — Client detail/update/delete
- `GET/POST /processos` — List/create processes
- `GET/PUT/DELETE /processos/:id` — Process detail/update/delete
- `GET/POST /prazos` — List/create deadlines
- `GET/PUT/DELETE /prazos/:id` — Deadline detail/update/delete
- `GET/POST /tarefas` — List/create tasks
- `GET/PUT/DELETE /tarefas/:id` — Task detail/update/delete
- `GET /alertas` — List alerts
- `PUT /alertas/:id/lido` — Mark alert as read
- `PUT /alertas/marcar-todos-lidos` — Mark all as read
- `GET /dashboard/stats` — Dashboard statistics
- `GET/POST /equipe/membros` — Team members CRUD
- `GET/POST /equipe/times` — Teams CRUD
- `GET/PUT/DELETE /equipe/membros/:id` — Member detail/update/delete
- `GET/PUT/DELETE /equipe/times/:id` — Team detail/update/delete

## Frontend Pages

- `/login` — Login page
- `/cadastro` — Register page
- `/onboarding` — 3-step onboarding flow (OAB verification, escritório details, done). Redirected to after first login if `vigora_onboarding_done` not in localStorage
- `/` (dashboard) — Main dashboard with stats, alerts, upcoming deadlines, Compromissos section
- `/processos` — Process list with search/filters/favorites. "Novo Processo" modal has full fields: CNJ number, nome interno, área, status, cliente (linked), parte contrária, tribunal, comarca, vara, fase processual, tipo de ação, responsável, data distribuição, valor da causa, observações
- `/processos/:id` — Process detail with tabs (Visão Geral, Prazos, Tarefas, Cliente)
- `/prazos` — Deadlines with grouping (Vencidos, Hoje, Próximos 3 dias, Próximos 7 dias). "Adicionar Prazo" modal with full fields. "Somente favoritos" toggle
- `/clientes` — Client list with clickable rows → ClienteDetalheDrawer. "Adicionar Cliente" modal with PF/PJ tabs (CPF/CNPJ, RG, address, contact fields)
- `/clientes/:id` — Client detail (redirects to list for now)
- `/tarefas` — Kanban task board. Cards show multi-avatar (up to 3 assignees). Cards are clickable → TarefaDetalheModal with full details
- `/alertas` — Alert center
- `/agenda` — Agenda page
- `/contatos` — Contacts page
- `/intimacoes` — Intimações page
- `/financeiro` — Financeiro page
- `/parceiros` — Parceiros page
- `/modelos` — Modelos de documentos page
- `/relatorios` — Reports with responsável/área filters + smart report cards (task KPIs, prazos por período, processos por status)
- `/equipe` — Team & Permissions (Membros, Times, Permissões tabs)
- `/configuracoes` — Full settings: Aparência, Perfil, Menu Lateral (personalizar_menu), Notificações, Segurança, Usuários, Termos, Financeiro, Tarefas Padrão, Workflow, Grupo/Ação/Tipos, Metas, Origem Pessoas, Parceiros, Integrações
- `/perfil` — User profile (maps to Configuracoes)

## Global Features

- **Dark/Light mode toggle** — Sun/Moon button in header, uses `useTheme()` hook, persists in `vigora_theme` localStorage key
- **AI Assistant (VIGI)** — Floating chat button (bottom-right), globally available via `<AiAssistant />` in AppLayout. Mock legal Q&A with quick-prompt chips
- **Favorites system** — `useFavorites(entityType)` hook backed by localStorage. Star button on ProcessosList table rows and TarefasList kanban cards. "Favoritos" filter button on ProcessosList
- **Menu personalization** — Configurações → "Menu Lateral" section. Toggles sidebar visibility per item. Hidden hrefs stored in `vigora_nav_hidden` localStorage key (JSON array). AppLayout reads and filters dynamically, listens to `vigora_nav_changed` custom event + storage event. Dashboard ("/") is always visible.
- **Onboarding flow** — `/onboarding` route. 3 steps: OAB verification (mock CNJ search), Escritório details, Done. ProtectedRoute redirects here if `vigora_onboarding_done` not in localStorage. Set after user completes step 3.

## VIGORA Design System

- **Primary gradient**: `linear-gradient(135deg, #2A34D4, #6670F0)` — use inline style for exact hex
- **Primary CSS token (light)**: `237 67% 50%` (≈ #2A34D4)
- **Primary CSS token (dark)**: `235 81% 67%` (≈ #6670F0)
- **Dark background**: Dark Blue RGB(14,14,71)
- **Light background**: Cold Off-White RGB(240,244,247)
- **Support text**: Dark Grey RGB(55,55,56)
- **Headings font**: Outfit
- **Body font**: DM Sans

### CSS Architecture (index.css)
- Tailwind v4 with CSS custom properties for all colors (HSL)
- Custom utility classes in `@layer utilities`: `glass-panel`, `metric-card`, `nav-item`, `nav-item-active`, `nav-section-label`, `table-row-hover`, `gradient-blue`, `gradient-success`, `gradient-warning`, `gradient-destructive`, `primary-glow`, `glow-success/warning/destructive`
- Dark mode via `.dark` class on `<html>` (stored in localStorage as `vigora_theme`)
- Sidebar uses CSS vars: `--sidebar-bg`, `--sidebar-border`, `--sidebar-hover`, `--sidebar-active`, `--sidebar-active-text`
- Custom utilities are defined with `@utility name { ... }` (Tailwind v4 pattern — NOT `@layer utilities { .name {} }`)
- `@utility` makes classes available for `@apply` and as HTML class names
- Hover/dark-mode variants that cannot live inside `@utility` (nested selectors) go in plain CSS after the `@utility` blocks

### Mock Data Fallback Pattern
All list pages use: `const data = (apiData && apiData.length > 0) ? apiData : MOCK_*` from `@/lib/mock-data.ts`
This ensures the UI always has data to display even before seeding the database.

## Running the App

- Frontend dev: `pnpm --filter @workspace/vigora run dev`
- API server dev: `pnpm --filter @workspace/api-server run dev`
- DB push: `pnpm --filter @workspace/db run push`
- Codegen: `pnpm --filter @workspace/api-spec run codegen`
