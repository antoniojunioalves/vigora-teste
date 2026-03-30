import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BarChart2, Download, TrendingUp, CheckSquare, Users, Calendar, Clock, AlertTriangle, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PRODUTIVIDADE = [
  { mes: "Set/23", tarefas: 42, concluidas: 38, prazos: 15, cumpriu: 15 },
  { mes: "Out/23", tarefas: 55, concluidas: 49, prazos: 18, cumpriu: 17 },
  { mes: "Nov/23", tarefas: 38, concluidas: 35, prazos: 12, cumpriu: 12 },
  { mes: "Dez/23", tarefas: 47, concluidas: 40, prazos: 16, cumpriu: 14 },
  { mes: "Jan/24", tarefas: 61, concluidas: 55, prazos: 21, cumpriu: 20 },
  { mes: "Fev/24", tarefas: 53, concluidas: 48, prazos: 19, cumpriu: 18 },
  { mes: "Mar/24", tarefas: 35, concluidas: 28, prazos: 11, cumpriu: 9 },
];

const AREA_PROCESSOS = [
  { area: "Trabalhista", value: 35, color: "#2A34D4" },
  { area: "Tributário",  value: 22, color: "#6670F0" },
  { area: "Cível",       value: 18, color: "#22C55E" },
  { area: "Família",     value: 12, color: "#F59E0B" },
  { area: "Criminal",    value: 8,  color: "#EF4444" },
  { area: "Outros",      value: 5,  color: "#8B5CF6" },
];

const STATUS_TAREFAS = [
  { name: "Concluídas em dia",    value: 54, fill: "#22C55E" },
  { name: "Concluídas em atraso", value: 13, fill: "#F59E0B" },
  { name: "Pendentes",            value: 11, fill: "#6670F0" },
];

const PROCESSOS_STATUS = [
  { name: "Ativo",         value: 8,  fill: "#22C55E" },
  { name: "Atenção",       value: 3,  fill: "#F59E0B" },
  { name: "Prazo vencido", value: 2,  fill: "#EF4444" },
  { name: "Concluído",     value: 5,  fill: "#8B5CF6" },
];

const CLIENTES_NOVOS = [
  { mes: "Set", novos: 3, processos: 2 },
  { mes: "Out", novos: 5, processos: 4 },
  { mes: "Nov", novos: 2, processos: 1 },
  { mes: "Dez", novos: 4, processos: 3 },
  { mes: "Jan", novos: 6, processos: 5 },
  { mes: "Fev", novos: 3, processos: 3 },
  { mes: "Mar", novos: 2, processos: 2 },
];

const PRAZOS_PERIODO = [
  { mes: "Set", cumpridos: 14, vencidos: 1, total: 15 },
  { mes: "Out", cumpridos: 16, vencidos: 2, total: 18 },
  { mes: "Nov", cumpridos: 11, vencidos: 1, total: 12 },
  { mes: "Dez", cumpridos: 13, vencidos: 3, total: 16 },
  { mes: "Jan", cumpridos: 19, vencidos: 2, total: 21 },
  { mes: "Fev", cumpridos: 16, vencidos: 3, total: 19 },
  { mes: "Mar", cumpridos: 8,  vencidos: 3, total: 11 },
];

const RESPONSAVEIS = ["Todos", "Dr. Carlos", "Dra. Ana", "Dra. Juliana", "Dr. Ricardo", "Pedro"];
const AREAS        = ["Todas", "Trabalhista", "Tributário", "Cível", "Família", "Criminal"];

type Periodo = "7d" | "30d" | "6m" | "12m";

// ─── Subcomponents ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, icon, color, bg, trend }: {
  label: string; value: string; sub: string; icon: string;
  color: string; bg: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="glass-panel rounded-2xl p-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center text-xl mb-3`}>{icon}</div>
      <p className={`text-2xl font-display font-bold ${color}`}>{value}</p>
      <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend === "up"   && <ArrowUpRight   className="w-3 h-3 text-success" />}
        {trend === "down" && <ArrowDownRight className="w-3 h-3 text-destructive" />}
        <p className="text-[10px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [periodo,    setPeriodo]    = useState<Periodo>("6m");
  const [responsavel, setResponsavel] = useState("Todos");
  const [area,       setArea]       = useState("Todas");

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-primary" /> Relatórios
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Análise de produtividade, prazos e desempenho do escritório</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Período */}
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {(["7d","30d","6m","12m"] as Periodo[]).map(p => (
                <button key={p} onClick={() => setPeriodo(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${periodo === p ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                  style={periodo === p ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}>
                  {p}
                </button>
              ))}
            </div>
            {/* Responsável filter */}
            <select value={responsavel} onChange={e => setResponsavel(e.target.value)}
              className="bg-muted border border-border text-sm text-foreground rounded-xl px-3 py-2 focus:outline-none focus:border-primary appearance-none">
              {RESPONSAVEIS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {/* Área filter */}
            <select value={area} onChange={e => setArea(e.target.value)}
              className="bg-muted border border-border text-sm text-foreground rounded-xl px-3 py-2 focus:outline-none focus:border-primary appearance-none">
              {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <button className="flex items-center gap-2 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" /> Exportar PDF
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard label="Processos ativos"      value="8"   sub="+2 este mês"        icon="⚖️" color="text-primary"     bg="bg-primary/15"     trend="up" />
          <KpiCard label="Taxa de cumprimento"   value="87%" sub="+3% vs. mês ant."   icon="✅" color="text-success"     bg="bg-success/15"     trend="up" />
          <KpiCard label="Prazos vencidos"       value="11"  sub="nos últimos 7 meses" icon="⚠️" color="text-destructive" bg="bg-destructive/15" trend="down" />
          <KpiCard label="Novos clientes"        value="25"  sub="últimos 7 meses"    icon="👤" color="text-warning"     bg="bg-warning/15"     trend="up" />
        </div>

        {/* Smart Task KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Tarefas concluídas em dia",    value: "54", sub: "87% do total concluído", icon: <CheckSquare className="w-4 h-4 text-success" />,      bg: "bg-success/10"     },
            { label: "Tarefas concluídas em atraso", value: "13", sub: "21% do total concluído", icon: <Clock       className="w-4 h-4 text-warning" />,       bg: "bg-warning/10"     },
            { label: "Tarefas pendentes",            value: "11", sub: "aguardando execução",     icon: <Calendar    className="w-4 h-4 text-primary" />,       bg: "bg-primary/10"     },
            { label: "Média de atraso",              value: "2.4d", sub: "por tarefa em atraso",  icon: <AlertTriangle className="w-4 h-4 text-destructive" />, bg: "bg-destructive/10" },
          ].map(k => (
            <div key={k.label} className="glass-panel rounded-2xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center shrink-0`}>{k.icon}</div>
              <div>
                <p className="text-xl font-display font-bold text-foreground">{k.value}</p>
                <p className="text-xs font-medium text-foreground mt-0.5 leading-tight">{k.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Produtividade mensal */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Produtividade Mensal — Tarefas</h3>
          </div>
          <div className="text-muted-foreground">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PRODUTIVIDADE} barGap={4} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
                <Bar dataKey="tarefas"    fill="#6670F0" radius={[4,4,0,0]} name="Tarefas totais" />
                <Bar dataKey="concluidas" fill="#22C55E" radius={[4,4,0,0]} name="Concluídas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            {[{ color:"#6670F0", label:"Tarefas totais" },{ color:"#22C55E", label:"Concluídas" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} /> {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Prazos por período */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Prazos por Período — Cumpridos vs. Vencidos</h3>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-success/70" />Cumpridos</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/70" />Vencidos</div>
            </div>
          </div>
          <div className="text-muted-foreground">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={PRAZOS_PERIODO} barGap={4} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
                <Bar dataKey="cumpridos" fill="#22C55E" radius={[4,4,0,0]} name="Cumpridos" />
                <Bar dataKey="vencidos"  fill="#EF4444" radius={[4,4,0,0]} name="Vencidos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Third row: 3 charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Processos por área */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Processos por Área</h3>
            <PieChart width={200} height={160} className="mx-auto">
              <Pie data={AREA_PROCESSOS} cx={95} cy={75} outerRadius={65} innerRadius={30} dataKey="value" paddingAngle={2}>
                {AREA_PROCESSOS.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11, color: "var(--foreground)" }} />
            </PieChart>
            <div className="mt-3 space-y-1.5">
              {AREA_PROCESSOS.map(a => (
                <div key={a.area} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: a.color }} />
                    <span className="text-muted-foreground">{a.area}</span>
                  </div>
                  <span className="font-bold text-foreground">{a.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status tarefas */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Status das Tarefas</h3>
            <PieChart width={200} height={160} className="mx-auto">
              <Pie data={STATUS_TAREFAS} cx={95} cy={75} outerRadius={65} innerRadius={30} dataKey="value" paddingAngle={3}>
                {STATUS_TAREFAS.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 11, color: "var(--foreground)" }} />
            </PieChart>
            <div className="mt-3 space-y-1.5">
              {STATUS_TAREFAS.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                    <span className="text-muted-foreground">{s.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Novos clientes + processos */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Novos Clientes / Processos por Mês</h3>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={CLIENTES_NOVOS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
                  <Line type="monotone" dataKey="novos"     stroke="#2A34D4" strokeWidth={2.5} dot={{ fill: "#2A34D4", r: 3 }}     name="Novos clientes" />
                  <Line type="monotone" dataKey="processos" stroke="#22C55E" strokeWidth={2.5} dot={{ fill: "#22C55E", r: 3 }} name="Novos processos" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {[{ color:"#2A34D4",label:"Clientes"},{ color:"#22C55E",label:"Processos"}].map(l=>(
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{backgroundColor:l.color}} />{l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Processos por status table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Processos por Status</h3>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              Total: <span className="font-bold text-foreground">{PROCESSOS_STATUS.reduce((a,b)=>a+b.value,0)}</span>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {PROCESSOS_STATUS.map(s => {
              const total = PROCESSOS_STATUS.reduce((a,b)=>a+b.value,0);
              const pct = Math.round((s.value / total) * 100);
              return (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="w-28 text-sm text-muted-foreground">{s.name}</div>
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.fill }} />
                  </div>
                  <div className="w-16 text-right">
                    <span className="font-bold text-sm text-foreground">{s.value}</span>
                    <span className="text-xs text-muted-foreground ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
