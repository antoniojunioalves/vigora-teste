import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTheme, Theme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import {
  Sun, Moon, Monitor, User, Bell, Shield, Palette, Check,
  Users, FileText, DollarSign, CheckSquare, GitBranch,
  Layers, BarChart2, Link2, UserPlus, Handshake, Zap,
  Plus, Edit2, Trash2, X, Search, CreditCard, Briefcase,
  Tag, Building, Globe, Settings, ChevronRight, AlertCircle
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionId =
  | "aparencia" | "perfil" | "notificacoes" | "seguranca"
  | "usuarios" | "termos" | "financeiro" | "tarefas_padrao"
  | "workflow" | "grupo_acao" | "tipos_acao" | "metas"
  | "origem_pessoas" | "parceiros" | "integracoes"
  | "personalizar_menu";

interface NavGroup {
  label: string;
  items: { id: SectionId; label: string; icon: React.ElementType }[];
}

// ─── Navigation groups ───────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Geral",
    items: [
      { id: "aparencia", label: "Aparência", icon: Palette },
      { id: "perfil", label: "Perfil", icon: User },
      { id: "personalizar_menu", label: "Menu Lateral", icon: Layers },
    ],
  },
  {
    label: "Gestão",
    items: [
      { id: "usuarios", label: "Usuários", icon: Users },
      { id: "termos", label: "Termos Monitorados", icon: FileText },
      { id: "metas", label: "Metas", icon: BarChart2 },
    ],
  },
  {
    label: "Processos",
    items: [
      { id: "tarefas_padrao", label: "Tarefas Padrão", icon: CheckSquare },
      { id: "workflow", label: "Workflow", icon: GitBranch },
      { id: "grupo_acao", label: "Grupos de Ação", icon: Layers },
      { id: "tipos_acao", label: "Tipos de Ação", icon: Tag },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { id: "financeiro", label: "Financeiro", icon: DollarSign },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      { id: "origem_pessoas", label: "Origem de Pessoas", icon: UserPlus },
      { id: "parceiros", label: "Parceiros", icon: Handshake },
    ],
  },
  {
    label: "Sistema",
    items: [
      { id: "integracoes", label: "Integrações & API", icon: Zap },
      { id: "notificacoes", label: "Notificações", icon: Bell },
      { id: "seguranca", label: "Segurança", icon: Shield },
    ],
  },
];

// ─── Theme options ─────────────────────────────────────────────────────────

const THEME_OPTIONS: { value: Theme; label: string; icon: React.ReactNode; description: string }[] = [
  { value: "light", label: "Claro", icon: <Sun className="w-5 h-5" />, description: "Visual limpo e sofisticado com fundo off-white" },
  { value: "dark", label: "Escuro", icon: <Moon className="w-5 h-5" />, description: "Interface premium em tom institucional escuro" },
  { value: "system", label: "Automático", icon: <Monitor className="w-5 h-5" />, description: "Segue a preferência do seu sistema operacional" },
];

// ─── Shared helpers ──────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-border">
      <h2 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" /> {title}
      </h2>
      <p className="text-muted-foreground text-sm mt-1">{description}</p>
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type = "text", className = "" }: { label?: string; placeholder?: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-foreground placeholder:text-muted-foreground/50"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, className = "" }: { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", className = "" }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger"; size?: "sm" | "md"; className?: string }) {
  const base = "inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "text-white hover:opacity-90",
    ghost: "bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-muted/80",
    danger: "bg-destructive/15 text-destructive hover:bg-destructive/25",
  };
  return (
    <button
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={variant === "primary" ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
    >
      {children}
    </button>
  );
}

function EmptyState({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <div>
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-muted-foreground text-xs mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function Configuracoes() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("aparencia");

  const renderSection = () => {
    switch (activeSection) {
      case "aparencia": return <AppearanceSection theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />;
      case "perfil": return <PerfilSection user={user} />;
      case "usuarios": return <UsuariosSection />;
      case "termos": return <TermosSection />;
      case "financeiro": return <FinanceiroSection />;
      case "tarefas_padrao": return <TarefasPadraoSection />;
      case "workflow": return <WorkflowSection />;
      case "grupo_acao": return <GrupoAcaoSection />;
      case "tipos_acao": return <TiposAcaoSection />;
      case "metas": return <MetasSection />;
      case "origem_pessoas": return <OrigemPessoasSection />;
      case "parceiros": return <ParceirosSection />;
      case "integracoes": return <IntegracoesSection />;
      case "notificacoes": return <NotificacoesSection />;
      case "seguranca": return <SegurancaSection />;
      case "personalizar_menu": return <PersonalizarMenuSection />;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
              <Settings className="w-4 h-4 text-white" />
            </div>
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1 ml-11">Gerencie as preferências e parâmetros do seu escritório</p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <nav className="w-56 flex-shrink-0 sticky top-6">
            <div className="glass-panel rounded-2xl p-2 space-y-4">
              {NAV_GROUPS.map(group => (
                <div key={group.label}>
                  <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setActiveSection(id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left ${
                          activeSection === id
                            ? "text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        style={activeSection === id ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="glass-panel rounded-2xl p-6">
              {renderSection()}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ─── 1. Aparência ─────────────────────────────────────────────────────────────

function AppearanceSection({ theme, setTheme, resolvedTheme }: { theme: Theme; setTheme: (t: Theme) => void; resolvedTheme: "light" | "dark" }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={Palette} title="Aparência" description="Escolha como o VIGORA deve ser exibido no seu dispositivo." />
      <div>
        <p className="text-sm font-semibold text-foreground mb-4">Tema da interface</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon, description }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-center transition-all ${
                  isActive ? "border-primary bg-primary/10 text-foreground" : "border-border bg-card hover:border-primary/40 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </span>
                )}
                <div className={`p-3 rounded-xl ${isActive ? "bg-primary/20 text-primary" : "bg-muted"}`}>{icon}</div>
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs mt-0.5 leading-snug opacity-70">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/60 border border-border">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${resolvedTheme === "dark" ? "bg-primary" : "bg-warning"}`} />
        <p className="text-sm text-muted-foreground">
          Modo ativo: <span className="font-semibold text-foreground">{resolvedTheme === "dark" ? "Escuro" : "Claro"}</span>
          {theme === "system" && " (detectado automaticamente)"}
        </p>
      </div>
    </div>
  );
}

// ─── 2. Perfil ────────────────────────────────────────────────────────────────

function PerfilSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={User} title="Perfil" description="Suas informações pessoais e profissionais." />
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-2xl">
          {user?.nome?.charAt(0)?.toUpperCase() ?? "U"}
        </div>
        <div>
          <p className="font-semibold text-foreground text-lg">{user?.nome ?? "—"}</p>
          <p className="text-muted-foreground text-sm">{user?.email ?? "—"}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Nome completo", value: user?.nome ?? "—" },
          { label: "Email", value: user?.email ?? "—" },
          { label: "Telefone", value: user?.telefone ?? "Não informado" },
          { label: "Membro desde", value: user?.criadoEm ? new Date(user.criadoEm).toLocaleDateString("pt-BR", { year: "numeric", month: "long" }) : "—" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</p>
            <p className="text-sm font-medium text-foreground bg-muted/60 rounded-xl px-3 py-2.5 border border-border">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 3. Usuários ──────────────────────────────────────────────────────────────

const INIT_COLABORADORES = [
  { id: 1, nome: "Dr. Carlos Mendes", email: "carlos@vigora.com.br", perfil: "adm", cargo: "Sócio Senior", acessoFinanceiro: true, status: "ativo" },
  { id: 2, nome: "Dra. Ana Rodrigues", email: "ana@vigora.com.br", perfil: "colaborador", cargo: "Advogada Plena", acessoFinanceiro: false, status: "ativo" },
  { id: 3, nome: "Pedro Alves", email: "pedro@vigora.com.br", perfil: "colaborador", cargo: "Estagiário", acessoFinanceiro: false, status: "ativo" },
  { id: 4, nome: "Dra. Juliana Costa", email: "juliana@vigora.com.br", perfil: "colaborador", cargo: "Advogada Júnior", acessoFinanceiro: false, status: "inativo" },
];
const INIT_TIMES = [
  { id: 1, nome: "Time Tributário", membros: ["Dr. Carlos Mendes", "Dra. Ana Rodrigues"] },
  { id: 2, nome: "Time Trabalhista", membros: ["Dra. Juliana Costa", "Pedro Alves"] },
];

function UsuariosSection() {
  const [tab, setTab] = useState<"colaboradores" | "times">("colaboradores");
  const [colaboradores, setColaboradores] = useState(INIT_COLABORADORES);
  const [times, setTimes] = useState(INIT_TIMES);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPerfil, setFilterPerfil] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showTimeForm, setShowTimeForm] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", perfil: "colaborador", cargo: "", acessoFinanceiro: false, status: "ativo" });
  const [timeForm, setTimeForm] = useState({ nome: "", membros: "" });

  const filtered = colaboradores.filter(c => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterPerfil && c.perfil !== filterPerfil) return false;
    if (search && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addColaborador = () => {
    if (!form.nome || !form.email) return;
    setColaboradores(p => [...p, { ...form, id: Date.now() }]);
    setForm({ nome: "", email: "", perfil: "colaborador", cargo: "", acessoFinanceiro: false, status: "ativo" });
    setShowForm(false);
  };
  const removeColaborador = (id: number) => setColaboradores(p => p.filter(c => c.id !== id));
  const addTime = () => {
    if (!timeForm.nome) return;
    setTimes(p => [...p, { id: Date.now(), nome: timeForm.nome, membros: timeForm.membros ? timeForm.membros.split(",").map(s => s.trim()) : [] }]);
    setTimeForm({ nome: "", membros: "" });
    setShowTimeForm(false);
  };
  const removeTime = (id: number) => setTimes(p => p.filter(t => t.id !== id));

  return (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="Usuários" description="Gerencie colaboradores e times do escritório." />
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
        {(["colaboradores", "times"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "colaboradores" ? "Colaboradores" : "Times"}
          </button>
        ))}
      </div>

      {tab === "colaboradores" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar colaborador..." className="w-full bg-muted border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary text-foreground" />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
              <option value="">Status (Todos)</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <select value={filterPerfil} onChange={e => setFilterPerfil(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
              <option value="">Perfil (Todos)</option>
              <option value="adm">Administrador</option>
              <option value="colaborador">Colaborador</option>
            </select>
            <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo colaborador</Btn>
          </div>

          {showForm && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-foreground">Novo Colaborador</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome *" placeholder="Nome completo" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} />
                <Input label="Email *" placeholder="email@escritorio.com" type="email" value={form.email} onChange={v => setForm(p => ({ ...p, email: v }))} />
                <Select label="Perfil" value={form.perfil} onChange={v => setForm(p => ({ ...p, perfil: v }))} options={[{ value: "adm", label: "Administrador" }, { value: "colaborador", label: "Colaborador" }]} />
                <Input label="Cargo" placeholder="Ex: Advogado Pleno" value={form.cargo} onChange={v => setForm(p => ({ ...p, cargo: v }))} />
                <Select label="Acesso Financeiro" value={form.acessoFinanceiro ? "sim" : "nao"} onChange={v => setForm(p => ({ ...p, acessoFinanceiro: v === "sim" }))} options={[{ value: "nao", label: "Não" }, { value: "sim", label: "Sim" }]} />
                <Select label="Status" value={form.status} onChange={v => setForm(p => ({ ...p, status: v }))} options={[{ value: "ativo", label: "Ativo" }, { value: "inativo", label: "Inativo" }]} />
              </div>
              <div className="flex gap-2 pt-1">
                <Btn onClick={addColaborador}>Salvar</Btn>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Cargo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Perfil</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Financeiro</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-muted-foreground text-sm">Nenhum colaborador encontrado</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{c.nome.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{c.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{c.cargo || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.perfil === "adm" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                        {c.perfil === "adm" ? "Admin" : "Colaborador"}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.acessoFinanceiro ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {c.acessoFinanceiro ? "Sim" : "Não"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === "ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                        {c.status === "ativo" ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeColaborador(c.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "times" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">{times.length} time(s) cadastrado(s)</p>
            <Btn onClick={() => setShowTimeForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo time</Btn>
          </div>
          {showTimeForm && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
              <p className="text-sm font-bold text-foreground">Novo Time</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome do time *" placeholder="Ex: Time Tributário" value={timeForm.nome} onChange={v => setTimeForm(p => ({ ...p, nome: v }))} />
                <Input label="Membros (separados por vírgula)" placeholder="João, Maria, Carlos..." value={timeForm.membros} onChange={v => setTimeForm(p => ({ ...p, membros: v }))} />
              </div>
              <div className="flex gap-2">
                <Btn onClick={addTime}>Salvar</Btn>
                <Btn variant="ghost" onClick={() => setShowTimeForm(false)}>Cancelar</Btn>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {times.map(t => (
              <div key={t.id} className="border border-border rounded-2xl p-4 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <p className="font-semibold text-foreground text-sm">{t.nome}</p>
                  </div>
                  <button onClick={() => removeTime(t.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {t.membros.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {t.membros.map(m => (
                      <span key={m} className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{m}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {times.length === 0 && <EmptyState icon={Users} title="Nenhum time cadastrado" subtitle="Clique em 'Novo time' para começar" />}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 4. Termos Monitorados ────────────────────────────────────────────────────

function TermosSection() {
  const [termos, setTermos] = useState(["Petrobras", "habeas corpus", "INSS", "FGTS", "Família Mendonça"]);
  const [input, setInput] = useState("");
  const add = () => { if (input.trim() && !termos.includes(input.trim())) { setTermos(p => [...p, input.trim()]); setInput(""); } };
  const remove = (t: string) => setTermos(p => p.filter(x => x !== t));
  return (
    <div className="space-y-6">
      <SectionHeader icon={FileText} title="Termos Monitorados" description="Defina termos que serão monitorados automaticamente em processos e documentos." />
      <div className="flex gap-2">
        <div className="flex-1">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Ex: habeas corpus, INSS, nome de cliente..." className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <Btn onClick={add}><Plus className="w-3.5 h-3.5" /> Adicionar</Btn>
      </div>
      {termos.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum termo cadastrado" subtitle="Adicione termos para monitoramento automático" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {termos.map(t => (
            <span key={t} className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-sm font-medium group">
              {t}
              <button onClick={() => remove(t)} className="opacity-50 group-hover:opacity-100 transition-opacity hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="p-3 bg-muted/50 border border-border rounded-xl flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        Pressione Enter ou clique "Adicionar" para salvar o termo. Os termos são case-insensitive.
      </div>
    </div>
  );
}

// ─── 5. Financeiro ────────────────────────────────────────────────────────────

type FinTab = "contas" | "cartoes" | "categorias" | "centros";

function FinanceiroSection() {
  const [tab, setTab] = useState<FinTab>("contas");
  const [contas, setContas] = useState([
    { id: 1, nome: "Conta Corrente Bradesco", banco: "Bradesco", agencia: "0001-9", conta: "12345-6", tipo: "Corrente" },
    { id: 2, nome: "Poupança Itaú", banco: "Itaú", agencia: "0042", conta: "98765-0", tipo: "Poupança" },
  ]);
  const [cartoes, setCartoes] = useState([
    { id: 1, nome: "Cartão Corporativo Visa", bandeira: "Visa", limite: "R$ 20.000", vencimento: "10" },
  ]);
  const [categorias, setCategorias] = useState(["Honorários", "Custas judiciais", "Despesas administrativas", "Salários", "Aluguel"]);
  const [centros, setCentros] = useState(["Tributário", "Trabalhista", "Cível", "Administrativo"]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [contaForm, setContaForm] = useState({ nome: "", banco: "", agencia: "", conta: "", tipo: "Corrente" });
  const [cartaoForm, setCartaoForm] = useState({ nome: "", bandeira: "", limite: "", vencimento: "" });

  const TABS: { id: FinTab; label: string; icon: React.ElementType }[] = [
    { id: "contas", label: "Contas", icon: Building },
    { id: "cartoes", label: "Cartões", icon: CreditCard },
    { id: "categorias", label: "Categorias", icon: Tag },
    { id: "centros", label: "Centro de Custos", icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader icon={DollarSign} title="Financeiro" description="Configure contas, cartões, categorias e centros de custo." />
      <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setTab(id); setShowForm(false); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab === "contas" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Nova conta</Btn>
          </div>
          {showForm && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome *" placeholder="Nome da conta" value={contaForm.nome} onChange={v => setContaForm(p => ({ ...p, nome: v }))} />
                <Input label="Banco" placeholder="Ex: Bradesco" value={contaForm.banco} onChange={v => setContaForm(p => ({ ...p, banco: v }))} />
                <Input label="Agência" placeholder="0001-9" value={contaForm.agencia} onChange={v => setContaForm(p => ({ ...p, agencia: v }))} />
                <Input label="Conta" placeholder="12345-6" value={contaForm.conta} onChange={v => setContaForm(p => ({ ...p, conta: v }))} />
                <Select label="Tipo" value={contaForm.tipo} onChange={v => setContaForm(p => ({ ...p, tipo: v }))} options={[{ value: "Corrente", label: "Corrente" }, { value: "Poupança", label: "Poupança" }, { value: "Investimento", label: "Investimento" }]} />
              </div>
              <div className="flex gap-2">
                <Btn onClick={() => { if (contaForm.nome) { setContas(p => [...p, { ...contaForm, id: Date.now() }]); setContaForm({ nome: "", banco: "", agencia: "", conta: "", tipo: "Corrente" }); setShowForm(false); } }}>Salvar</Btn>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
              </div>
            </div>
          )}
          {contas.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
                <Building className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.banco} • Ag. {c.agencia} • Cc. {c.conta}</p>
              </div>
              <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c.tipo}</span>
              <button onClick={() => setContas(p => p.filter(x => x.id !== c.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "cartoes" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo cartão</Btn>
          </div>
          {showForm && (
            <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Nome *" placeholder="Ex: Cartão Corporativo" value={cartaoForm.nome} onChange={v => setCartaoForm(p => ({ ...p, nome: v }))} />
                <Select label="Bandeira" value={cartaoForm.bandeira} onChange={v => setCartaoForm(p => ({ ...p, bandeira: v }))} options={[{ value: "", label: "Selecionar" }, { value: "Visa", label: "Visa" }, { value: "Mastercard", label: "Mastercard" }, { value: "Elo", label: "Elo" }, { value: "Amex", label: "Amex" }]} />
                <Input label="Limite" placeholder="R$ 0,00" value={cartaoForm.limite} onChange={v => setCartaoForm(p => ({ ...p, limite: v }))} />
                <Input label="Dia de vencimento" placeholder="10" value={cartaoForm.vencimento} onChange={v => setCartaoForm(p => ({ ...p, vencimento: v }))} />
              </div>
              <div className="flex gap-2">
                <Btn onClick={() => { if (cartaoForm.nome) { setCartoes(p => [...p, { ...cartaoForm, id: Date.now() }]); setCartaoForm({ nome: "", bandeira: "", limite: "", vencimento: "" }); setShowForm(false); } }}>Salvar</Btn>
                <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
              </div>
            </div>
          )}
          {cartoes.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.bandeira} • Limite: {c.limite} • Venc. dia {c.vencimento}</p>
              </div>
              <button onClick={() => setCartoes(p => p.filter(x => x.id !== c.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {(tab === "categorias" || tab === "centros") && (
        <SimpleListSection
          items={tab === "categorias" ? categorias : centros}
          onAdd={v => tab === "categorias" ? setCategorias(p => [...p, v]) : setCentros(p => [...p, v])}
          onRemove={v => tab === "categorias" ? setCategorias(p => p.filter(x => x !== v)) : setCentros(p => p.filter(x => x !== v))}
          placeholder={tab === "categorias" ? "Ex: Honorários, Custas..." : "Ex: Administrativo, Tributário..."}
          emptyTitle={tab === "categorias" ? "Nenhuma categoria" : "Nenhum centro de custo"}
        />
      )}
    </div>
  );
}

// ─── 6. Tarefas Padrão ────────────────────────────────────────────────────────

const FASES = ["Petição Inicial", "Audiência", "Instrução", "Recurso", "Execução", "Geral"];
const COMPLEXIDADES = ["Baixa", "Média", "Alta"];

function TarefasPadraoSection() {
  const [tarefas, setTarefas] = useState([
    { id: 1, nome: "Elaborar petição inicial", fase: "Petição Inicial", complexidade: "Alta", tempoMedio: "4h" },
    { id: 2, nome: "Preparar rol de testemunhas", fase: "Audiência", complexidade: "Média", tempoMedio: "2h" },
    { id: 3, nome: "Protocolar recurso de apelação", fase: "Recurso", complexidade: "Alta", tempoMedio: "8h" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", fase: "Geral", complexidade: "Média", tempoMedio: "" });
  const add = () => {
    if (!form.nome) return;
    setTarefas(p => [...p, { ...form, id: Date.now() }]);
    setForm({ nome: "", fase: "Geral", complexidade: "Média", tempoMedio: "" });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={CheckSquare} title="Tarefas Padrão" description="Defina tarefas padrão reutilizáveis por fase e complexidade do processo." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Nova tarefa padrão</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome *" placeholder="Ex: Elaborar petição inicial" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} className="col-span-2" />
            <Select label="Fase do processo" value={form.fase} onChange={v => setForm(p => ({ ...p, fase: v }))} options={FASES.map(f => ({ value: f, label: f }))} />
            <Select label="Complexidade" value={form.complexidade} onChange={v => setForm(p => ({ ...p, complexidade: v }))} options={COMPLEXIDADES.map(c => ({ value: c, label: c }))} />
            <Input label="Tempo médio" placeholder="Ex: 4h, 2 dias..." value={form.tempoMedio} onChange={v => setForm(p => ({ ...p, tempoMedio: v }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      {tarefas.length === 0 ? <EmptyState icon={CheckSquare} title="Nenhuma tarefa padrão" subtitle="Crie tarefas reutilizáveis para agilizar o trabalho" /> : (
        <div className="space-y-2">
          {tarefas.map(t => (
            <div key={t.id} className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <CheckSquare className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{t.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.fase} • {t.tempoMedio}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${t.complexidade === "Alta" ? "bg-destructive/15 text-destructive" : t.complexidade === "Média" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>
                {t.complexidade}
              </span>
              <button onClick={() => setTarefas(p => p.filter(x => x.id !== t.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 7. Workflow ──────────────────────────────────────────────────────────────

function WorkflowSection() {
  const [workflows, setWorkflows] = useState([
    { id: 1, nome: "Abertura de Processo Cível", tarefa: "Elaborar petição inicial", responsavel: "Dr. Carlos Mendes", prazoDias: 5 },
    { id: 2, nome: "Audiência de Instrução", tarefa: "Preparar rol de testemunhas", responsavel: "Dra. Ana Rodrigues", prazoDias: 3 },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", tarefa: "", responsavel: "", prazoDias: "" });
  const add = () => {
    if (!form.nome || !form.tarefa) return;
    setWorkflows(p => [...p, { ...form, id: Date.now(), prazoDias: Number(form.prazoDias) || 0 }]);
    setForm({ nome: "", tarefa: "", responsavel: "", prazoDias: "" });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={GitBranch} title="Workflow" description="Configure workflows automatizados com tarefas, responsáveis e prazos." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo workflow</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome do workflow *" placeholder="Ex: Abertura de Processo" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} className="col-span-2" />
            <Input label="Tarefa *" placeholder="Ex: Elaborar petição inicial" value={form.tarefa} onChange={v => setForm(p => ({ ...p, tarefa: v }))} />
            <Input label="Responsável" placeholder="Ex: Dr. Carlos Mendes" value={form.responsavel} onChange={v => setForm(p => ({ ...p, responsavel: v }))} />
            <Input label="Prazo (dias)" placeholder="Ex: 5" type="number" value={form.prazoDias} onChange={v => setForm(p => ({ ...p, prazoDias: v }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      {workflows.length === 0 ? <EmptyState icon={GitBranch} title="Nenhum workflow configurado" subtitle="Crie workflows para automatizar seu processo" /> : (
        <div className="space-y-2">
          {workflows.map(w => (
            <div key={w.id} className="flex items-center gap-4 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{w.nome}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{w.tarefa} • {w.responsavel || "—"}</p>
              </div>
              {w.prazoDias > 0 && (
                <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground flex-shrink-0">{w.prazoDias}d prazo</span>
              )}
              <button onClick={() => setWorkflows(p => p.filter(x => x.id !== w.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 8. Grupo de Ação ─────────────────────────────────────────────────────────

function GrupoAcaoSection() {
  const [grupos, setGrupos] = useState([
    { id: 1, nome: "Grupo Trabalhista", responsavel: "Dra. Ana Rodrigues" },
    { id: 2, nome: "Grupo Cível", responsavel: "Dr. Carlos Mendes" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", responsavel: "" });
  const add = () => {
    if (!form.nome) return;
    setGrupos(p => [...p, { ...form, id: Date.now() }]);
    setForm({ nome: "", responsavel: "" });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Layers} title="Grupos de Ação" description="Agrupe intimações e ações por responsável ou área." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo grupo</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome do grupo *" placeholder="Ex: Grupo Trabalhista" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} />
            <Input label="Responsável pelas intimações" placeholder="Ex: Dra. Ana Rodrigues" value={form.responsavel} onChange={v => setForm(p => ({ ...p, responsavel: v }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {grupos.map(g => (
          <div key={g.id} className="flex items-center gap-3 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{g.nome}</p>
              <p className="text-xs text-muted-foreground">{g.responsavel || "Sem responsável"}</p>
            </div>
            <button onClick={() => setGrupos(p => p.filter(x => x.id !== g.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {grupos.length === 0 && <EmptyState icon={Layers} title="Nenhum grupo cadastrado" subtitle="Crie grupos para organizar intimações" />}
      </div>
    </div>
  );
}

// ─── 9. Tipos de Ação ─────────────────────────────────────────────────────────

function TiposAcaoSection() {
  const GRUPOS_MOCK = ["Grupo Trabalhista", "Grupo Cível", "Grupo Tributário"];
  const [tipos, setTipos] = useState([
    { id: 1, nome: "Audiência de Instrução", grupo: "Grupo Cível" },
    { id: 2, nome: "Reclamação Trabalhista", grupo: "Grupo Trabalhista" },
    { id: 3, nome: "Auto de Infração", grupo: "Grupo Tributário" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", grupo: GRUPOS_MOCK[0] });
  const add = () => {
    if (!form.nome) return;
    setTipos(p => [...p, { ...form, id: Date.now() }]);
    setForm({ nome: "", grupo: GRUPOS_MOCK[0] });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Tag} title="Tipos de Ação" description="Classifique os tipos de ação judicial por grupo." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo tipo</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome *" placeholder="Ex: Audiência de Instrução" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} />
            <Select label="Grupo vinculado" value={form.grupo} onChange={v => setForm(p => ({ ...p, grupo: v }))} options={GRUPOS_MOCK.map(g => ({ value: g, label: g }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grupo</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tipos.length === 0 ? (
              <tr><td colSpan={3} className="py-10 text-center text-muted-foreground text-sm">Nenhum tipo cadastrado</td></tr>
            ) : tipos.map(t => (
              <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground text-sm">{t.nome}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{t.grupo}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setTipos(p => p.filter(x => x.id !== t.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 10. Metas ───────────────────────────────────────────────────────────────

function MetasSection() {
  const SETORES = ["Tributário", "Trabalhista", "Cível", "Família", "Criminal", "Administrativo"];
  const [metas, setMetas] = useState([
    { id: 1, setor: "Tributário", descricao: "Fechar 10 novos contratos até junho", valor: "10 contratos", periodo: "Semestral" },
    { id: 2, setor: "Trabalhista", descricao: "Reduzir prazo médio de processos em 20%", valor: "20%", periodo: "Anual" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ setor: SETORES[0], descricao: "", valor: "", periodo: "Mensal" });
  const add = () => {
    if (!form.descricao) return;
    setMetas(p => [...p, { ...form, id: Date.now() }]);
    setForm({ setor: SETORES[0], descricao: "", valor: "", periodo: "Mensal" });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={BarChart2} title="Metas" description="Defina metas por setor para acompanhar a performance do escritório." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Nova meta</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Select label="Setor" value={form.setor} onChange={v => setForm(p => ({ ...p, setor: v }))} options={SETORES.map(s => ({ value: s, label: s }))} />
            <Select label="Período" value={form.periodo} onChange={v => setForm(p => ({ ...p, periodo: v }))} options={["Mensal", "Trimestral", "Semestral", "Anual"].map(x => ({ value: x, label: x }))} />
            <Input label="Descrição *" placeholder="Descreva a meta..." value={form.descricao} onChange={v => setForm(p => ({ ...p, descricao: v }))} className="col-span-2" />
            <Input label="Valor / Indicador" placeholder="Ex: 10 contratos, 20%..." value={form.valor} onChange={v => setForm(p => ({ ...p, valor: v }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      {metas.length === 0 ? <EmptyState icon={BarChart2} title="Nenhuma meta definida" subtitle="Defina metas por setor para monitorar performance" /> : (
        <div className="space-y-2">
          {metas.map(m => (
            <div key={m.id} className="flex items-start gap-4 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart2 className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.setor}</span>
                  <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m.periodo}</span>
                </div>
                <p className="font-medium text-foreground text-sm mt-1">{m.descricao}</p>
                {m.valor && <p className="text-xs text-muted-foreground mt-0.5">Indicador: <strong className="text-foreground">{m.valor}</strong></p>}
              </div>
              <button onClick={() => setMetas(p => p.filter(x => x.id !== m.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 11. Origem de Pessoas ────────────────────────────────────────────────────

function OrigemPessoasSection() {
  const DEFAULTS = ["Facebook / Instagram", "Google Ads", "Indicação de cliente", "LinkedIn", "Site orgânico", "Evento / palestra", "OAB", "Outro"];
  const [origens, setOrigens] = useState(DEFAULTS);
  return (
    <div className="space-y-6">
      <SectionHeader icon={UserPlus} title="Origem de Pessoas" description="Configure as origens de captação de clientes e leads do escritório." />
      <SimpleListSection
        items={origens}
        onAdd={v => setOrigens(p => [...p, v])}
        onRemove={v => setOrigens(p => p.filter(x => x !== v))}
        placeholder="Ex: TikTok, Indicação de parceiro..."
        emptyTitle="Nenhuma origem cadastrada"
      />
    </div>
  );
}

// ─── 12. Parceiros ────────────────────────────────────────────────────────────

function ParceirosSection() {
  const [parceiros, setParceiros] = useState([
    { id: 1, nome: "Contabilidade Souza & Filhos", tipo: "Contabilidade", contato: "contato@souzacontabil.com.br" },
    { id: 2, nome: "Peritos Associados BR", tipo: "Perícia", contato: "(11) 98765-4321" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", tipo: "", contato: "" });
  const add = () => {
    if (!form.nome) return;
    setParceiros(p => [...p, { ...form, id: Date.now() }]);
    setForm({ nome: "", tipo: "", contato: "" });
    setShowForm(false);
  };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Handshake} title="Parceiros" description="Cadastre parceiros estratégicos do escritório (contadores, peritos, etc.)." />
      <div className="flex justify-end">
        <Btn onClick={() => setShowForm(p => !p)}><Plus className="w-3.5 h-3.5" /> Novo parceiro</Btn>
      </div>
      {showForm && (
        <div className="bg-muted/50 border border-border rounded-2xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nome *" placeholder="Nome do parceiro / empresa" value={form.nome} onChange={v => setForm(p => ({ ...p, nome: v }))} className="col-span-2" />
            <Input label="Tipo / Área" placeholder="Ex: Contabilidade, Perícia..." value={form.tipo} onChange={v => setForm(p => ({ ...p, tipo: v }))} />
            <Input label="Contato" placeholder="Email ou telefone" value={form.contato} onChange={v => setForm(p => ({ ...p, contato: v }))} />
          </div>
          <div className="flex gap-2">
            <Btn onClick={add}>Salvar</Btn>
            <Btn variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Btn>
          </div>
        </div>
      )}
      {parceiros.length === 0 ? <EmptyState icon={Handshake} title="Nenhum parceiro cadastrado" subtitle="Adicione parceiros estratégicos do escritório" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {parceiros.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-4 border border-border rounded-2xl hover:border-primary/30 transition-all">
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
                <Handshake className="w-4 h-4 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">{p.nome}</p>
                {p.tipo && <p className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground inline-block mt-1">{p.tipo}</p>}
                {p.contato && <p className="text-xs text-muted-foreground mt-1">{p.contato}</p>}
              </div>
              <button onClick={() => setParceiros(prev => prev.filter(x => x.id !== p.id))} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 13. Integrações & API ────────────────────────────────────────────────────

const INTEGRACOES = [
  { id: "rd", nome: "RD Station", descricao: "CRM e automação de marketing para captação de clientes.", icon: "🎯", categoria: "CRM / Marketing", conectado: false },
  { id: "asaas", nome: "Asaas", descricao: "Cobrança, pagamentos e emissão de boletos bancários.", icon: "💳", categoria: "Financeiro", conectado: false },
  { id: "google", nome: "Google Agenda", descricao: "Sincronize compromissos e prazos com o Google Calendar.", icon: "📅", categoria: "Produtividade", conectado: false },
  { id: "whatsapp", nome: "WhatsApp Business", descricao: "Envio automático de alertas e comunicação com clientes.", icon: "💬", categoria: "Comunicação", conectado: true },
  { id: "docusign", nome: "DocuSign", descricao: "Assinatura eletrônica de contratos e procurações.", icon: "✍️", categoria: "Documentos", conectado: false },
  { id: "dropbox", nome: "Dropbox / Drive", descricao: "Armazenamento e compartilhamento de documentos jurídicos.", icon: "📁", categoria: "Documentos", conectado: false },
  { id: "correios", nome: "API dos Correios", descricao: "Rastreamento de intimações e documentos enviados.", icon: "📮", categoria: "Notificações", conectado: false },
  { id: "pje", nome: "PJe (CNPJ Nacional)", descricao: "Integração com o sistema Processo Judicial Eletrônico.", icon: "⚖️", categoria: "Tribunais", conectado: false },
];

function IntegracoesSection() {
  const [conectados, setConectados] = useState<Set<string>>(new Set(INTEGRACOES.filter(i => i.conectado).map(i => i.id)));
  const toggle = (id: string) => setConectados(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const categorias = [...new Set(INTEGRACOES.map(i => i.categoria))];

  return (
    <div className="space-y-6">
      <SectionHeader icon={Zap} title="Integrações & API" description="Conecte o VIGORA a ferramentas externas para automatizar seu fluxo de trabalho." />
      {categorias.map(cat => (
        <div key={cat}>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">{cat}</p>
          <div className="space-y-2">
            {INTEGRACOES.filter(i => i.categoria === cat).map(integ => {
              const ativo = conectados.has(integ.id);
              return (
                <div key={integ.id} className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${ativo ? "border-primary/40 bg-primary/5" : "border-border hover:border-border/80"}`}>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl flex-shrink-0">{integ.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{integ.nome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{integ.descricao}</p>
                  </div>
                  <button
                    onClick={() => toggle(integ.id)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${ativo ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "text-white hover:opacity-90"}`}
                    style={!ativo ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
                  >
                    {ativo ? "Desconectar" : "Conectar"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="p-4 bg-muted/50 border border-border rounded-2xl">
        <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5"><Link2 className="w-3.5 h-3.5 text-primary" /> Chave de API</p>
        <div className="flex gap-2 mt-2">
          <code className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-muted-foreground font-mono select-all">vig_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx</code>
          <Btn variant="ghost" size="sm">Copiar</Btn>
          <Btn size="sm">Gerar nova</Btn>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">Nunca compartilhe sua chave de API. Use-a para integrar sistemas externos ao VIGORA.</p>
      </div>
    </div>
  );
}

// ─── 14. Notificações ─────────────────────────────────────────────────────────

function NotificacoesSection() {
  const [prefs, setPrefs] = useState({
    prazoVencendo: true, novoProcesso: true, tarefaAtribuida: true,
    alertaCritico: true, resumoDiario: false, resumoSemanal: true,
    whatsapp: false, email: true,
  });
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }));
  const items: { key: keyof typeof prefs; label: string; description: string }[] = [
    { key: "prazoVencendo", label: "Prazo vencendo", description: "Notificar quando um prazo está próximo do vencimento" },
    { key: "novoProcesso", label: "Novo processo", description: "Notificar quando um novo processo for cadastrado" },
    { key: "tarefaAtribuida", label: "Tarefa atribuída", description: "Notificar quando uma tarefa for atribuída a você" },
    { key: "alertaCritico", label: "Alertas críticos", description: "Sempre notificar alertas de nível crítico" },
    { key: "resumoDiario", label: "Resumo diário", description: "Receber um resumo do dia por email às 8h" },
    { key: "resumoSemanal", label: "Resumo semanal", description: "Receber um resumo semanal às segundas-feiras" },
  ];
  const channels: { key: keyof typeof prefs; label: string; icon: React.ElementType }[] = [
    { key: "email", label: "Email", icon: Bell },
    { key: "whatsapp", label: "WhatsApp", icon: Bell },
  ];
  return (
    <div className="space-y-6">
      <SectionHeader icon={Bell} title="Notificações" description="Configure como e quando deseja receber alertas do sistema." />
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Eventos</p>
        <div className="space-y-2">
          {items.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 border border-border rounded-2xl hover:border-border/80 transition-all">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              </div>
              <button
                onClick={() => toggle(key)}
                className={`w-11 h-6 rounded-full transition-all flex-shrink-0 relative ${prefs[key] ? "bg-primary" : "bg-muted border border-border"}`}
                style={prefs[key] ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${prefs[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-3">Canais</p>
        <div className="grid grid-cols-2 gap-3">
          {channels.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${prefs[key] ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}
            >
              {prefs[key] && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{prefs[key] ? "Ativo" : "Inativo"}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── 15. Segurança ────────────────────────────────────────────────────────────

function SegurancaSection() {
  const [form, setForm] = useState({ senhaAtual: "", novaSenha: "", confirmacao: "" });
  const [saved, setSaved] = useState(false);
  const handleSave = () => { if (form.novaSenha && form.novaSenha === form.confirmacao) { setSaved(true); setForm({ senhaAtual: "", novaSenha: "", confirmacao: "" }); setTimeout(() => setSaved(false), 3000); } };
  return (
    <div className="space-y-6">
      <SectionHeader icon={Shield} title="Segurança" description="Gerencie sua senha e configurações de segurança da conta." />
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">Alterar senha</p>
        <div className="space-y-3 max-w-md">
          <Input label="Senha atual" type="password" placeholder="••••••••" value={form.senhaAtual} onChange={v => setForm(p => ({ ...p, senhaAtual: v }))} />
          <Input label="Nova senha" type="password" placeholder="Mín. 8 caracteres" value={form.novaSenha} onChange={v => setForm(p => ({ ...p, novaSenha: v }))} />
          <Input label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" value={form.confirmacao} onChange={v => setForm(p => ({ ...p, confirmacao: v }))} />
          {saved && <p className="text-xs text-success flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Senha alterada com sucesso!</p>}
          {form.novaSenha && form.confirmacao && form.novaSenha !== form.confirmacao && (
            <p className="text-xs text-destructive flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> As senhas não coincidem</p>
          )}
          <Btn onClick={handleSave}>Salvar nova senha</Btn>
        </div>
      </div>
      <div className="border-t border-border pt-6 space-y-3">
        <p className="text-sm font-semibold text-foreground">Sessões ativas</p>
        <div className="space-y-2">
          {[
            { device: "Chrome — Windows 11", local: "São Paulo, SP", active: true },
            { device: "Safari — iPhone 15", local: "São Paulo, SP", active: false },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-border rounded-2xl">
              <div>
                <p className="text-sm font-medium text-foreground">{s.device}</p>
                <p className="text-xs text-muted-foreground">{s.local}</p>
              </div>
              {s.active
                ? <span className="text-[10px] font-bold text-success bg-success/15 px-2 py-0.5 rounded-full">Sessão atual</span>
                : <Btn variant="danger" size="sm">Encerrar</Btn>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared: Simple list (tags/chips) ────────────────────────────────────────

function SimpleListSection({ items, onAdd, onRemove, placeholder, emptyTitle }: {
  items: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void; placeholder: string; emptyTitle: string;
}) {
  const [input, setInput] = useState("");
  const add = () => { if (input.trim() && !items.includes(input.trim())) { onAdd(input.trim()); setInput(""); } };
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder={placeholder}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <Btn onClick={add}><Plus className="w-3.5 h-3.5" /> Adicionar</Btn>
      </div>
      {items.length === 0 ? <EmptyState icon={Tag} title={emptyTitle} subtitle="Clique em 'Adicionar' para começar" /> : (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <span key={item} className="flex items-center gap-1.5 bg-muted border border-border px-3 py-1.5 rounded-xl text-sm font-medium text-foreground group">
              {item}
              <button onClick={() => onRemove(item)} className="opacity-40 group-hover:opacity-100 hover:text-destructive transition-all">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Personalizar Menu Section ────────────────────────────────────────────────

const SIDEBAR_ITEMS: { group: string; href: string; label: string }[] = [
  { group: "Principal",   href: "/",                   label: "Dashboard" },
  { group: "Principal",   href: "/processos",           label: "Processos" },
  { group: "Principal",   href: "/prazos",              label: "Prazos" },
  { group: "Principal",   href: "/tarefas",             label: "Tarefas" },
  { group: "Principal",   href: "/clientes",            label: "Clientes" },
  { group: "Principal",   href: "/equipe",              label: "Equipe" },
  { group: "Módulos",     href: "/agenda",              label: "Agenda" },
  { group: "Módulos",     href: "/contatos",            label: "Contatos" },
  { group: "Módulos",     href: "/intimacoes",          label: "Intimações" },
  { group: "Módulos",     href: "/financeiro",          label: "Financeiro" },
  { group: "Módulos",     href: "/parceiros",           label: "Parceiros" },
  { group: "Módulos",     href: "/modelos",             label: "Modelos" },
  { group: "Módulos",     href: "/relatorios",          label: "Relatórios" },
  { group: "Ferramentas", href: "/alertas",             label: "Alertas" },
  { group: "Ferramentas", href: "/contatos-whatsapp",   label: "WhatsApp" },
  { group: "Ferramentas", href: "/notificacoes-processos", label: "Notif. Processos" },
];

const ALWAYS_VISIBLE = new Set(["/"]);

function PersonalizarMenuSection() {
  const [hidden, setHidden] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("vigora_nav_hidden") || "[]"); } catch { return []; }
  });

  const toggle = (href: string) => {
    setHidden(prev => {
      const next = prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href];
      localStorage.setItem("vigora_nav_hidden", JSON.stringify(next));
      window.dispatchEvent(new Event("vigora_nav_changed"));
      return next;
    });
  };

  const groups = [...new Set(SIDEBAR_ITEMS.map(i => i.group))];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Layers}
        title="Menu Lateral"
        description="Escolha quais itens aparecem no menu de navegação"
      />

      <div className="glass-panel rounded-2xl p-5 space-y-5">
        {groups.map(group => (
          <div key={group}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">{group}</p>
            <div className="space-y-2">
              {SIDEBAR_ITEMS.filter(i => i.group === group).map(item => {
                const isHidden = hidden.includes(item.href);
                const isAlways = ALWAYS_VISIBLE.has(item.href);
                return (
                  <div key={item.href} className="flex items-center justify-between py-2.5 px-4 bg-muted/50 rounded-xl border border-border/50">
                    <span className={`text-sm font-medium ${isHidden ? "text-muted-foreground/50" : "text-foreground"}`}>{item.label}</span>
                    <div className="flex items-center gap-3">
                      {isAlways && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">sempre visível</span>}
                      <button
                        disabled={isAlways}
                        onClick={() => !isAlways && toggle(item.href)}
                        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
                          !isHidden ? "bg-primary" : "bg-muted-foreground/30"
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                          !isHidden ? "translate-x-5" : "translate-x-0.5"
                        }`} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-4 border-l-4 border-primary/50">
        <p className="text-sm text-muted-foreground">
          As alterações são aplicadas imediatamente no menu lateral. Itens ocultos ainda podem ser acessados via URL direta.
        </p>
      </div>
    </div>
  );
}
