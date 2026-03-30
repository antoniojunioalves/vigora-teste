import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  ChevronDown, ChevronUp, Plus, Search, Filter, ArrowUpDown,
  Download, RefreshCw, ChevronFirst, ChevronLeft, ChevronRight, ChevronLast
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistroRede {
  id: number;
  partes: string;
  tipoAcao: string;
  numeroProcesso: string;
  parceiro: string;
  data: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const FASES = [
  { fase: "Marketing",        value: 0 },
  { fase: "Negociação",       value: 1 },
  { fase: "Consultoria",      value: 0 },
  { fase: "Administrativo",   value: 1 },
  { fase: "Judicial",         value: 2 },
  { fase: "Recursal",         value: 1 },
  { fase: "Execução/cobrança",value: 0 },
];

const MOCK_REDE: RegistroRede[] = [
  { id: 1, partes: "Petrobras S/A × União Federal", tipoAcao: "Judicial", numeroProcesso: "0001234-56.2023.8.26.0100", parceiro: "Contabilidade Souza & Filhos", data: "15/03/2024" },
  { id: 2, partes: "Roberto Almeida × INSS", tipoAcao: "Administrativo", numeroProcesso: "0007890-12.2024.5.02.0001", parceiro: "Peritos Associados BR", data: "20/02/2024" },
  { id: 3, partes: "TechBrasil Inovações × Receita Federal", tipoAcao: "Recursal", numeroProcesso: "0002345-67.2023.4.02.5001", parceiro: "Contabilidade Souza & Filhos", data: "10/01/2024" },
];

const REGISTROS_POR_PAGINA_OPTS = [10, 25, 50, 100];

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  count,
  processos,
}: {
  label: string;
  count: number;
  processos: { numero: string; partes: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [showList, setShowList] = useState(false);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground font-medium leading-snug">{label}</p>
          <button
            onClick={() => setOpen(o => !o)}
            className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-4xl font-display font-bold text-foreground mt-3">{count}</p>
        <button
          onClick={() => setShowList(s => !s)}
          className="text-primary text-xs font-semibold mt-3 hover:underline"
        >
          {showList ? "Ocultar processos" : "Mostrar processos"}
        </button>
      </div>

      {showList && processos.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {processos.map(p => (
            <div key={p.numero} className="px-5 py-3">
              <p className="text-xs font-mono text-muted-foreground">{p.numero}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">{p.partes}</p>
            </div>
          ))}
        </div>
      )}
      {showList && processos.length === 0 && (
        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
          Nenhum processo encontrado.
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ParceirosPage() {
  const [redeOpen, setRedeOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [registros] = useState<RegistroRede[]>(MOCK_REDE);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(50);

  // Filtered records
  const filtrados = registros.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.partes.toLowerCase().includes(q) ||
      r.parceiro.toLowerCase().includes(q) ||
      r.numeroProcesso.includes(q) ||
      r.tipoAcao.toLowerCase().includes(q)
    );
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPagina));
  const inicio = (pagina - 1) * porPagina;
  const fim = Math.min(inicio + porPagina, filtrados.length);
  const visiveis = filtrados.slice(inicio, fim);

  // Summary data
  const processosAtivos = MOCK_REDE.length;
  const demandasEscritorio = MOCK_REDE.filter(r => r.tipoAcao === "Judicial" || r.tipoAcao === "Recursal").length;
  const demandasParceiro = MOCK_REDE.filter(r => r.tipoAcao === "Administrativo").length;

  const processosForCard = MOCK_REDE.map(r => ({ numero: r.numeroProcesso, partes: r.partes }));

  return (
    <AppLayout>
      <div className="space-y-5 pb-8">

        {/* ── 3 summary cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            label="Processos compartilhados (ativos)"
            count={processosAtivos}
            processos={processosForCard}
          />
          <SummaryCard
            label="Demanda pendente pelo escritório"
            count={demandasEscritorio}
            processos={processosForCard.slice(0, demandasEscritorio)}
          />
          <SummaryCard
            label="Demanda pendente pelo parceiro"
            count={demandasParceiro}
            processos={processosForCard.slice(0, demandasParceiro)}
          />
        </div>

        {/* ── Chart: Processos compartilhados por fase ── */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Processos compartilhados</p>
            <button className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-muted-foreground">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={FASES} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                <XAxis
                  dataKey="fase"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  domain={[0, "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "var(--foreground)",
                  }}
                  cursor={{ fill: "currentColor", opacity: 0.08 }}
                />
                <Bar dataKey="value" name="Processos" radius={[4, 4, 0, 0]} fill="#6670F0" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Rede section ── */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {/* Section header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <button
              onClick={() => setRedeOpen(o => !o)}
              className="flex items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
            >
              Rede
              {redeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {redeOpen && (
            <>
              {/* Toolbar */}
              <div className="px-5 py-3.5 border-b border-border flex flex-wrap items-center gap-2">
                <button
                  className="flex items-center gap-1.5 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all"
                  style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
                >
                  <Plus className="w-4 h-4" /> Novo parceiro
                </button>

                <div className="flex items-center gap-1.5 ml-1">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPagina(1); }}
                      placeholder="Buscar"
                      className="bg-muted border border-border rounded-lg py-2 pl-8 pr-3 text-sm focus:outline-none focus:border-primary text-foreground w-40"
                    />
                  </div>

                  <ToolbarBtn icon={<Filter className="w-3.5 h-3.5" />} label="Filtrar" />
                  <ToolbarBtn icon={<ArrowUpDown className="w-3.5 h-3.5" />} label="Ordenar" />
                  <ToolbarBtn icon={<Download className="w-3.5 h-3.5" />} label="Exportar" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-5 py-3 text-left">
                        <button className="flex items-center gap-1 text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                          PARTES <ChevronUp className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">TIPO DE AÇÃO</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">NÚMERO DO PROCESSO</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">PARCEIRO</th>
                      <th className="px-5 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">DATA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visiveis.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                          Não encontramos nenhum registro.
                        </td>
                      </tr>
                    ) : visiveis.map(r => (
                      <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-foreground text-sm">{r.partes}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-xs font-medium bg-muted px-2.5 py-1 rounded-lg text-muted-foreground">
                            {r.tipoAcao}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{r.numeroProcesso}</td>
                        <td className="px-5 py-3.5 text-sm text-foreground">{r.parceiro}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3.5 border-t border-border flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Registros por página</span>
                  <select
                    value={porPagina}
                    onChange={e => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                    className="bg-muted border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary text-foreground appearance-none"
                  >
                    {REGISTROS_POR_PAGINA_OPTS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>
                    {filtrados.length === 0 ? "0-0 de 0" : `${inicio + 1}-${fim} de ${filtrados.length}`}
                  </span>
                  <div className="flex items-center gap-1">
                    <PagBtn onClick={() => setPagina(1)} disabled={pagina === 1}>
                      <ChevronFirst className="w-4 h-4" />
                    </PagBtn>
                    <PagBtn onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1}>
                      <ChevronLeft className="w-4 h-4" />
                    </PagBtn>
                    <PagBtn onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas}>
                      <ChevronRight className="w-4 h-4" />
                    </PagBtn>
                    <PagBtn onClick={() => setPagina(totalPaginas)} disabled={pagina === totalPaginas}>
                      <ChevronLast className="w-4 h-4" />
                    </PagBtn>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function ToolbarBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
      {icon} {label}
    </button>
  );
}

function PagBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors ${disabled ? "text-muted-foreground/30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}
