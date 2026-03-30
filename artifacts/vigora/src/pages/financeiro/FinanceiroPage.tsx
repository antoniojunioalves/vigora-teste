import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  DollarSign, TrendingUp, TrendingDown, AlertCircle, Plus, X,
  ArrowLeftRight, Download, Calendar, Paperclip, ChevronDown,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ─── Types & config ───────────────────────────────────────────────────────────

type TxType = "receita" | "despesa" | "transferencia";

const TYPE_CONFIG: Record<TxType, { label: string; color: string; bg: string; icon: React.ElementType; sign: string }> = {
  receita:       { label: "Receita",       color: "text-success",     bg: "bg-success/15",     icon: TrendingUp,    sign: "+" },
  despesa:       { label: "Despesa",       color: "text-destructive", bg: "bg-destructive/15", icon: TrendingDown,  sign: "-" },
  transferencia: { label: "Transferência", color: "text-primary",     bg: "bg-primary/15",     icon: ArrowLeftRight,sign: "" },
};

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_TX = [
  { id: 1, tipo: "receita" as TxType, descricao: "Honorários — Petrobras",         valor: 25000, categoria: "Honorários",  data: "2024-03-01", status: "pago" },
  { id: 2, tipo: "receita" as TxType, descricao: "Honorários — TechBrasil",        valor: 8500,  categoria: "Honorários",  data: "2024-03-05", status: "pago" },
  { id: 3, tipo: "despesa" as TxType, descricao: "Aluguel escritório",             valor: 6800,  categoria: "Aluguel",     data: "2024-03-10", status: "pago" },
  { id: 4, tipo: "despesa" as TxType, descricao: "Salários equipe",                valor: 22000, categoria: "Salários",    data: "2024-03-05", status: "pago" },
  { id: 5, tipo: "receita" as TxType, descricao: "Honorários — Família Mendonça",  valor: 4200,  categoria: "Honorários",  data: "2024-03-15", status: "pendente" },
  { id: 6, tipo: "despesa" as TxType, descricao: "Software e licenças",            valor: 890,   categoria: "Tecnologia",  data: "2024-03-01", status: "pago" },
  { id: 7, tipo: "receita" as TxType, descricao: "Consultoria tributária",         valor: 3500,  categoria: "Consultoria", data: "2024-03-20", status: "atrasado" },
  { id: 8, tipo: "transferencia" as TxType, descricao: "Transferência conta poupança", valor: 10000, categoria: "Interno", data: "2024-03-12", status: "pago" },
];

const MONTHLY_DATA = [
  { mes: "Set", receitas: 28000, despesas: 22000 },
  { mes: "Out", receitas: 31000, despesas: 24000 },
  { mes: "Nov", receitas: 27000, despesas: 23000 },
  { mes: "Dez", receitas: 35000, despesas: 26000 },
  { mes: "Jan", receitas: 29000, despesas: 25000 },
  { mes: "Fev", receitas: 33000, despesas: 27000 },
  { mes: "Mar", receitas: 41200, despesas: 29690 },
];

// ─── Form defaults ────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  tipo: "receita" as TxType,
  contaCartao: "CONTA PRINCIPAL",
  centroCusto: "GERAL",
  categoria: "",
  pessoa: "",
  processo: "",
  descricao: "",
  valor: "",
  vencimento: "",
  competencia: "",
  pagamento: "",
  apenasRegistroInterno: false,
  repetir: "" as "" | "recorrente" | "parcelado",
  gerarCobranca: false,
  status: "pendente",
  data: "",
  // transferência
  saiuDaConta: "Conta de débito",
  entrouNaConta: "",
};

// ─── Shared input class ───────────────────────────────────────────────────────

const INP = "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";

const CATEGORIAS_RECEITA = ["Honorários", "Consultoria", "Custas reembolsadas", "Êxito", "Assessoria", "Outro"];
const CATEGORIAS_DESPESA  = ["Salários", "Aluguel", "Tecnologia", "Custas judiciais", "Marketing", "Outro"];
const CONTAS  = ["CONTA PRINCIPAL", "CONTA POUPANÇA", "CARTÃO CORPORATIVO", "CAIXA"];
const CENTROS = ["GERAL", "TRABALHISTA", "TRIBUTÁRIO", "CÍVEL", "ADMINISTRATIVO"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SummaryCard({ label, value, change, positive, icon: Icon, gradient, alert }: any) {
  return (
    <div className={`glass-panel rounded-2xl p-4 ${alert ? "border border-destructive/20" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${gradient ? "" : positive ? "bg-success/15" : "bg-destructive/15"}`}
          style={gradient ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
        >
          <Icon className={`w-4 h-4 ${gradient ? "text-white" : positive && !alert ? "text-success" : "text-destructive"}`} />
        </div>
        <span className={`text-[10px] font-bold ${positive && !alert ? "text-success" : "text-destructive"}`}>{change}</span>
      </div>
      <p className={`text-xl font-display font-bold ${gradient ? "text-foreground" : positive && !alert ? "text-success" : "text-destructive"}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

// ─── Novo Lançamento modal ────────────────────────────────────────────────────

function NovoLancamentoModal({ form, setForm, onClose, onSave }: {
  form: any; setForm: (fn: (p: any) => any) => void; onClose: () => void; onSave: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));
  const isFullForm = form.tipo === "receita" || form.tipo === "despesa";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <h2 className="font-display font-bold text-foreground">Novo lançamento</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Tipo */}
          <FRow label="Tipo *">
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              {(["receita", "despesa", "transferencia"] as TxType[]).map(t => (
                <button
                  key={t}
                  onClick={() => set("tipo", t)}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-all ${form.tipo === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {TYPE_CONFIG[t].label.toUpperCase()}
                </button>
              ))}
            </div>
          </FRow>

          {isFullForm ? (
            <>
              {/* Conta/cartão */}
              <FRow label="Conta / Cartão *">
                <div className="relative">
                  <select value={form.contaCartao} onChange={e => set("contaCartao", e.target.value)} className={INP + " appearance-none pr-9"}>
                    {CONTAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Centro de custo */}
              <FRow label="Centro de custo *">
                <div className="relative">
                  <select value={form.centroCusto} onChange={e => set("centroCusto", e.target.value)} className={INP + " appearance-none pr-9"}>
                    {CENTROS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Categoria */}
              <FRow label="Categoria *">
                <div className="relative">
                  <select value={form.categoria} onChange={e => set("categoria", e.target.value)} className={INP + " appearance-none pr-9"}>
                    <option value="">Selecione a categoria</option>
                    {(form.tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA).map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Pessoa */}
              <FRow label="Pessoa">
                <div className="relative">
                  <select value={form.pessoa} onChange={e => set("pessoa", e.target.value)} className={INP + " appearance-none pr-9"}>
                    <option value="">Selecione uma pessoa</option>
                    <option>Roberto Almeida</option>
                    <option>Petrobras S/A</option>
                    <option>Ana Mendonça</option>
                    <option>TechBrasil Inovações</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Processo */}
              <FRow label="Processo">
                <div className="relative">
                  <select value={form.processo} onChange={e => set("processo", e.target.value)} className={INP + " appearance-none pr-9"}>
                    <option value="">Selecione um processo</option>
                    <option>0001234-56.2023.8.26.0100</option>
                    <option>0007890-12.2024.5.02.0001</option>
                    <option>0002345-67.2023.4.02.5001</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Descrição */}
              <FRow label="Descrição">
                <input value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Identificação da cobrança" className={INP} />
              </FRow>

              {/* Valor */}
              <FRow label="Valor *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">$</span>
                  <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="999,99" className={INP + " pl-8"} />
                </div>
              </FRow>

              {/* Vencimento */}
              <FRow label="Vencimento *">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="date" value={form.vencimento} onChange={e => set("vencimento", e.target.value)} className={INP + " pl-10"} />
                </div>
              </FRow>

              {/* Competência */}
              <FRow label="Competência *">
                <input
                  value={form.competencia}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2, 6);
                    set("competencia", v);
                  }}
                  placeholder="MM/AAAA"
                  maxLength={7}
                  className={INP}
                />
              </FRow>

              {/* Pagamento */}
              <FRow label="Pagamento">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="date" value={form.pagamento} onChange={e => set("pagamento", e.target.value)} className={INP + " pl-10"} />
                </div>
              </FRow>

              {/* Apenas registro interno */}
              <label className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.apenasRegistroInterno}
                  onChange={e => set("apenasRegistroInterno", e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                Apenas registro interno
              </label>

              {/* Repetir lançamento */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Repetir lançamento</p>
                <div className="flex gap-2">
                  {(["recorrente", "parcelado"] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => set("repetir", form.repetir === opt ? "" : opt)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                        form.repetir === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gerar cobrança */}
              <label className={`flex items-center gap-2.5 text-sm cursor-pointer select-none ${form.repetir ? "text-foreground" : "text-muted-foreground/50"}`}>
                <input
                  type="checkbox"
                  disabled={!form.repetir}
                  checked={form.gerarCobranca}
                  onChange={e => set("gerarCobranca", e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary disabled:opacity-40"
                />
                Gerar cobrança no boleto ou cartão
              </label>

              {/* Anexar arquivo */}
              <div>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Paperclip className="w-4 h-4" /> Anexar arquivo
                </button>
                {files.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {files.map((f, i) => (
                      <span key={i} className="text-[11px] bg-muted border border-border rounded-lg px-2.5 py-1 text-muted-foreground flex items-center gap-1.5">
                        <Paperclip className="w-3 h-3" /> {f.name}
                        <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Transferência form */
            <>
              {/* Saiu da conta */}
              <FRow label="Saiu da conta *">
                <div className="relative">
                  <select value={form.saiuDaConta} onChange={e => set("saiuDaConta", e.target.value)} className={INP + " appearance-none pr-9"}>
                    {CONTAS.map(c => <option key={c}>{c}</option>)}
                    <option>Conta de débito</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Entrou na conta */}
              <FRow label="Entrou na conta *">
                <div className="relative">
                  <select value={form.entrouNaConta} onChange={e => set("entrouNaConta", e.target.value)} className={INP + " appearance-none pr-9"}>
                    <option value=""></option>
                    {CONTAS.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </FRow>

              {/* Descrição */}
              <FRow label="Descrição">
                <input value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Identificação da cobrança" className={INP} />
              </FRow>

              {/* Valor */}
              <FRow label="Valor *">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">$</span>
                  <input type="number" value={form.valor} onChange={e => set("valor", e.target.value)} placeholder="999,99" className={INP + " pl-8"} />
                </div>
              </FRow>

              {/* Data */}
              <FRow label="Data *">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="date" value={form.data} onChange={e => set("data", e.target.value)} className={INP + " pl-10"} />
                </div>
              </FRow>

              {/* Pagamento */}
              <FRow label="Pagamento">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input type="date" value={form.pagamento} onChange={e => set("pagamento", e.target.value)} className={INP + " pl-10"} />
                </div>
              </FRow>

              {/* Gerar cobrança */}
              <label className="flex items-center gap-2.5 text-sm text-muted-foreground/50 cursor-not-allowed select-none">
                <input type="checkbox" disabled className="w-4 h-4 rounded border-border accent-primary opacity-40" />
                Gerar cobrança no boleto ou cartão
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">
            Cancelar
          </button>
          <button onClick={onSave} className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
            Salvar dados
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  const [transactions, setTransactions] = useState(MOCK_TX);
  const [activeTab, setActiveTab] = useState<"todos" | TxType>("todos");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const totalReceitas = transactions.filter(t => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transactions.filter(t => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  const totalAtrasado = transactions.filter(t => t.status === "atrasado").reduce((s, t) => s + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;
  const filtered = activeTab === "todos" ? transactions : transactions.filter(t => t.tipo === activeTab);

  const addTx = () => {
    if (!form.valor) return;
    const data = form.tipo === "receita" ? (form.vencimento || new Date().toISOString().split("T")[0]) : form.data;
    setTransactions(p => [...p, { ...form, id: Date.now(), valor: Number(form.valor), data, categoria: form.categoria || "Honorários" }]);
    setForm(EMPTY_FORM);
    setShowModal(false);
  };

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">
        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-primary" /> Financeiro
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Controle de receitas, despesas e saldo do escritório</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
              <Plus className="w-4 h-4" /> Novo lançamento
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard label="Saldo atual"    value={fmt(saldo)}          change={saldo >= 0 ? "+" : ""}      positive={saldo >= 0} icon={DollarSign}   gradient />
          <SummaryCard label="Receitas (mês)" value={fmt(totalReceitas)}  change="+12%"                        positive              icon={TrendingUp}   />
          <SummaryCard label="Despesas (mês)" value={fmt(totalDespesas)}  change="-5%"                         positive={false}      icon={TrendingDown} />
          <SummaryCard label="Em atraso"      value={fmt(totalAtrasado)}  change={`${transactions.filter(t => t.status === "atrasado").length} item(s)`} positive={false} icon={AlertCircle} alert />
        </div>

        {/* Chart */}
        <div className="glass-panel rounded-2xl p-5">
          <p className="text-sm font-bold text-foreground mb-4">Receitas vs Despesas (últimos 7 meses)</p>
          <div className="text-muted-foreground">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={MONTHLY_DATA} barGap={4} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} formatter={(v: any) => fmt(v)} />
                <Bar dataKey="receitas" fill="#22C55E" radius={[6, 6, 0, 0]} name="Receitas" />
                <Bar dataKey="despesas" fill="#EF4444" radius={[6, 6, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            {[{ color: "#22C55E", label: "Receitas" }, { color: "#EF4444", label: "Despesas" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs + list */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex gap-1 flex-wrap">
            {([["todos", "Todos"], ["receita", "Receitas"], ["despesa", "Despesas"], ["transferencia", "Transferências"]] as const).map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === id ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                style={activeTab === id ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}>
                {label}
              </button>
            ))}
          </div>
          <div className="divide-y divide-border">
            {filtered.map(t => {
              const cfg = TYPE_CONFIG[t.tipo];
              const TxIcon = cfg.icon;
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                    <TxIcon className={`w-4 h-4 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{t.descricao}</p>
                    <p className="text-[10px] text-muted-foreground">{t.categoria} • {t.data}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${t.tipo === "receita" ? "text-success" : t.tipo === "despesa" ? "text-destructive" : "text-primary"}`}>
                      {cfg.sign}{fmt(t.valor)}
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${t.status === "pago" ? "bg-success/15 text-success" : t.status === "pendente" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                      {t.status === "pago" ? "Pago" : t.status === "pendente" ? "Pendente" : "Atrasado"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <NovoLancamentoModal
          form={form}
          setForm={setForm}
          onClose={() => { setShowModal(false); setForm(EMPTY_FORM); }}
          onSave={addTx}
        />
      )}
    </AppLayout>
  );
}
