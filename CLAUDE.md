# VIGORA — Plataforma de Gestão Jurídica

SaaS para advogados e pequenos escritórios. Promessa central: **"Nunca mais perca um prazo."**

## Estrutura do Repositório

```
Vigora-Web/
├── backend/        # API Express 5 + PostgreSQL (standalone)
├── frontend/       # React 19 + Vite + Tailwind (standalone)
├── artifacts/      # Código original do Replit (referência, não usar)
└── lib/            # Bibliotecas compartilhadas do Replit (referência)
```

> As pastas `artifacts/` e `lib/` são o código original gerado no Replit. O desenvolvimento continua em `backend/` e `frontend/`.

## Como Executar

### Backend
```bash
cd backend
npm install
cp .env.example .env   # preencha DATABASE_URL e JWT_SECRET
npm run build
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # opcional: VITE_API_URL
npm run dev
```

### Banco de Dados
```bash
cd backend
npm run db:push    # aplica schema no banco
npm run db:studio  # abre Drizzle Studio (GUI)
```

## Stack

| Camada    | Tecnologias                                      |
|-----------|--------------------------------------------------|
| Frontend  | React 19, Vite 7, TypeScript 5.9, Tailwind 4     |
| UI        | shadcn/ui, Radix UI, Lucide, Recharts, Framer    |
| Estado    | React Query 5, Wouter 3 (routing)                |
| Backend   | Express 5, TypeScript, Pino (logs)               |
| Banco     | PostgreSQL, Drizzle ORM, Zod v4                  |
| Auth      | JWT (jsonwebtoken + bcryptjs)                    |

## Autenticação

- Token JWT armazenado em `localStorage` como `vigora_token`
- Enviado como `Authorization: Bearer <token>`
- `JWT_SECRET` via env var (padrão: `vigora-secret-key-2024` — **trocar em produção**)
- Expiração: 7 dias

## Design System VIGORA

- **Gradient primário**: `linear-gradient(135deg, #2A34D4, #6670F0)`
- **Fonte de títulos**: Outfit
- **Fonte do corpo**: DM Sans
- **Modo escuro**: classe `.dark` no `<html>`, persistido em `vigora_theme` localStorage
- **Classes utilitárias**: `glass-panel`, `metric-card`, `nav-item`, `gradient-blue`, `primary-glow`

## Variáveis de Ambiente

### Backend (`backend/.env`)
```
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/vigora
JWT_SECRET=seu-secret-aqui
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```
