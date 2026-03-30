import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetDashboardStats } from "@/lib/api-client";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Briefcase, Calendar, AlertTriangle, CheckCircle, CheckSquare,
  Clock, ChevronRight, ShieldAlert, ArrowUpRight, TrendingUp, Zap,
  Activity, Plus, RefreshCw, Filter, ArrowUpDown, User, X
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { MOCK_DASHBOARD_STATS, MOCK_MONTHLY_ACTIVITY, MOCK_RECENT_ACTIVITY, MOCK_COMPROMISSOS } from "@/lib/mock-data";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: statsRaw, isLoading } = useGetDashboardStats();

  const stats = statsRaw?.processosAtivos !== undefined ? statsRaw : MOCK_DASHBOARD_STATS;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const nomeUsuario = user?.nome?.split(' ')[0] || 'Doutor(a)';

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-5 animate-pulse">
          <div className="h-10 bg-muted rounded-xl w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-2xl" />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-72 bg-muted rounded-2xl" />
            <div className="h-72 bg-muted rounded-2xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const proximosPrazos = (stats as any).proximosPrazos || MOCK_DASHBOARD_STATS.proximosPrazos;
  const alertasCriticos = (stats as any).alertasCriticos || MOCK_DASHBOARD_STATS.alertasCriticos;

  return (
    <AppLayout>
      <div className="space-y-5 pb-10">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {saudacao}, {nomeUsuario}! 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5 capitalize">
              {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            Sistema operacional
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Processos Ativos"
            value={(stats as any).processosAtivos ?? 8}
            sub="+2 este mês"
            icon={Briefcase}
            iconColor="text-primary"
            iconBg="bg-primary/15"
            trend="up"
          />
          <MetricCard
            title="Prazos na Semana"
            value={(stats as any).prazosSemana ?? 4}
            sub="2 urgentes"
            icon={Calendar}
            iconColor="text-warning"
            iconBg="bg-warning/15"
            trend="neutral"
          />
          <MetricCard
            title="Vencem Hoje"
            value={(stats as any).prazosHoje ?? 1}
            sub={(stats as any).prazosHoje > 0 ? "Atenção!" : "Tudo limpo"}
            icon={Clock}
            iconColor={(stats as any).prazosHoje > 0 ? "text-destructive" : "text-success"}
            iconBg={(stats as any).prazosHoje > 0 ? "bg-destructive/15" : "bg-success/15"}
            trend={(stats as any).prazosHoje > 0 ? "down" : "up"}
            isAlert={(stats as any).prazosHoje > 0}
          />
          <TaxaCumprimentoCard value={(stats as any).taxaCumprimento ?? 87} />
        </div>

        {/* Compromissos — acima de tudo */}
        <CompromissosSection />

        {/* Middle Row: Chart + Radar de Prazos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Bar Chart */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold font-display text-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Atividade de Prazos
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Prazos registrados vs. concluídos por mês</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm gradient-blue" />Registrados</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-success/70" />Concluídos</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MOCK_MONTHLY_ACTIVITY} barSize={10} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                  }}
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)' }}
                />
                <Bar dataKey="prazos" name="Registrados" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="concluidos" name="Concluídos" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Alertas Críticos */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-destructive/5">
              <h3 className="text-sm font-bold font-display flex items-center gap-2 text-destructive">
                <ShieldAlert className="w-4 h-4" /> Alertas Críticos
              </h3>
              <Link href="/alertas">
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Ver todos
                </span>
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {alertasCriticos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8">
                  <CheckCircle className="w-10 h-10 text-success/50 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum alerta crítico</p>
                </div>
              ) : (
                alertasCriticos.map((alerta: any) => (
                  <div key={alerta.id} className="flex gap-2.5 bg-muted/60 p-3 rounded-xl border-l-2 border-destructive">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-foreground leading-relaxed line-clamp-2">{alerta.mensagem}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(alerta.criadoEm), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Prazos Table + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Radar de Prazos */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold font-display flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Radar de Prazos
              </h3>
              <Link href="/prazos">
                <span className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer">
                  Ver todos <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo / Processo</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vencimento</th>
                    <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {proximosPrazos.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-10 text-center text-muted-foreground text-sm">
                        <CheckCircle className="w-8 h-8 text-success/50 mx-auto mb-2" />
                        Nenhum prazo próximo
                      </td>
                    </tr>
                  ) : (
                    proximosPrazos.slice(0, 6).map((prazo: any) => {
                      const dias = differenceInDays(new Date(prazo.dataLimite), new Date());
                      const isVencido = dias < 0;
                      const isHoje = dias === 0;
                      const isUrgente = dias > 0 && dias <= 2;
                      return (
                        <tr key={prazo.id} className={`table-row-hover ${isVencido ? 'bg-destructive/5' : isHoje ? 'bg-warning/5' : ''}`}>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-foreground text-sm">{prazo.tipo}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {prazo.processo?.numeroProcesso || 'Sem processo'}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-sm font-bold ${isVencido ? 'text-destructive' : isHoje ? 'text-warning' : isUrgente ? 'text-warning' : 'text-foreground'}`}>
                              {isHoje ? 'HOJE' : isVencido ? 'VENCIDO' : format(new Date(prazo.dataLimite), "dd/MM/yyyy")}
                            </span>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {isVencido ? `${Math.abs(dias)}d atraso` : isHoje ? 'Vence hoje' : `${dias} dias`}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={prazo.status} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold font-display flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" /> Atividade Recente
              </h3>
            </div>
            <div className="flex-1 p-4 space-y-1">
              {MOCK_RECENT_ACTIVITY.map((item, idx) => (
                <div key={item.id} className="flex gap-3 py-2.5 border-b border-border/50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{item.acao}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{item.detalhe}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{item.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-bold text-foreground text-lg leading-none">{(stats as any).processosAtivos ?? 8}</p>
                    <p className="text-[10px] mt-0.5">processos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground text-lg leading-none">{(stats as any).taxaCumprimento ?? 87}%</p>
                    <p className="text-[10px] mt-0.5">cumprimento</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-destructive text-lg leading-none">{(stats as any).prazosVencidos ?? 2}</p>
                    <p className="text-[10px] mt-0.5">vencidos</p>
                  </div>
                </div>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}

// ─── Compromissos Section ────────────────────────────────────────────────────

function CompromissosSection() {
  const [filterTipo, setFilterTipo] = useState("");
  const [filterResp, setFilterResp] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showModal, setShowModal] = useState(false);
  const [compromissos, setCompromissos] = useState(MOCK_COMPROMISSOS);
  const [refreshKey, setRefreshKey] = useState(0);

  const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    prazo:      { label: "Prazo",       color: "text-destructive", bg: "bg-destructive/15" },
    tarefa:     { label: "Tarefa",      color: "text-primary",     bg: "bg-primary/15" },
    compromisso:{ label: "Compromisso", color: "text-warning",     bg: "bg-warning/15" },
  };

  const responsaveis = [...new Set(MOCK_COMPROMISSOS.map(c => c.responsavel))];

  const filtered = compromissos
    .filter(c => !filterTipo || c.tipo === filterTipo)
    .filter(c => !filterResp || c.responsavel === filterResp)
    .sort((a, b) => {
      const diff = new Date(a.data).getTime() - new Date(b.data).getTime();
      return sortOrder === "asc" ? diff : -diff;
    });

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Calendar className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-sm font-bold font-display text-foreground">Compromissos</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full font-semibold">{filtered.length}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by type */}
          <select
            value={filterTipo}
            onChange={e => setFilterTipo(e.target.value)}
            className="bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-foreground appearance-none"
          >
            <option value="">Tipo (Todos)</option>
            <option value="prazo">Prazo</option>
            <option value="tarefa">Tarefa</option>
            <option value="compromisso">Compromisso</option>
          </select>

          {/* Filter by responsável */}
          <select
            value={filterResp}
            onChange={e => setFilterResp(e.target.value)}
            className="bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary text-foreground appearance-none max-w-[140px]"
          >
            <option value="">Responsável (Todos)</option>
            {responsaveis.map(r => <option key={r} value={r}>{r.split(' ').slice(0, 2).join(' ')}</option>)}
          </select>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(p => p === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <ArrowUpDown className="w-3 h-3" />
            {sortOrder === "asc" ? "Mais próximos" : "Mais distantes"}
          </button>

          {/* Refresh */}
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="p-1.5 bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Atualizar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* New */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 primary-glow"
            style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
          >
            <Plus className="w-3.5 h-3.5" /> Novo compromisso
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum compromisso neste filtro</p>
          </div>
        ) : (
          filtered.map(c => {
            const dias = differenceInDays(new Date(c.data), new Date());
            const cfg = TIPO_CONFIG[c.tipo] || TIPO_CONFIG.compromisso;
            return (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group">
                {/* Type badge */}
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                  {cfg.label}
                </span>

                {/* Title + process */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{c.titulo}</p>
                  {c.processo && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                      <Briefcase className="w-2.5 h-2.5 inline mr-1" />
                      {c.processo.numeroProcesso}
                    </p>
                  )}
                </div>

                {/* Responsável */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <div className="w-5 h-5 rounded-md bg-primary/15 text-primary text-[9px] font-bold flex items-center justify-center">
                    {c.responsavel.charAt(0)}
                  </div>
                  <span className="text-xs text-muted-foreground max-w-[100px] truncate">{c.responsavel.split(' ').slice(0, 2).join(' ')}</span>
                </div>

                {/* Date */}
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${dias < 0 ? "text-destructive" : dias === 0 ? "text-warning" : dias <= 2 ? "text-warning" : "text-foreground"}`}>
                    {dias === 0 ? "HOJE" : dias < 0 ? `${Math.abs(dias)}d atraso` : `${dias}d`}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(c.data), "dd/MM", { locale: ptBR })}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Compromisso Modal */}
      {showModal && (
        <NovoCompromissoModal
          onClose={() => setShowModal(false)}
          onSave={(item) => {
            setCompromissos(prev => [...prev, { ...item, id: Date.now(), processo: null }]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function NovoCompromissoModal({ onClose, onSave }: { onClose: () => void; onSave: (item: any) => void }) {
  const [form, setForm] = useState({ titulo: "", tipo: "compromisso", responsavel: "", data: "", status: "pendente" });
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
          <h2 className="text-base font-bold font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Novo Compromisso
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Título *</label>
            <input value={form.titulo} onChange={e => set("titulo", e.target.value)} required
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
              placeholder="Ex: Audiência de instrução..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Tipo</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground">
                <option value="compromisso">Compromisso</option>
                <option value="prazo">Prazo</option>
                <option value="tarefa">Tarefa</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Data *</label>
              <input type="date" value={form.data} onChange={e => set("data", e.target.value)}
                className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Responsável</label>
            <input value={form.responsavel} onChange={e => set("responsavel", e.target.value)}
              className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
              placeholder="Nome do responsável..." />
          </div>
          <div className="flex gap-3 pt-2 border-t border-border">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button
              onClick={() => form.titulo && form.data && onSave({ ...form, data: new Date(form.data).toISOString() })}
              className="flex-1 py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, sub, icon: Icon, iconColor, iconBg, trend, isAlert }: any) {
  return (
    <div className={`metric-card ${isAlert ? 'border-destructive/40 glow-destructive' : ''}`}>
      <div className="flex items-start justify-between">
        <div className={`${iconBg} ${iconColor} p-2.5 rounded-xl`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend === "up" && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-success">
            <ArrowUpRight className="w-3 h-3" />
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-bold font-display ${isAlert ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{title}</p>
        <p className={`text-[11px] font-medium mt-1 ${isAlert ? 'text-destructive' : 'text-muted-foreground/60'}`}>{sub}</p>
      </div>
    </div>
  );
}

function TaxaCumprimentoCard({ value }: { value: number }) {
  const color = value >= 80 ? 'text-success' : value >= 60 ? 'text-warning' : 'text-destructive';
  const barColor = value >= 80 ? 'bg-success' : value >= 60 ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="metric-card">
      <div className="flex items-start justify-between">
        <div className="bg-success/15 text-success p-2.5 rounded-xl">
          <CheckSquare className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">últimos 30d</span>
      </div>
      <div>
        <p className={`text-3xl font-bold font-display ${color}`}>{value}%</p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">Taxa de Cumprimento</p>
        <div className="w-full bg-muted rounded-full h-1.5 mt-3">
          <div
            className={`${barColor} h-full rounded-full transition-all duration-700`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}
