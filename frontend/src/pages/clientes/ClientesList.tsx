import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListClientes } from "@/lib/api-client";
import { Users, Plus, Search, Mail, Phone, ExternalLink, Briefcase, X, ChevronRight, Building, User, MapPin, FileText, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MOCK_CLIENTES, MOCK_PROCESSOS } from "@/lib/mock-data";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PROCESSO_COUNTS: Record<number, number> = { 1: 3, 2: 2, 3: 2, 4: 1, 5: 1, 6: 1 };

const ESTADOS_BR = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

// ─── Shared ────────────────────────────────────────────────────────────────────

const INPUT = "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";
const LABEL = "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5";

// ─── AdicionarClienteModal ──────────────────────────────────────────────────────

function AdicionarClienteModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [tipo, setTipo] = useState<"pf" | "pj">("pf");
  const [form, setForm] = useState({
    nome: "", cpfCnpj: "", rg: "", dataNascimento: "",
    email: "", telefone: "", celular: "",
    cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "",
    profissao: "", estadoCivil: "",
    razaoSocial: "", nomeFantasia: "", inscricaoEstadual: "", inscricaoMunicipal: "", responsavelNome: "", responsavelCargo: "",
    observacoes: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.nome || (!form.cpfCnpj)) return;
    onSave({ ...form, tipo, id: Date.now(), criadoEm: new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-2xl rounded-2xl relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-border shrink-0">
          <h2 className="text-base font-bold font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Adicionar Cliente
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PF / PJ tabs */}
        <div className="px-6 pt-4 shrink-0">
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-fit">
            {[["pf","Pessoa Física"],["pj","Pessoa Jurídica"]].map(([v,l]) => (
              <button key={v} onClick={() => setTipo(v as "pf" | "pj")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tipo === v ? "text-white" : "text-muted-foreground hover:text-foreground"}`}
                style={tipo === v ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}>
                {v === "pf" ? <User className="w-3.5 h-3.5" /> : <Building className="w-3.5 h-3.5" />} {l}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {tipo === "pf" ? (
            <>
              {/* Dados pessoais */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Dados Pessoais</p>
                <div className="space-y-3">
                  <div>
                    <label className={LABEL}>Nome Completo *</label>
                    <input value={form.nome} onChange={e => set("nome", e.target.value)} placeholder="Nome completo do cliente" className={INPUT} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>CPF *</label>
                      <input value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} placeholder="000.000.000-00" className={INPUT + " font-mono"} />
                    </div>
                    <div>
                      <label className={LABEL}>RG</label>
                      <input value={form.rg} onChange={e => set("rg", e.target.value)} placeholder="00.000.000-0" className={INPUT + " font-mono"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Data de Nascimento</label>
                      <input type="date" value={form.dataNascimento} onChange={e => set("dataNascimento", e.target.value)} className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Estado Civil</label>
                      <select value={form.estadoCivil} onChange={e => set("estadoCivil", e.target.value)} className={INPUT + " appearance-none"}>
                        <option value="">Selecione...</option>
                        <option>Solteiro(a)</option><option>Casado(a)</option><option>Separado(a)</option>
                        <option>Divorciado(a)</option><option>Viúvo(a)</option><option>União Estável</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={LABEL}>Profissão</label>
                    <input value={form.profissao} onChange={e => set("profissao", e.target.value)} placeholder="Profissão do cliente" className={INPUT} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Dados empresariais */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Building className="w-3.5 h-3.5" /> Dados Empresariais</p>
                <div className="space-y-3">
                  <div>
                    <label className={LABEL}>Razão Social *</label>
                    <input value={form.razaoSocial} onChange={e => { set("razaoSocial", e.target.value); set("nome", e.target.value); }} placeholder="Razão social da empresa" className={INPUT} />
                  </div>
                  <div>
                    <label className={LABEL}>Nome Fantasia</label>
                    <input value={form.nomeFantasia} onChange={e => set("nomeFantasia", e.target.value)} placeholder="Nome fantasia" className={INPUT} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>CNPJ *</label>
                      <input value={form.cpfCnpj} onChange={e => set("cpfCnpj", e.target.value)} placeholder="00.000.000/0001-00" className={INPUT + " font-mono"} />
                    </div>
                    <div>
                      <label className={LABEL}>Insc. Estadual</label>
                      <input value={form.inscricaoEstadual} onChange={e => set("inscricaoEstadual", e.target.value)} placeholder="000.000.000.000" className={INPUT + " font-mono"} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL}>Responsável / Contato</label>
                      <input value={form.responsavelNome} onChange={e => set("responsavelNome", e.target.value)} placeholder="Nome do responsável" className={INPUT} />
                    </div>
                    <div>
                      <label className={LABEL}>Cargo</label>
                      <input value={form.responsavelCargo} onChange={e => set("responsavelCargo", e.target.value)} placeholder="Diretor, Sócio..." className={INPUT} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contato */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Contato</p>
            <div className="space-y-3">
              <div>
                <label className={LABEL}>E-mail</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@dominio.com" className={INPUT} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>Telefone Fixo</label>
                  <input value={form.telefone} onChange={e => set("telefone", e.target.value)} placeholder="(00) 0000-0000" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Celular / WhatsApp</label>
                  <input value={form.celular} onChange={e => set("celular", e.target.value)} placeholder="(00) 00000-0000" className={INPUT} />
                </div>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Endereço</p>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL}>CEP</label>
                  <input value={form.cep} onChange={e => set("cep", e.target.value)} placeholder="00000-000" className={INPUT + " font-mono"} />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Logradouro</label>
                  <input value={form.logradouro} onChange={e => set("logradouro", e.target.value)} placeholder="Rua, Av., Alameda..." className={INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL}>Número</label>
                  <input value={form.numero} onChange={e => set("numero", e.target.value)} placeholder="Nº" className={INPUT} />
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Complemento</label>
                  <input value={form.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, Sala, Conj..." className={INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={LABEL}>Bairro</label>
                  <input value={form.bairro} onChange={e => set("bairro", e.target.value)} placeholder="Bairro" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>Cidade</label>
                  <input value={form.cidade} onChange={e => set("cidade", e.target.value)} placeholder="Cidade" className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>UF</label>
                  <select value={form.estado} onChange={e => set("estado", e.target.value)} className={INPUT + " appearance-none"}>
                    <option value="">UF</option>
                    {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className={LABEL}>Observações</label>
            <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)} rows={3} placeholder="Notas sobre o cliente..." className={INPUT + " resize-none"} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 transition-all">
            Adicionar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ClienteDetalheDrawer ───────────────────────────────────────────────────────

function ClienteDetalheDrawer({ cliente, onClose }: { cliente: any; onClose: () => void }) {
  const isCnpj = (cliente.cpfCnpj || '').replace(/\D/g, '').length > 11;
  const clienteProcessos = MOCK_PROCESSOS.filter((p: any) => p.cliente?.id === cliente.id);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-card border-l border-border flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border shrink-0">
          <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center text-white font-bold text-lg">
            {cliente.nome.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold font-display text-foreground truncate">{cliente.nome}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{isCnpj ? "Pessoa Jurídica" : "Pessoa Física"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Documento */}
          <div className="glass-panel rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Dados</p>
            {cliente.cpfCnpj && (
              <div className="flex items-center gap-2.5 text-sm">
                <CreditCard className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="font-mono text-foreground">{cliente.cpfCnpj}</span>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                <a href={`mailto:${cliente.email}`} className="text-foreground hover:text-primary transition-colors truncate">{cliente.email}</a>
              </div>
            )}
            {cliente.telefone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-foreground">{cliente.telefone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Cadastrado em {format(new Date(cliente.criadoEm), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          </div>

          {/* Processos */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5" /> Processos ({clienteProcessos.length})
            </p>
            {clienteProcessos.length === 0 ? (
              <div className="glass-panel rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Nenhum processo vinculado.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clienteProcessos.map((p: any) => (
                  <div key={p.id} className="glass-panel rounded-xl p-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono font-semibold text-foreground truncate">{p.numeroProcesso}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{p.area} — {p.tribunal}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${p.status === "ativo" ? "bg-success/15 text-success" : p.status === "atencao" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {p.status === "ativo" ? "Ativo" : p.status === "atencao" ? "Atenção" : p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Observações */}
          {cliente.observacoes && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Observações</p>
              <div className="glass-panel rounded-xl p-4">
                <p className="text-sm text-foreground leading-relaxed">{cliente.observacoes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Fechar</button>
          <button className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" /> Novo Processo
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ClientesList() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const [extraClientes, setExtraClientes] = useState<any[]>([]);

  const { data: clientesApi, isLoading } = useListClientes();
  const base = (clientesApi && clientesApi.length > 0) ? clientesApi : MOCK_CLIENTES;
  const clientes = [...base, ...extraClientes];

  const filtered = search
    ? clientes.filter((c: any) =>
        c.nome.toLowerCase().includes(search.toLowerCase()) ||
        (c.cpfCnpj || '').includes(search) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : clientes;

  return (
    <AppLayout>
      <div className="space-y-5 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Carteira de Clientes</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Gerencie informações e contatos da sua carteira</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Adicionar Cliente
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total de Clientes", value: clientes.length, color: "text-primary", bg: "bg-primary/15" },
            { label: "Pessoas Físicas",   value: clientes.filter((c: any) => (c.cpfCnpj || '').replace(/\D/g,'').length <= 11).length, color: "text-success",  bg: "bg-success/15" },
            { label: "Pessoas Jurídicas", value: clientes.filter((c: any) => (c.cpfCnpj || '').replace(/\D/g,'').length > 11).length,  color: "text-warning", bg: "bg-warning/15" },
          ].map(stat => (
            <div key={stat.label} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <Users className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-xl font-bold font-display ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, CPF/CNPJ, email..."
                className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
            <p className="text-sm text-muted-foreground ml-auto">
              <span className="font-semibold text-foreground">{filtered.length}</span> clientes
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Documento</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contato</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Processos</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cadastro</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-muted shrink-0" /><div className="h-4 bg-muted rounded w-32" /></div></td>
                      <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-28" /></td>
                      <td className="px-5 py-4"><div className="h-3 bg-muted rounded w-36 mb-1.5" /><div className="h-3 bg-muted rounded w-24" /></td>
                      <td className="px-5 py-4"><div className="h-5 bg-muted rounded-full w-12" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-20" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-7 w-7 bg-muted rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="font-semibold text-foreground">Nenhum cliente encontrado</p>
                      <p className="text-sm text-muted-foreground mt-1">Tente outro termo ou adicione um novo cliente.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((cliente: any) => {
                    const isCnpj = (cliente.cpfCnpj || '').replace(/\D/g, '').length > 11;
                    const procCount = PROCESSO_COUNTS[cliente.id] ?? Math.floor(Math.random() * 3 + 1);
                    return (
                      <tr
                        key={cliente.id}
                        className="table-row-hover group cursor-pointer"
                        onClick={() => setSelectedCliente(cliente)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center text-white font-bold text-sm shrink-0">
                              {cliente.nome.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{cliente.nome}</p>
                              <p className="text-xs text-muted-foreground">{isCnpj ? "Pessoa Jurídica" : "Pessoa Física"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-mono text-sm text-foreground">{cliente.cpfCnpj || '—'}</span>
                        </td>
                        <td className="px-5 py-4">
                          {cliente.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <Mail className="w-3 h-3" /> {cliente.email}
                            </div>
                          )}
                          {cliente.telefone && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" /> {cliente.telefone}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold bg-muted px-2.5 py-1 rounded-full w-fit">
                            <Briefcase className="w-3 h-3 text-primary" /> {procCount}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">
                          {format(new Date(cliente.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedCliente(cliente); }}
                            className="p-1.5 bg-muted hover:bg-primary hover:text-white rounded-lg text-muted-foreground transition-all opacity-0 group-hover:opacity-100"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <AdicionarClienteModal
          onClose={() => setShowModal(false)}
          onSave={(data) => { setExtraClientes(p => [...p, data]); setShowModal(false); }}
        />
      )}

      {selectedCliente && (
        <ClienteDetalheDrawer
          cliente={selectedCliente}
          onClose={() => setSelectedCliente(null)}
        />
      )}
    </AppLayout>
  );
}
