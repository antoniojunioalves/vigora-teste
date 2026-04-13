import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Users, Plus, Search, Shield, ChevronDown, X, Check,
  UserCheck, UserX, Edit2, Mail, Phone, Building2,
  Crown, Briefcase, GraduationCap, DollarSign, Star,
  Clock, Circle, MoreVertical, Key, AlertCircle, Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = "owner" | "socio" | "coordenador" | "advogado" | "estagiario" | "financeiro";
type StatusUsuario = "ativo" | "inativo";

interface Equipe { id: number; nome: string; cor: string; descricao?: string; }
interface Membro {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: Role;
  status: StatusUsuario;
  equipeId?: number;
  equipe?: { id: number; nome: string; cor: string };
  ultimoAcesso?: string;
  criadoEm: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<Role, { label: string; icon: any; color: string; bg: string; border: string; desc: string }> = {
  owner:       { label: "Presidente / Dono",    icon: Crown,         color: "text-yellow-600 dark:text-yellow-400",  bg: "bg-yellow-50 dark:bg-yellow-500/15",  border: "border-yellow-200 dark:border-yellow-500/30", desc: "Acesso total ao sistema" },
  socio:       { label: "Sócio",                icon: Star,          color: "text-purple-600 dark:text-purple-400",  bg: "bg-purple-50 dark:bg-purple-500/15",  border: "border-purple-200 dark:border-purple-500/30", desc: "Acesso a todos os processos" },
  coordenador: { label: "Coordenador",          icon: Layers,        color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-500/15",     border: "border-blue-200 dark:border-blue-500/30",    desc: "Gerencia equipe e distribui processos" },
  advogado:    { label: "Advogado",             icon: Briefcase,     color: "text-primary",                          bg: "bg-primary/10",                       border: "border-primary/25",                           desc: "Acessa processos atribuídos" },
  estagiario:  { label: "Estagiário",           icon: GraduationCap, color: "text-success",                          bg: "bg-success/10",                       border: "border-success/25",                           desc: "Executa tarefas atribuídas" },
  financeiro:  { label: "Financeiro",           icon: DollarSign,    color: "text-warning",                          bg: "bg-warning/10",                       border: "border-warning/25",                           desc: "Acesso a faturamento e relatórios" },
};

const PERMISSIONS_MATRIX: { label: string; key: string; roles: Record<Role, boolean | "partial"> }[] = [
  { label: "Criar usuários",         key: "criar_usuario",       roles: { owner: true,    socio: false,    coordenador: false,   advogado: false, estagiario: false, financeiro: false } },
  { label: "Editar permissões",      key: "editar_permissoes",   roles: { owner: true,    socio: false,    coordenador: false,   advogado: false, estagiario: false, financeiro: false } },
  { label: "Ver todos os processos", key: "ver_processos",       roles: { owner: true,    socio: true,     coordenador: true,    advogado: "partial", estagiario: "partial", financeiro: false } },
  { label: "Criar processos",        key: "criar_processo",      roles: { owner: true,    socio: true,     coordenador: true,    advogado: true,  estagiario: false, financeiro: false } },
  { label: "Excluir processos",      key: "excluir_processo",    roles: { owner: true,    socio: false,    coordenador: false,   advogado: false, estagiario: false, financeiro: false } },
  { label: "Criar tarefas",          key: "criar_tarefa",        roles: { owner: true,    socio: true,     coordenador: true,    advogado: true,  estagiario: true,  financeiro: false } },
  { label: "Gerenciar equipe",       key: "gerenciar_equipe",    roles: { owner: true,    socio: true,     coordenador: true,    advogado: false, estagiario: false, financeiro: false } },
  { label: "Ver relatórios",         key: "ver_relatorios",      roles: { owner: true,    socio: true,     coordenador: true,    advogado: false, estagiario: false, financeiro: true  } },
  { label: "Acesso financeiro",      key: "acesso_financeiro",   roles: { owner: true,    socio: true,     coordenador: false,   advogado: false, estagiario: false, financeiro: true  } },
  { label: "Configurações gerais",   key: "config_gerais",       roles: { owner: true,    socio: false,    coordenador: false,   advogado: false, estagiario: false, financeiro: false } },
  { label: "Auditoria completa",     key: "auditoria",           roles: { owner: true,    socio: false,    coordenador: false,   advogado: false, estagiario: false, financeiro: false } },
];

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_EQUIPES: Equipe[] = [
  { id: 1, nome: "Trabalhista", cor: "#4f46e5", descricao: "Causas cíveis e trabalhistas" },
  { id: 2, nome: "Cível",       cor: "#0ea5e9", descricao: "Contencioso cível" },
  { id: 3, nome: "Tributário",  cor: "#f59e0b", descricao: "Planejamento e contencioso tributário" },
];

const MOCK_MEMBROS: Membro[] = [
  { id: 1, nome: "Dr. Carlos Mendes",    email: "carlos@vigora.adv.br",   telefone: "(11) 99001-1234", role: "owner",       status: "ativo",   equipe: MOCK_EQUIPES[0], ultimoAcesso: new Date().toISOString(),                                    criadoEm: "2023-01-01T00:00:00Z" },
  { id: 2, nome: "Dra. Ana Rodrigues",   email: "ana@vigora.adv.br",      telefone: "(11) 99002-2345", role: "socio",       status: "ativo",   equipe: MOCK_EQUIPES[1], ultimoAcesso: new Date(Date.now() - 2 * 3600000).toISOString(),             criadoEm: "2023-02-15T00:00:00Z" },
  { id: 3, nome: "Dr. Ricardo Lima",     email: "ricardo@vigora.adv.br",  telefone: "(21) 99003-3456", role: "coordenador", status: "ativo",   equipe: MOCK_EQUIPES[0], ultimoAcesso: new Date(Date.now() - 1 * 86400000).toISOString(),            criadoEm: "2023-04-10T00:00:00Z" },
  { id: 4, nome: "Dra. Juliana Costa",   email: "juliana@vigora.adv.br",  telefone: "(31) 99004-4567", role: "advogado",    status: "ativo",   equipe: MOCK_EQUIPES[2], ultimoAcesso: new Date(Date.now() - 3 * 3600000).toISOString(),             criadoEm: "2023-06-22T00:00:00Z" },
  { id: 5, nome: "Pedro Alves",          email: "pedro@vigora.adv.br",    telefone: "(41) 99005-5678", role: "estagiario",  status: "ativo",   equipe: MOCK_EQUIPES[0], ultimoAcesso: new Date(Date.now() - 5 * 3600000).toISOString(),             criadoEm: "2024-01-08T00:00:00Z" },
  { id: 6, nome: "Camila Ferreira",      email: "camila@vigora.adv.br",   telefone: "(51) 99006-6789", role: "financeiro",  status: "ativo",   equipe: undefined,       ultimoAcesso: new Date(Date.now() - 2 * 86400000).toISOString(),            criadoEm: "2023-09-01T00:00:00Z" },
  { id: 7, nome: "Bruno Martins",        email: "bruno@vigora.adv.br",    telefone: "(61) 99007-7890", role: "advogado",    status: "inativo", equipe: MOCK_EQUIPES[1], ultimoAcesso: new Date(Date.now() - 30 * 86400000).toISOString(),           criadoEm: "2023-03-05T00:00:00Z" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
  const cfg = ROLE_CONFIG[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EquipePage() {
  const [tab, setTab] = useState<"membros" | "times" | "permissoes">("membros");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<Role | "">("");
  const [filterStatus, setFilterStatus] = useState<"" | "ativo" | "inativo">("");
  const [membros, setMembros] = useState<Membro[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [isEquipeModalOpen, setIsEquipeModalOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("vigora_token");
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        const [mRes, eRes] = await Promise.all([
          fetch("/api/equipe/membros", { headers }),
          fetch("/api/equipe/times", { headers }),
        ]);
        const mData = mRes.ok ? await mRes.json() : [];
        const eData = eRes.ok ? await eRes.json() : [];
        setMembros(mData.length > 0 ? mData : MOCK_MEMBROS);
        setEquipes(eData.length > 0 ? eData : MOCK_EQUIPES);
      } catch {
        setMembros(MOCK_MEMBROS);
        setEquipes(MOCK_EQUIPES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMembros = membros.filter(m => {
    const q = search.toLowerCase();
    if (q && !m.nome.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
    if (filterRole && m.role !== filterRole) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    return true;
  });

  const ativos = membros.filter(m => m.status === "ativo").length;

  return (
    <AppLayout>
      <div className="space-y-5 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Equipe & Permissões</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              <span className="font-semibold text-foreground">{ativos}</span> membros ativos · {equipes.length} equipes
            </p>
          </div>
          <div className="flex gap-2">
            {tab === "times" && (
              <button
                onClick={() => setIsEquipeModalOpen(true)}
                className="bg-muted border border-border text-foreground px-3.5 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all hover:bg-muted/80"
              >
                <Plus className="w-4 h-4" /> Nova Equipe
              </button>
            )}
            <button
              onClick={() => { setEditingMembro(null); setIsModalOpen(true); }}
              className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Adicionar Membro
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(ROLE_CONFIG).slice(0, 4).map(([role, cfg]) => {
            const count = membros.filter(m => m.role === role && m.status === "ativo").length;
            const Icon = cfg.icon;
            return (
              <div key={role} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`${cfg.bg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold font-display text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cfg.label.split(" / ")[0]}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="glass-panel rounded-xl p-1.5 flex gap-1 w-fit">
          {[
            { id: "membros", label: "Membros", icon: Users },
            { id: "times", label: "Equipes", icon: Building2 },
            { id: "permissoes", label: "Matriz de Permissões", icon: Shield },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: MEMBROS ─────────────────────────────────────────────────────── */}
        {tab === "membros" && (
          <div className="glass-panel rounded-xl overflow-hidden">
            {/* Filters */}
            <div className="px-5 py-3.5 border-b border-border flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value as any)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground appearance-none min-w-[140px]"
              >
                <option value="">Cargo (Todos)</option>
                {Object.entries(ROLE_CONFIG).map(([r, cfg]) => (
                  <option key={r} value={r}>{cfg.label}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground appearance-none min-w-[120px]"
              >
                <option value="">Status (Todos)</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Membro</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cargo</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Equipe</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Último Acesso</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-muted shrink-0" /><div><div className="h-4 bg-muted rounded w-32 mb-1" /><div className="h-3 bg-muted rounded w-24" /></div></div></td>
                        <td className="px-5 py-4"><div className="h-5 bg-muted rounded-full w-24" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                        <td className="px-5 py-4"><div className="h-5 bg-muted rounded-full w-14" /></td>
                        <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-24" /></td>
                        <td className="px-5 py-4 text-right"><div className="h-7 w-7 bg-muted rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredMembros.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="font-semibold text-foreground">Nenhum membro encontrado</p>
                      </td>
                    </tr>
                  ) : (
                    filteredMembros.map(membro => {
                      const cfg = ROLE_CONFIG[membro.role];
                      const Icon = cfg.icon;
                      return (
                        <tr key={membro.id} className="table-row-hover group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center ${cfg.color} font-bold text-sm shrink-0`}>
                                {membro.nome.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{membro.nome}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Mail className="w-2.5 h-2.5" />{membro.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4"><RoleBadge role={membro.role} /></td>
                          <td className="px-5 py-4">
                            {membro.equipe ? (
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: membro.equipe.cor }} />
                                {membro.equipe.nome}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Sem equipe</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${membro.status === "ativo" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${membro.status === "ativo" ? "bg-success" : "bg-muted-foreground"}`} />
                              {membro.status === "ativo" ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">
                            {membro.ultimoAcesso
                              ? formatDistanceToNow(new Date(membro.ultimoAcesso), { addSuffix: true, locale: ptBR })
                              : "Nunca acessou"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => { setEditingMembro(membro); setIsModalOpen(true); }}
                                className="p-1.5 bg-muted hover:bg-primary hover:text-white rounded-lg text-muted-foreground transition-all"
                                title="Editar membro"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setMembros(prev => prev.map(m => m.id === membro.id ? { ...m, status: m.status === "ativo" ? "inativo" : "ativo" } : m));
                                  toast({ title: `Membro ${membro.status === "ativo" ? "desativado" : "ativado"}` });
                                }}
                                className={`p-1.5 rounded-lg transition-all ${membro.status === "ativo" ? "bg-muted hover:bg-destructive/10 hover:text-destructive text-muted-foreground" : "bg-muted hover:bg-success/10 hover:text-success text-muted-foreground"}`}
                                title={membro.status === "ativo" ? "Desativar" : "Reativar"}
                              >
                                {membro.status === "ativo" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: TIMES ───────────────────────────────────────────────────────── */}
        {tab === "times" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipes.map(equipe => {
              const membrosNaEquipe = membros.filter(m => m.equipe?.id === equipe.id && m.status === "ativo");
              return (
                <div key={equipe.id} className="glass-panel rounded-xl p-5 flex flex-col gap-4 hover:-translate-y-0.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: equipe.cor }}>
                        {equipe.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{equipe.nome}</p>
                        {equipe.descricao && <p className="text-xs text-muted-foreground">{equipe.descricao}</p>}
                      </div>
                    </div>
                    <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {membrosNaEquipe.slice(0, 5).map(m => (
                      <div key={m.id} title={m.nome} className={`w-7 h-7 rounded-lg ${ROLE_CONFIG[m.role].bg} ${ROLE_CONFIG[m.role].color} flex items-center justify-center text-[11px] font-bold border ${ROLE_CONFIG[m.role].border}`}>
                        {m.nome.charAt(0)}
                      </div>
                    ))}
                    {membrosNaEquipe.length > 5 && (
                      <div className="w-7 h-7 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">
                        +{membrosNaEquipe.length - 5}
                      </div>
                    )}
                    {membrosNaEquipe.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">Sem membros ativos</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{membrosNaEquipe.length} membros</span>
                    <button className="hover:text-primary transition-colors font-medium">Ver detalhes</button>
                  </div>
                </div>
              );
            })}

            {/* Add team card */}
            <button
              onClick={() => setIsEquipeModalOpen(true)}
              className="glass-panel rounded-xl p-5 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all min-h-[160px] group"
            >
              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/15 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Nova Equipe</p>
            </button>
          </div>
        )}

        {/* ── TAB: PERMISSÕES ──────────────────────────────────────────────────── */}
        {tab === "permissoes" && (
          <div className="glass-panel rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-bold text-foreground">Matriz RBAC — Controle por Cargo</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Permissões baseadas no cargo. Personalizações individuais disponíveis por membro.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[200px]">Permissão</th>
                    {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <th key={role} className="px-4 py-3 text-center min-w-[110px]">
                          <div className="flex flex-col items-center gap-1.5">
                            <div className={`${cfg.bg} p-1.5 rounded-lg`}>
                              <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                            </div>
                            <span className={`text-[10px] font-bold ${cfg.color}`}>{cfg.label.split(" / ")[0]}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {PERMISSIONS_MATRIX.map(perm => (
                    <tr key={perm.key} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-foreground">{perm.label}</p>
                      </td>
                      {(Object.keys(ROLE_CONFIG) as Role[]).map(role => {
                        const val = perm.roles[role];
                        return (
                          <td key={role} className="px-4 py-3.5 text-center">
                            {val === true ? (
                              <div className="mx-auto w-6 h-6 rounded-md bg-success/15 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 text-success" />
                              </div>
                            ) : val === "partial" ? (
                              <div className="mx-auto w-6 h-6 rounded-md bg-warning/15 flex items-center justify-center" title="Acesso parcial (apenas atribuídos)">
                                <Circle className="w-3 h-3 text-warning fill-warning/40" />
                              </div>
                            ) : (
                              <div className="mx-auto w-6 h-6 rounded-md bg-muted flex items-center justify-center">
                                <X className="w-3 h-3 text-muted-foreground/40" />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-success/15 inline-flex items-center justify-center"><Check className="w-2.5 h-2.5 text-success" /></span> Acesso total</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-warning/15 inline-flex items-center justify-center"><Circle className="w-2.5 h-2.5 text-warning" /></span> Acesso parcial (apenas atribuídos)</span>
              <span className="flex items-center gap-1.5"><span className="w-4 h-4 rounded bg-muted inline-flex items-center justify-center"><X className="w-2.5 h-2.5 text-muted-foreground/40" /></span> Sem acesso</span>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT MEMBRO ─────────────────────────────────────────── */}
      {isModalOpen && (
        <MembroModal
          membro={editingMembro}
          equipes={equipes}
          onClose={() => setIsModalOpen(false)}
          onSave={(membro) => {
            if (editingMembro) {
              setMembros(prev => prev.map(m => m.id === membro.id ? membro : m));
              toast({ title: "Membro atualizado!" });
            } else {
              setMembros(prev => [...prev, { ...membro, id: Date.now(), criadoEm: new Date().toISOString(), status: "ativo" }]);
              toast({ title: "Membro adicionado à equipe!" });
            }
            setIsModalOpen(false);
          }}
        />
      )}

      {/* ── MODAL: ADD EQUIPE ────────────────────────────────────────────────── */}
      {isEquipeModalOpen && (
        <EquipeModal
          onClose={() => setIsEquipeModalOpen(false)}
          onSave={(equipe) => {
            setEquipes(prev => [...prev, { ...equipe, id: Date.now() }]);
            toast({ title: "Equipe criada!" });
            setIsEquipeModalOpen(false);
          }}
        />
      )}
    </AppLayout>
  );
}

// ─── Membro Modal ─────────────────────────────────────────────────────────────

function MembroModal({ membro, equipes, onClose, onSave }: {
  membro: Membro | null;
  equipes: Equipe[];
  onClose: () => void;
  onSave: (m: any) => void;
}) {
  const [form, setForm] = useState({
    nome: membro?.nome || "",
    email: membro?.email || "",
    telefone: membro?.telefone || "",
    role: (membro?.role || "advogado") as Role,
    equipeId: membro?.equipe?.id || "",
    senha: "",
  });

  const set = (k: string, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const roleConfig = ROLE_CONFIG[form.role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("vigora_token");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      const body = JSON.stringify({ ...form, equipeId: form.equipeId || null });

      if (membro) {
        await fetch(`/api/equipe/membros/${membro.id}`, { method: "PUT", headers, body });
      } else {
        await fetch("/api/equipe/membros", { method: "POST", headers, body });
      }
    } catch { /* fallback to local state */ }

    const equipe = equipes.find(e => e.id === Number(form.equipeId));
    onSave({ ...membro, ...form, equipe, equipeId: form.equipeId || null });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            {membro ? "Editar Membro" : "Adicionar Membro"}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Nome Completo *</label>
            <input value={form.nome} onChange={e => set("nome", e.target.value)} required
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground"
              placeholder="Dr. João da Silva" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Email *</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} required type="email"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                placeholder="joao@escritorio.adv.br" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Telefone</label>
              <input value={form.telefone} onChange={e => set("telefone", e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                placeholder="(11) 99999-0000" />
            </div>
          </div>

          {!membro && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Senha Provisória</label>
              <input value={form.senha} onChange={e => set("senha", e.target.value)} type="password"
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
                placeholder="vigora@2024" />
              <p className="text-xs text-muted-foreground mt-1">O membro poderá alterar após o primeiro acesso.</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Cargo / Função *</label>
            <select value={form.role} onChange={e => set("role", e.target.value as Role)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
              {Object.entries(ROLE_CONFIG).map(([r, cfg]) => (
                <option key={r} value={r}>{cfg.label}</option>
              ))}
            </select>
            <p className={`text-xs mt-1.5 font-medium ${roleConfig.color}`}>{roleConfig.desc}</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Equipe</label>
            <select value={form.equipeId} onChange={e => set("equipeId", e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
              <option value="">Sem equipe</option>
              {equipes.map(eq => <option key={eq.id} value={eq.id}>{eq.nome}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 transition-all">
              {membro ? "Salvar Alterações" : "Adicionar à Equipe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Equipe Modal ─────────────────────────────────────────────────────────────

const PRESET_CORES = ["#4f46e5", "#0ea5e9", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];

function EquipeModal({ onClose, onSave }: { onClose: () => void; onSave: (e: any) => void }) {
  const [form, setForm] = useState({ nome: "", descricao: "", cor: "#4f46e5" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("vigora_token");
      await fetch("/api/equipe/times", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch { /* fallback */ }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
          <h2 className="text-lg font-bold font-display flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Nova Equipe
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Nome da Equipe *</label>
            <input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
              placeholder="ex: Trabalhista, Cível, Tributário..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} rows={2}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground resize-none"
              placeholder="Área de atuação da equipe..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Cor Identificadora</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_CORES.map(cor => (
                <button key={cor} type="button" onClick={() => setForm(p => ({ ...p, cor }))}
                  className={`w-7 h-7 rounded-lg transition-all ${form.cor === cor ? "ring-2 ring-offset-2 ring-foreground/30 scale-110" : "opacity-70 hover:opacity-100"}`}
                  style={{ backgroundColor: cor }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2 border-t border-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 transition-all">Criar Equipe</button>
          </div>
        </form>
      </div>
    </div>
  );
}
