# Frontend — VIGORA

React 19 + Vite 7 + TypeScript 5.9 + Tailwind 4 + shadcn/ui.

## Estrutura

```
frontend/src/
├── App.tsx               # Configuração de rotas (Wouter)
├── main.tsx              # Entry point React
├── index.css             # Tailwind + variáveis CSS + utilitários VIGORA
├── pages/                # Páginas da aplicação (uma pasta por rota)
│   ├── auth/             # Login.tsx, Cadastro.tsx
│   ├── dashboard/        # Dashboard.tsx
│   ├── processos/        # ProcessosList.tsx, ProcessoDetail.tsx
│   ├── prazos/           # PrazosList.tsx
│   ├── clientes/         # ClientesList.tsx
│   ├── tarefas/          # TarefasList.tsx
│   ├── alertas/          # AlertasList.tsx
│   ├── equipe/           # EquipePage.tsx
│   ├── configuracoes/    # Configuracoes.tsx
│   ├── onboarding/       # OnboardingPage.tsx
│   └── ...               # agenda, contatos, financeiro, etc.
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx # Layout principal com sidebar + header
│   ├── AiAssistant.tsx   # Chat VIGI (assistente IA flutuante)
│   └── ui/               # Componentes shadcn/ui (60+)
├── hooks/
│   ├── use-mobile.tsx    # Detecta viewport mobile
│   └── use-toast.ts      # Hook de toast notifications
├── services/
│   └── api.ts            # Instância Axios com interceptors JWT
├── types/
│   └── index.ts          # TypeScript types/interfaces da aplicação
└── lib/
    ├── auth.tsx           # AuthContext + useAuth hook
    ├── theme.tsx          # ThemeContext + useTheme hook (dark/light)
    ├── fetch-interceptor.ts # Intercepta fetch nativo para auth
    ├── favorites.ts       # useFavorites hook (localStorage)
    ├── mock-data.ts       # Dados mock para fallback
    ├── utils.ts           # cn() — merge de classes Tailwind
    └── api-client/        # Hooks React Query gerados (Orval)
        ├── index.ts       # Exporta tudo
        ├── custom-fetch.ts # Fetch customizado com auth
        └── generated/
            ├── api.ts     # Hooks useQuery/useMutation por endpoint
            └── api.schemas.ts # Schemas Zod
```

## Comandos

```bash
npm run dev        # Inicia servidor de desenvolvimento na porta 5173
npm run build      # Typecheck + build para dist/
npm run preview    # Preview do build de produção
npm run typecheck  # Verifica tipos TypeScript
```

## Rotas da Aplicação

| Rota                  | Componente          | Acesso     |
|-----------------------|---------------------|------------|
| /login                | Login               | Público    |
| /cadastro             | Cadastro            | Público    |
| /onboarding           | OnboardingPage      | Público    |
| /                     | Dashboard           | Protegido  |
| /processos            | ProcessosList       | Protegido  |
| /processos/:id        | ProcessoDetail      | Protegido  |
| /prazos               | PrazosList          | Protegido  |
| /clientes             | ClientesList        | Protegido  |
| /tarefas              | TarefasList         | Protegido  |
| /alertas              | AlertasList         | Protegido  |
| /equipe               | EquipePage          | Protegido  |
| /contatos-whatsapp    | ContatosWhatsapp    | Protegido  |
| /configuracoes        | Configuracoes       | Protegido  |
| /agenda               | AgendaPage          | Protegido  |
| /contatos             | ContatosPage        | Protegido  |
| /financeiro           | FinanceiroPage      | Protegido  |
| /relatorios           | RelatoriosPage      | Protegido  |

Rotas protegidas ficam em `ProtectedRoute` em `App.tsx`. Se não há usuário, redireciona para `/login`. Se o onboarding não foi completado (`vigora_onboarding_done` no localStorage), redireciona para `/onboarding`.

## Autenticação

- `AuthContext` em `src/lib/auth.tsx` — provider global com `user`, `login`, `logout`, `isLoading`
- Token armazenado em `localStorage` como `vigora_token`
- `src/lib/fetch-interceptor.ts` — intercepta o `fetch` global para injetar o token
- `src/services/api.ts` — instância Axios com interceptors (para novas features)
- Evento `auth:unauthorized` dispara logout automático em 401

## Buscando Dados

O projeto usa **dois mecanismos** de busca:

### 1. Hooks gerados (legado Replit)
Localizados em `src/lib/api-client/generated/api.ts`. Exemplos:
```tsx
import { useGetDashboardStats, useGetProcessos } from "@/lib/api-client";

const { data, isLoading } = useGetDashboardStats();
```

### 2. Axios via services (padrão novo)
Usar para novas features:
```tsx
// src/services/processoService.ts
import api from "./api";
import { Processo } from "@/types";

export const getProcessos = () => api.get<Processo[]>("/api/processos");
export const createProcesso = (data: Partial<Processo>) => api.post<Processo>("/api/processos", data);

// No hook:
const { data } = useQuery({ queryKey: ["processos"], queryFn: getProcessos });
```

## Design System

### Cores (CSS Custom Properties)
```css
--primary: 237 67% 50%     /* #2A34D4 */
--background, --foreground, --muted, --border, --card
--success, --warning, --destructive
```

### Classes Utilitárias Customizadas
- `glass-panel` — card com backdrop-blur e borda sutil
- `metric-card` — card de métrica com padding e sombra
- `nav-item` / `nav-item-active` — itens de navegação da sidebar
- `gradient-blue` — gradiente primário VIGORA
- `primary-glow` — sombra/brilho na cor primária

### Dark Mode
Controlado pela classe `.dark` no `<html>`. Use `useTheme()` de `src/lib/theme.tsx`.
```tsx
const { theme, setTheme } = useTheme(); // "light" | "dark" | "system"
```

## Funcionalidades Globais

- **AI Assistant (VIGI)** — `<AiAssistant />` em AppLayout, chat flutuante no canto inferior direito
- **Favoritos** — `useFavorites("processos")` → favorita/desfavorita itens via localStorage
- **Personalização do menu** — Configurações → Menu Lateral. Oculta itens via `vigora_nav_hidden` localStorage
- **Onboarding** — 3 passos na primeira vez: verificação OAB, dados do escritório, conclusão

## Adicionando uma Nova Página

1. Crie `src/pages/nova-feature/NovaFeaturePage.tsx`
2. Crie o hook em `src/hooks/useNovaFeature.ts`
3. Se precisar chamar a API, crie `src/services/novaFeatureService.ts`
4. Adicione a rota em `src/App.tsx`
5. Adicione o item no menu em `src/components/layout/AppLayout.tsx`

## Convenções

- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCaseService.ts`
- Tipos: interfaces em `src/types/index.ts`
- `cn()` de `@/lib/utils` para merge de classes Tailwind (substituto de `clsx` + `tailwind-merge`)
