import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Users, Plus, Search, X, Filter, Download, ChevronRight,
  Phone, Mail, Building, User, FileText, MoreHorizontal
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ORIGENS = ["Site orgânico", "Indicação", "Google Ads", "Facebook", "LinkedIn", "OAB", "Evento", "Outro"];

const MOCK_CONTATOS = [
  { id: 1, nome: "Roberto Almeida", tipo: "PF", cpfCnpj: "234.567.890-12", email: "roberto@gmail.com", telefone: "(11) 99876-5432", origem: "Indicação", profissao: "Engenheiro", estadoCivil: "Casado", nascimento: "1978-05-14", rg: "32.456.789-5", observacoes: "Cliente frequente. Previdenciário.", criadoEm: "2023-05-20" },
  { id: 2, nome: "Petrobras S/A", tipo: "PJ", cpfCnpj: "33.000.167/0001-01", email: "juridico@petrobras.com.br", telefone: "(21) 3224-4477", origem: "Indicação", razaoSocial: "Petróleo Brasileiro S/A", cnae: "0600-0/01", representante: "Dr. Maurício Torres", observacoes: "Grande conta. Trabalhista.", criadoEm: "2023-03-15" },
  { id: 3, nome: "Ana Mendonça", tipo: "PF", cpfCnpj: "345.678.901-23", email: "ana.mendonca@outlook.com", telefone: "(31) 98765-4321", origem: "Google Ads", profissao: "Médica", estadoCivil: "Divorciada", nascimento: "1985-11-03", rg: "M-4567891", observacoes: "Divórcio litigioso.", criadoEm: "2023-08-12" },
  { id: 4, nome: "TechBrasil Inovações S/A", tipo: "PJ", cpfCnpj: "45.678.901/0001-23", email: "legal@techbrasil.com.br", telefone: "(11) 3456-9900", origem: "LinkedIn", razaoSocial: "TechBrasil Inovações S/A", cnae: "6201-5/01", representante: "Fernanda Souza", observacoes: "Tributário — PIS/COFINS.", criadoEm: "2024-01-10" },
  { id: 5, nome: "Maria Clara Ferreira", tipo: "PF", cpfCnpj: "567.890.123-45", email: "m.ferreira@email.com", telefone: "(41) 97654-3210", origem: "Site orgânico", profissao: "Professora", estadoCivil: "Solteira", nascimento: "1992-07-22", rg: "9.876.543-2", observacoes: "Trabalhista — dispensa injusta.", criadoEm: "2024-02-28" },
  { id: 6, nome: "Construções Vega Ltda", tipo: "PJ", cpfCnpj: "12.345.678/0001-90", email: "adm@vegaconstrucoes.com.br", telefone: "(21) 3456-7890", origem: "Evento", razaoSocial: "Construções Vega Ltda ME", cnae: "4120-4/00", representante: "José Vega", observacoes: "Ambiental e cível.", criadoEm: "2023-07-08" },
];

const ORIGEM_CHART = ORIGENS.slice(0, 6).map((o, i) => ({ name: o, value: [22, 18, 14, 11, 8, 6][i] }));
const TIPO_CHART = [{ name: "Pessoa Física", value: 58 }, { name: "Pessoa Jurídica", value: 42 }];
const CHART_COLORS = ["#2A34D4", "#6670F0", "#F59E0B", "#22C55E", "#EF4444", "#8B5CF6"];

export default function ContatosPage() {
  const [contatos, setContatos] = useState(MOCK_CONTATOS);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterOrigem, setFilterOrigem] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [formTipo, setFormTipo] = useState<"PF" | "PJ">("PF");
  const [form, setForm] = useState<any>({ nome: "", cpfCnpj: "", email: "", telefone: "", origem: "Indicação", observacoes: "", profissao: "", estadoCivil: "", nascimento: "", rg: "", razaoSocial: "", cnae: "", representante: "" });

  const filtered = contatos.filter(c => {
    if (filterTipo && c.tipo !== filterTipo) return false;
    if (filterOrigem && c.origem !== filterOrigem) return false;
    if (search && !c.nome.toLowerCase().includes(search.toLowerCase()) && !c.cpfCnpj.includes(search) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addContato = () => {
    if (!form.nome || !form.cpfCnpj) return;
    setContatos(p => [...p, { ...form, id: Date.now(), tipo: formTipo, criadoEm: new Date().toISOString().split("T")[0] }]);
    setForm({ nome: "", cpfCnpj: "", email: "", telefone: "", origem: "Indicação", observacoes: "", profissao: "", estadoCivil: "", nascimento: "", rg: "", razaoSocial: "", cnae: "", representante: "" });
    setShowModal(false);
  };

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Contatos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">{contatos.length} contatos cadastrados</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
              <Download className="w-3.5 h-3.5" /> Exportar
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
              <Plus className="w-4 h-4" /> Novo contato
            </button>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 glass-panel rounded-2xl p-4">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Origem dos contatos</p>
            <div className="text-muted-foreground">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={ORIGEM_CHART} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "currentColor" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--foreground)" }} />
                  <Bar dataKey="value" fill="url(#grad)" radius={[6, 6, 0, 0]}>
                    <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2A34D4" /><stop offset="100%" stopColor="#6670F0" /></linearGradient></defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">PF vs PJ</p>
            <PieChart width={120} height={120}>
              <Pie data={TIPO_CHART} cx={55} cy={55} innerRadius={30} outerRadius={50} dataKey="value" paddingAngle={3}>
                {TIPO_CHART.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
            </PieChart>
            <div className="flex gap-4 mt-2">
              {TIPO_CHART.map((t, i) => (
                <div key={t.name} className="flex items-center gap-1.5 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CHART_COLORS[i] }} />
                  <span className="text-muted-foreground">{t.name.split(" ")[1]}</span>
                  <span className="font-bold text-foreground">{t.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome, CPF/CNPJ ou email..."
              className="w-full bg-muted border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary text-foreground" />
          </div>
          <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
            <option value="">Tipo (Todos)</option>
            <option value="PF">Pessoa Física</option>
            <option value="PJ">Pessoa Jurídica</option>
          </select>
          <select value={filterOrigem} onChange={e => setFilterOrigem(e.target.value)} className="bg-muted border border-border rounded-xl px-3 py-2 text-sm focus:outline-none text-foreground appearance-none">
            <option value="">Origem (Todas)</option>
            {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">CPF / CNPJ</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contato</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Origem</th>
                  <th className="px-5 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors cursor-pointer group" onClick={() => setSelected(c)}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${c.tipo === "PJ" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>
                          {c.tipo === "PJ" ? <Building className="w-4 h-4" /> : c.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{c.nome}</p>
                          {c.tipo === "PJ" && c.representante && <p className="text-[10px] text-muted-foreground">Rep: {c.representante}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.tipo === "PJ" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>{c.tipo}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-mono hidden sm:table-cell">{c.cpfCnpj}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-foreground">{c.email}</p>
                      <p className="text-[10px] text-muted-foreground">{c.telefone}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c.origem}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold ${selected.tipo === "PJ" ? "bg-primary/20 text-primary" : "bg-success/20 text-success"}`}>
                  {selected.tipo === "PJ" ? <Building className="w-6 h-6" /> : selected.nome.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display font-bold text-foreground">{selected.nome}</h2>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.tipo === "PJ" ? "bg-primary/15 text-primary" : "bg-success/15 text-success"}`}>{selected.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="CPF / CNPJ" value={selected.cpfCnpj} />
              <InfoItem label="Email" value={selected.email} />
              <InfoItem label="Telefone" value={selected.telefone} />
              <InfoItem label="Origem" value={selected.origem} />
              {selected.tipo === "PF" && <>
                <InfoItem label="RG" value={selected.rg || "—"} />
                <InfoItem label="Nascimento" value={selected.nascimento || "—"} />
                <InfoItem label="Estado Civil" value={selected.estadoCivil || "—"} />
                <InfoItem label="Profissão" value={selected.profissao || "—"} />
              </>}
              {selected.tipo === "PJ" && <>
                <InfoItem label="Razão Social" value={selected.razaoSocial || "—"} />
                <InfoItem label="CNAE" value={selected.cnae || "—"} />
                <InfoItem label="Representante" value={selected.representante || "—"} />
              </>}
              {selected.observacoes && <div className="col-span-2"><InfoItem label="Observações" value={selected.observacoes} /></div>}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
              <h2 className="font-display font-bold text-foreground">Novo Contato</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="flex gap-1 bg-muted rounded-xl p-1 mb-4">
              {(["PF", "PJ"] as const).map(t => (
                <button key={t} onClick={() => setFormTipo(t)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formTipo === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {t === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
            <div className="space-y-3">
              <FormGrid>
                <FField label="Nome *"><input value={form.nome} onChange={e => setForm((p: any) => ({ ...p, nome: e.target.value }))} className="input-base" placeholder="Nome completo" /></FField>
                <FField label={formTipo === "PF" ? "CPF *" : "CNPJ *"}><input value={form.cpfCnpj} onChange={e => setForm((p: any) => ({ ...p, cpfCnpj: e.target.value }))} className="input-base" placeholder={formTipo === "PF" ? "000.000.000-00" : "00.000.000/0001-00"} /></FField>
                <FField label="Email"><input type="email" value={form.email} onChange={e => setForm((p: any) => ({ ...p, email: e.target.value }))} className="input-base" placeholder="email@..." /></FField>
                <FField label="Telefone"><input value={form.telefone} onChange={e => setForm((p: any) => ({ ...p, telefone: e.target.value }))} className="input-base" placeholder="(00) 00000-0000" /></FField>
                <FField label="Origem">
                  <select value={form.origem} onChange={e => setForm((p: any) => ({ ...p, origem: e.target.value }))} className="input-base appearance-none">
                    {ORIGENS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </FField>
                {formTipo === "PF" && <>
                  <FField label="RG"><input value={form.rg} onChange={e => setForm((p: any) => ({ ...p, rg: e.target.value }))} className="input-base" placeholder="RG" /></FField>
                  <FField label="Nascimento"><input type="date" value={form.nascimento} onChange={e => setForm((p: any) => ({ ...p, nascimento: e.target.value }))} className="input-base" /></FField>
                  <FField label="Estado Civil">
                    <select value={form.estadoCivil} onChange={e => setForm((p: any) => ({ ...p, estadoCivil: e.target.value }))} className="input-base appearance-none">
                      {["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"].map(s => <option key={s}>{s}</option>)}
                    </select>
                  </FField>
                  <FField label="Profissão"><input value={form.profissao} onChange={e => setForm((p: any) => ({ ...p, profissao: e.target.value }))} className="input-base" placeholder="Ex: Engenheiro" /></FField>
                </>}
                {formTipo === "PJ" && <>
                  <FField label="Razão Social"><input value={form.razaoSocial} onChange={e => setForm((p: any) => ({ ...p, razaoSocial: e.target.value }))} className="input-base" placeholder="Razão social" /></FField>
                  <FField label="CNAE"><input value={form.cnae} onChange={e => setForm((p: any) => ({ ...p, cnae: e.target.value }))} className="input-base" placeholder="0000-0/00" /></FField>
                  <FField label="Representante legal"><input value={form.representante} onChange={e => setForm((p: any) => ({ ...p, representante: e.target.value }))} className="input-base" placeholder="Nome do representante" /></FField>
                </>}
              </FormGrid>
              <FField label="Observações">
                <textarea value={form.observacoes} onChange={e => setForm((p: any) => ({ ...p, observacoes: e.target.value }))} rows={2} className="input-base resize-none" placeholder="Observações..." />
              </FField>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={addContato} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-foreground bg-muted/50 rounded-lg px-2.5 py-2 border border-border">{value}</p>
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}
