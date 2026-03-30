import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListPrazos, ListPrazosPeriodo } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Calendar, Plus, Clock, AlertTriangle, Briefcase, CheckCircle, Star, X, Users } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";
import { MOCK_PRAZOS, MOCK_PROCESSOS } from "@/lib/mock-data";
import { useFavorites } from "@/lib/favorites";

// ─── Types ─────────────────────────────────────────────────────────────────────

const TIPOS_PRAZO = [
  "Recurso", "Contestação", "Audiência", "Protocolo", "Prazo Processual",
  "Manifestação", "Impugnação", "Réplica", "Memorial", "Perícia", "Outros",
];

const PRIORIDADES = ["Alta", "Média", "Baixa"];

const RESPONSAVEIS_LIST = ["Dr. Carlos Mendes", "Dra. Ana Lima", "Dra. Juliana Costa", "Dr. Ricardo Alves", "Pedro Souza"];

// ─── NovoPrazoModal ────────────────────────────────────────────────────────────

function NovoPrazoModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const { isFavorite } = useFavorites("processos");

  const [form, setForm] = useState({
    processoId: "",
    tipo: "",
    descricao: "",
    responsavel: "",
    prioridade: "Alta",
    dataLimite: "",
    hora: "",
    status: "pendente",
    observacoes: "",
  });

  const [favoritosOnly, setFavoritosOnly] = useState(false);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const processosFiltrados = favoritosOnly
    ? MOCK_PROCESSOS.filter(p => isFavorite(p.id))
    : MOCK_PROCESSOS;

  const handleSave = () => {
    if (!form.tipo || !form.dataLimite) return;
    const processo = MOCK_PROCESSOS.find(p => String(p.id) === form.processoId) || null;
    onSave({ ...form, processo, id: Date.now(), dataLimite: new Date(form.dataLimite).toISOString() });
  };

  const INPUT = "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";
  const LABEL = "text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-2xl rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border shrink-0">
          <h2 className="text-base font-bold font-display flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" /> Adicionar Prazo
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Processo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={LABEL} style={{ marginBottom: 0 }}>Processo Vinculado</label>
              <button
                onClick={() => setFavoritosOnly(p => !p)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition-all border ${favoritosOnly ? "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 border-yellow-300 dark:border-yellow-500/40" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
              >
                <Star className={`w-3 h-3 ${favoritosOnly ? "fill-yellow-500 text-yellow-500" : ""}`} />
                Somente favoritos
              </button>
            </div>
            <select value={form.processoId} onChange={e => set("processoId", e.target.value)} className={INPUT + " appearance-none"}>
              <option value="">— Selecione um processo —</option>
              {processosFiltrados.map((p: any) => (
                <option key={p.id} value={String(p.id)}>
                  {p.numeroProcesso}{p.cliente?.nome ? ` — ${p.cliente.nome}` : ""}
                </option>
              ))}
            </select>
            {processosFiltrados.length === 0 && (
              <p className="text-xs text-warning mt-1">Nenhum processo favorito encontrado. Desative o filtro ou marque um processo como favorito.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tipo */}
            <div>
              <label className={LABEL}>Tipo do Prazo *</label>
              <select value={form.tipo} onChange={e => set("tipo", e.target.value)} className={INPUT + " appearance-none"} required>
                <option value="">Selecione...</option>
                {TIPOS_PRAZO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Prioridade */}
            <div>
              <label className={LABEL}>Prioridade</label>
              <select value={form.prioridade} onChange={e => set("prioridade", e.target.value)} className={INPUT + " appearance-none"}>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className={LABEL}>Descrição</label>
            <input value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Descreva o prazo..." className={INPUT} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Responsável */}
            <div>
              <label className={LABEL}>Responsável</label>
              <select value={form.responsavel} onChange={e => set("responsavel", e.target.value)} className={INPUT + " appearance-none"}>
                <option value="">Selecione...</option>
                {RESPONSAVEIS_LIST.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* Status */}
            <div>
              <label className={LABEL}>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={INPUT + " appearance-none"}>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em andamento</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Data limite */}
            <div>
              <label className={LABEL}>Data Limite *</label>
              <input type="date" value={form.dataLimite} onChange={e => set("dataLimite", e.target.value)} className={INPUT} required />
            </div>
            {/* Hora */}
            <div>
              <label className={LABEL}>Hora</label>
              <input type="time" value={form.hora} onChange={e => set("hora", e.target.value)} className={INPUT} />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={LABEL}>Observações</label>
            <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={3}
              placeholder="Informações adicionais sobre o prazo..."
              className={INPUT + " resize-none"} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 transition-all">
            Adicionar Prazo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PrazoCard ─────────────────────────────────────────────────────────────────

function PrazoCard({ prazo, type }: { prazo: any; type: "vencido" | "hoje" | "urgente" | "normal" }) {
  const dias = differenceInDays(new Date(prazo.dataLimite), new Date());
  const borderMap = { vencido: "border-t-destructive", hoje: "border-t-warning", urgente: "border-t-warning", normal: "border-t-primary/40" };
  const timeMap = {
    vencido: { text: `Atrasado ${Math.abs(dias)}d`, color: "text-destructive bg-destructive/15" },
    hoje:    { text: "HOJE",                         color: "text-warning bg-warning/15" },
    urgente: { text: `${dias} dias`,                 color: "text-warning bg-warning/15" },
    normal:  { text: prazo.status === "concluido" ? "Concluído" : `${dias} dias`, color: prazo.status === "concluido" ? "text-success bg-success/15" : "text-muted-foreground bg-muted" },
  };
  const { text: timeText, color: timeColor } = timeMap[type];

  return (
    <div className={`glass-panel p-5 rounded-xl border-t-4 ${borderMap[type]} transition-all hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex justify-between items-start mb-3">
        <StatusBadge status={prazo.status} />
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${timeColor}`}>{timeText}</span>
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1 leading-snug">{prazo.tipo.replace(/_/g, " ")}</h3>
      {prazo.descricao && <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{prazo.descricao}</p>}
      <div className="mt-3 space-y-1.5 text-xs bg-muted/50 p-3 rounded-lg border border-border">
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
          {prazo.processo ? (
            <Link href={`/processos/${prazo.processo.id}`}>
              <span className="font-semibold text-foreground hover:text-primary cursor-pointer truncate block">
                {prazo.processo.numeroProcesso}
              </span>
            </Link>
          ) : (
            <span className="text-muted-foreground">Prazo Avulso</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className={`w-3.5 h-3.5 shrink-0 ${type === "vencido" ? "text-destructive" : type === "hoje" ? "text-warning" : "text-primary"}`} />
          {format(new Date(prazo.dataLimite), "dd 'de' MMMM, yyyy", { locale: ptBR })}
        </div>
      </div>
      {prazo.status !== "concluido" && (
        <button className="mt-3 w-full bg-muted hover:bg-success/10 hover:text-success text-muted-foreground py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-border hover:border-success/30">
          <CheckCircle className="w-3.5 h-3.5" /> Concluir
        </button>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PrazosList() {
  const [periodo,          setPeriodo]          = useState<ListPrazosPeriodo>("todos");
  const [showPrazoModal,   setShowPrazoModal]   = useState(false);
  const [favoritosOnly,    setFavoritosOnly]    = useState(false);
  const [extraPrazos,      setExtraPrazos]      = useState<any[]>([]);

  const { isFavorite } = useFavorites("processos");
  const { data: prazosApi, isLoading } = useListPrazos({ periodo });

  const baseAll = [...((prazosApi && prazosApi.length > 0) ? prazosApi : MOCK_PRAZOS), ...extraPrazos];

  // Apply favorites filter — only show prazos attached to favorite processos
  const allPrazos = favoritosOnly
    ? baseAll.filter((p: any) => p.processo && isFavorite(p.processo.id))
    : baseAll;

  const vencidos = allPrazos.filter((p: any) => differenceInDays(new Date(p.dataLimite), new Date()) < 0 && p.status !== "concluido");
  const hoje     = allPrazos.filter((p: any) => differenceInDays(new Date(p.dataLimite), new Date()) === 0 && p.status !== "concluido");

  const tabs = [
    { id: "todos"     as const, label: "Todos" },
    { id: "vencidos"  as const, label: "Vencidos",    count: vencidos.length, danger: true },
    { id: "hoje"      as const, label: "Vencem Hoje", count: hoje.length },
    { id: "proximos3" as const, label: "Próx. 3 Dias" },
    { id: "proximos7" as const, label: "Próx. 7 Dias" },
  ];

  const prazos = periodo === "todos" ? allPrazos : allPrazos.filter((p: any) => {
    const diff = differenceInDays(new Date(p.dataLimite), new Date());
    if (periodo === "vencidos")  return diff < 0 && p.status !== "concluido";
    if (periodo === "hoje")      return diff === 0 && p.status !== "concluido";
    if (periodo === "proximos3") return diff >= 0 && diff <= 3 && p.status !== "concluido";
    if (periodo === "proximos7") return diff >= 0 && diff <= 7 && p.status !== "concluido";
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-5 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Controle de Prazos</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Acompanhe vencimentos, audiências e publicações. Nunca perca um prazo.</p>
          </div>
          <button
            onClick={() => setShowPrazoModal(true)}
            className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90 shrink-0"
          >
            <Plus className="w-4 h-4" /> Adicionar Prazo
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",         value: allPrazos.length,                                                     color: "text-foreground",    bg: "bg-muted" },
            { label: "Vencidos",      value: vencidos.length,                                                      color: "text-destructive",   bg: "bg-destructive/15", alert: vencidos.length > 0 },
            { label: "Vencem Hoje",   value: hoje.length,                                                          color: "text-warning",       bg: "bg-warning/15",     alert: hoje.length > 0 },
            { label: "Concluídos",    value: allPrazos.filter((p: any) => p.status === "concluido").length,        color: "text-success",       bg: "bg-success/15" },
          ].map(stat => (
            <div key={stat.label} className={`glass-panel rounded-xl px-4 py-3 ${stat.alert ? 'border-destructive/30' : ''}`}>
              <p className={`text-2xl font-bold font-display ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Favoritos toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="glass-panel rounded-xl p-1.5 flex gap-1 overflow-x-auto no-scrollbar flex-1">
            {tabs.map((tab) => {
              const isActive = periodo === tab.id;
              return (
                <button key={tab.id} onClick={() => setPeriodo(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? tab.danger ? "bg-destructive/20 text-destructive" : "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  {tab.danger && <AlertTriangle className="w-3.5 h-3.5" />}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${tab.danger ? 'bg-destructive text-white' : 'bg-primary text-white'}`}>{tab.count}</span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Somente favoritos */}
          <button
            onClick={() => setFavoritosOnly(p => !p)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all border shrink-0 ${
              favoritosOnly
                ? "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/40"
                : "bg-muted border-border text-muted-foreground hover:text-foreground glass-panel"
            }`}
          >
            <Star className={`w-4 h-4 ${favoritosOnly ? "fill-yellow-500 text-yellow-500" : ""}`} />
            Somente favoritos
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />)}
          </div>
        ) : prazos.length === 0 ? (
          <div className="glass-panel rounded-xl p-14 flex flex-col items-center justify-center text-center border-2 border-dashed border-border">
            <div className="bg-success/10 p-4 rounded-full mb-4"><CheckCircle className="w-10 h-10 text-success" /></div>
            <p className="text-lg font-display font-bold text-foreground">Agenda Limpa</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Nenhum prazo neste filtro.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(periodo === "todos" || periodo === "vencidos") && vencidos.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-1 bg-destructive rounded-full" />
                  <h2 className="text-sm font-bold font-display text-destructive">Prazos Vencidos ({vencidos.length})</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {vencidos.map((prazo: any) => <PrazoCard key={prazo.id} prazo={prazo} type="vencido" />)}
                </div>
              </div>
            )}
            {(periodo === "todos" || periodo === "hoje") && hoje.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-4 w-1 bg-warning rounded-full" />
                  <h2 className="text-sm font-bold font-display text-warning">Vencem Hoje ({hoje.length})</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {hoje.map((prazo: any) => <PrazoCard key={prazo.id} prazo={prazo} type="hoje" />)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {prazos.filter((p: any) => {
                const diff = differenceInDays(new Date(p.dataLimite), new Date());
                if (periodo === "todos") return p.status === "concluido" || diff > 0;
                if (periodo === "vencidos" || periodo === "hoje") return false;
                return true;
              }).map((prazo: any) => {
                const diff = differenceInDays(new Date(prazo.dataLimite), new Date());
                const isUrgente = diff > 0 && diff <= 2 && prazo.status !== "concluido";
                return <PrazoCard key={prazo.id} prazo={prazo} type={isUrgente ? "urgente" : "normal"} />;
              })}
            </div>
          </div>
        )}
      </div>

      {showPrazoModal && (
        <NovoPrazoModal
          onClose={() => setShowPrazoModal(false)}
          onSave={(data) => { setExtraPrazos(p => [...p, data]); setShowPrazoModal(false); }}
        />
      )}
    </AppLayout>
  );
}
