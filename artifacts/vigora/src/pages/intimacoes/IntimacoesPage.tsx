import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Bell, Search, Link, Plus, X, CheckCircle, Clock, AlertTriangle, Filter, RefreshCw } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendente:  { label: "Pendente",   color: "text-warning",     bg: "bg-warning/15",     icon: Clock },
  lida:      { label: "Lida",       color: "text-success",     bg: "bg-success/15",     icon: CheckCircle },
  urgente:   { label: "Urgente",    color: "text-destructive", bg: "bg-destructive/15", icon: AlertTriangle },
  respondida:{ label: "Respondida", color: "text-primary",     bg: "bg-primary/15",     icon: CheckCircle },
};

const MOCK_INTIMACOES = [
  { id: 1, titulo: "Intimação — Audiência de Instrução", processo: "0001234-56.2023.8.26.0100", tribunal: "TJSP", data: new Date(Date.now() + 2 * 86400000).toISOString(), status: "urgente", prazo: 2, descricao: "Fica V.Sa. intimado a comparecer à audiência de instrução e julgamento.", oab: "OAB/SP 123.456" },
  { id: 2, titulo: "Publicação — Despacho de Impulsionamento", processo: "0002345-67.2023.4.02.5001", tribunal: "TRF 2ª Região", data: new Date(Date.now() + 5 * 86400000).toISOString(), status: "pendente", prazo: 5, descricao: "Vista às partes para manifestação em 15 dias.", oab: "OAB/RJ 78.901" },
  { id: 3, titulo: "Intimação — Juntada de Documentos", processo: "0007890-12.2024.5.02.0001", tribunal: "TRT 2ª Região", data: new Date(Date.now() + 7 * 86400000).toISOString(), status: "pendente", prazo: 7, descricao: "Juntar documentação comprobatória no prazo de 10 dias.", oab: "OAB/SP 123.456" },
  { id: 4, titulo: "Citação — Ação de Cobrança", processo: "0005678-90.2022.8.26.0224", tribunal: "TJSP", data: new Date(Date.now() - 1 * 86400000).toISOString(), status: "lida", prazo: 0, descricao: "Citação para contestar em 15 dias corridos.", oab: "OAB/SP 123.456" },
  { id: 5, titulo: "Intimação — Sentença Prolatada", processo: "0009012-34.2024.8.19.0100", tribunal: "TJMG", data: new Date(Date.now() - 2 * 86400000).toISOString(), status: "respondida", prazo: 0, descricao: "Sentença de procedência parcial. Prazo recursal: 15 dias.", oab: "OAB/MG 45.678" },
  { id: 6, titulo: "Publicação — Despacho Saneador", processo: "0003456-78.2023.8.26.0100", tribunal: "TJSP", data: new Date(Date.now() + 3 * 86400000).toISOString(), status: "pendente", prazo: 3, descricao: "Saneamento do processo. Determina produção de prova pericial.", oab: "OAB/SP 123.456" },
];

const OAB_NUMBERS = ["OAB/SP 123.456", "OAB/RJ 78.901", "OAB/MG 45.678"];

export default function IntimacoesPage() {
  const [oabs, setOabs] = useState(OAB_NUMBERS);
  const [newOab, setNewOab] = useState("");
  const [intimacoes, setIntimacoes] = useState(MOCK_INTIMACOES);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTribunal, setFilterTribunal] = useState("");

  const filtered = intimacoes.filter(i => {
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterTribunal && i.tribunal !== filterTribunal) return false;
    if (search && !i.titulo.toLowerCase().includes(search.toLowerCase()) && !i.processo.includes(search)) return false;
    return true;
  });

  const tribunais = [...new Set(intimacoes.map(i => i.tribunal))];
  const counts = { urgente: intimacoes.filter(i => i.status === "urgente").length, pendente: intimacoes.filter(i => i.status === "pendente").length, lida: intimacoes.filter(i => i.status === "lida").length };

  const addOab = () => { if (newOab.trim() && !oabs.includes(newOab.trim())) { setOabs(p => [...p, newOab.trim()]); setNewOab(""); } };
  const markAs = (id: number, status: string) => setIntimacoes(p => p.map(i => i.id === id ? { ...i, status } : i));

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" /> Intimações
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Monitoramento de intimações e publicações judiciais</p>
          </div>
          <button className="flex items-center gap-2 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Sincronizar DJe
          </button>
        </div>

        {/* OAB config */}
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Link className="w-4 h-4 text-primary" /> Números OAB Vinculados
          </h3>
          <div className="flex gap-2 mb-3">
            <input value={newOab} onChange={e => setNewOab(e.target.value)} onKeyDown={e => e.key === "Enter" && addOab()} placeholder="Ex: OAB/SP 123.456" className="flex-1 bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground" />
            <button onClick={addOab} className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:opacity-90" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
              <Plus className="w-4 h-4" /> Vincular
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {oabs.map(oab => (
              <span key={oab} className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-xs font-bold group">
                {oab}
                <button onClick={() => setOabs(p => p.filter(o => o !== oab))} className="opacity-50 group-hover:opacity-100 hover:text-destructive transition-all">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Urgentes", count: counts.urgente, color: "text-destructive", bg: "bg-destructive/15", border: "border-destructive/20" },
            { label: "Pendentes", count: counts.pendente, color: "text-warning", bg: "bg-warning/15", border: "border-warning/20" },
            { label: "Lidas", count: counts.lida, color: "text-success", bg: "bg-success/15", border: "border-success/20" },
          ].map(s => (
            <div key={s.label} className={`glass-panel rounded-2xl p-4 border ${s.border}`}>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar intimação ou processo..." className="w-full bg-muted border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary text-foreground" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
            <option value="">Status (Todos)</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filterTribunal} onChange={e => setFilterTribunal(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
            <option value="">Tribunal (Todos)</option>
            {tribunais.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map(i => {
            const cfg = STATUS_CONFIG[i.status] || STATUS_CONFIG.pendente;
            const StatusIcon = cfg.icon;
            return (
              <div key={i.id} className={`glass-panel rounded-2xl p-4 border-l-4 ${i.status === "urgente" ? "border-l-destructive" : i.status === "pendente" ? "border-l-warning" : i.status === "respondida" ? "border-l-primary" : "border-l-success"}`}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-2.5 h-2.5" /> {cfg.label}
                      </span>
                      {i.prazo > 0 && <span className="text-[10px] font-bold bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{i.prazo}d para vencer</span>}
                      <span className="text-[10px] text-muted-foreground">{i.oab}</span>
                    </div>
                    <p className="font-semibold text-foreground text-sm">{i.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{i.processo} • {i.tribunal}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{i.descricao}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {i.status !== "lida" && i.status !== "respondida" && (
                      <button onClick={() => markAs(i.id, "lida")} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-success/15 text-success hover:bg-success/25 transition-colors">
                        Marcar lida
                      </button>
                    )}
                    {i.status === "pendente" && (
                      <button onClick={() => markAs(i.id, "respondida")} className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
                        Responder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
