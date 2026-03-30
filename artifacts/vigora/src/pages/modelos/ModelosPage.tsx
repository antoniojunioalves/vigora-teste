import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { FileText, Plus, Search, Edit2, Copy, Trash2, X, Save, ChevronRight } from "lucide-react";

const CATEGORIAS = ["Todos", "Petições", "Contratos", "Procurações", "Recursos", "Pareceres", "Correspondências", "Notificações"];

const MOCK_MODELOS = [
  { id: 1, titulo: "Petição Inicial — Ação Trabalhista", categoria: "Petições", descricao: "Modelo completo para ação de reclamação trabalhista com pleitos de verbas rescisórias.", criadoEm: "2024-01-15", conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) JUIZ(A) DO TRABALHO DA [VARA] VARA DO TRABALHO DE [COMARCA]

[NOME DO RECLAMANTE], [QUALIFICAÇÃO], por seu advogado que esta subscreve, vem, respeitosamente, perante V. Exa., com fundamento nos arts. 840 e seguintes da CLT, propor a presente

RECLAMAÇÃO TRABALHISTA

em face de [NOME DA RECLAMADA], [QUALIFICAÇÃO], pelos fatos e fundamentos a seguir expostos.

I – DOS FATOS

[Descrever os fatos da relação de emprego, admissão, atividades, rescisão]

II – DO DIREITO

[Fundamentação jurídica]

III – DOS PEDIDOS

Diante do exposto, requer:
a) O pagamento das verbas rescisórias devidas;
b) [Demais pedidos]

Dá-se à causa o valor de R$ [VALOR].

Termos em que pede deferimento.

[Local], [Data]

[NOME DO ADVOGADO]
OAB/[UF] [NÚMERO]` },
  { id: 2, titulo: "Procuração Ad Judicia et Extra", categoria: "Procurações", descricao: "Procuração com amplos poderes para atos judiciais e extrajudiciais.", criadoEm: "2024-02-01", conteudo: `PROCURAÇÃO AD JUDICIA ET EXTRA

OUTORGANTE: [NOME COMPLETO], [ESTADO CIVIL], [PROFISSÃO], portador do RG nº [RG] e CPF nº [CPF], residente e domiciliado(a) em [ENDEREÇO COMPLETO].

OUTORGADO(A): Dr./Dra. [NOME DO ADVOGADO], advogado(a) inscrito(a) na OAB/[UF] sob o nº [NÚMERO], com escritório na [ENDEREÇO DO ESCRITÓRIO].

PODERES: Pelo presente instrumento, o(a) Outorgante nomeia e constitui seu bastante procurador(a) o(a) Outorgado(a) acima qualificado(a), a quem confere amplos poderes para...

[Local], [Data]

_________________________________
Assinatura do Outorgante` },
  { id: 3, titulo: "Recurso de Apelação Cível", categoria: "Recursos", descricao: "Estrutura base para recurso de apelação em ações cíveis.", criadoEm: "2024-02-20", conteudo: `EXCELENTÍSSIMO(A) SENHOR(A) DESEMBARGADOR(A) RELATOR(A) DO TRIBUNAL DE JUSTIÇA DO ESTADO DE [UF]

[NOME DO APELANTE], já qualificado nos autos do processo em epígrafe, por seu advogado que esta subscreve, vem, tempestivamente, interpor o presente

RECURSO DE APELAÇÃO

nos termos do art. 1.009 do CPC/2015, pelas razões que seguem.

I – DA TEMPESTIVIDADE

[Comprovar a tempestividade do recurso]

II – DO CABIMENTO

[Demonstrar o cabimento do recurso]

III – DAS RAZÕES DO RECURSO

[Desenvolver as razões de mérito]

IV – DO PEDIDO

[Formular os pedidos recursais]

Termos em que pede provimento.

[Local], [Data]` },
  { id: 4, titulo: "Contrato de Honorários Advocatícios", categoria: "Contratos", descricao: "Contrato padrão de honorários com cláusulas de êxito.", criadoEm: "2024-03-01", conteudo: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

Pelo presente instrumento particular, as partes abaixo qualificadas:

CONTRATANTE: [NOME DO CLIENTE], [QUALIFICAÇÃO COMPLETA].

CONTRATADO: [NOME DO ADVOGADO/ESCRITÓRIO], [QUALIFICAÇÃO].

Têm entre si justo e acordado o seguinte:

CLÁUSULA 1ª – DO OBJETO
O Contratado compromete-se a prestar serviços advocatícios referentes a [DESCREVER O OBJETO DA CAUSA].

CLÁUSULA 2ª – DOS HONORÁRIOS
Pelos serviços prestados, o Contratante pagará:
a) Honorários fixos: R$ [VALOR] a ser pago [FORMA DE PAGAMENTO];
b) Honorários de êxito: [X]% sobre o proveito econômico obtido.

[Demais cláusulas]

[Local], [Data]

_________________________    _________________________
Contratante                  Contratado` },
  { id: 5, titulo: "Notificação Extrajudicial", categoria: "Notificações", descricao: "Modelo de notificação extrajudicial para diversas finalidades.", criadoEm: "2024-03-10", conteudo: `NOTIFICAÇÃO EXTRAJUDICIAL

[LOCAL], [DATA]

Ao Senhor(a)
[NOME DO NOTIFICADO]
[ENDEREÇO COMPLETO]

ASSUNTO: [ASSUNTO DA NOTIFICAÇÃO]

Pelo presente instrumento, o(a) notificante [NOME DO NOTIFICANTE], vem, por intermédio de seu(ua) advogado(a) Dr./Dra. [NOME], OAB/[UF] [NÚMERO], notificá-lo(a) acerca de [OBJETO DA NOTIFICAÇÃO].

[CORPO DA NOTIFICAÇÃO]

Fica V.Sa. ciente de que, no prazo de [X] dias a contar do recebimento desta, deverá [PROVIDÊNCIA REQUERIDA], sob pena de [CONSEQUÊNCIA].

Atenciosamente,

[NOME DO ADVOGADO]
OAB/[UF] [NÚMERO]` },
  { id: 6, titulo: "Parecer Jurídico", categoria: "Pareceres", descricao: "Estrutura para emissão de parecer jurídico consultivo.", criadoEm: "2024-03-15", conteudo: `PARECER JURÍDICO Nº [NÚMERO]/[ANO]

CONSULENTE: [NOME DO CONSULENTE]
ADVOGADO(A): [NOME], OAB/[UF] [NÚMERO]
ASSUNTO: [ASSUNTO DO PARECER]

I – DA CONSULTA

[Descrição da questão apresentada pelo consulente]

II – DA ANÁLISE

[Análise doutrinária e jurisprudencial]

III – DA CONCLUSÃO

[Conclusão e recomendações]

IV – DA RESSALVA

O presente parecer é emitido com base nos fatos e documentos apresentados pelo consulente, podendo ser revisto diante de novos elementos.

[Local], [Data]

[NOME DO ADVOGADO]
OAB/[UF] [NÚMERO]` },
];

export default function ModelosPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");
  const [search, setSearch] = useState("");
  const [editando, setEditando] = useState<any>(null);
  const [modelos, setModelos] = useState(MOCK_MODELOS);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ titulo: "", categoria: "Petições", descricao: "", conteudo: "" });

  const filtered = modelos.filter(m => {
    if (categoriaAtiva !== "Todos" && m.categoria !== categoriaAtiva) return false;
    if (search && !m.titulo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const saveEdit = () => {
    setModelos(p => p.map(m => m.id === editando.id ? editando : m));
    setEditando(null);
  };

  const saveNew = () => {
    if (!newForm.titulo || !newForm.conteudo) return;
    setModelos(p => [...p, { ...newForm, id: Date.now(), criadoEm: new Date().toISOString().split("T")[0] }]);
    setNewForm({ titulo: "", categoria: "Petições", descricao: "", conteudo: "" });
    setShowNew(false);
  };

  const duplicate = (m: any) => {
    setModelos(p => [...p, { ...m, id: Date.now(), titulo: `${m.titulo} (cópia)`, criadoEm: new Date().toISOString().split("T")[0] }]);
  };

  const remove = (id: number) => setModelos(p => p.filter(m => m.id !== id));

  if (editando) {
    return (
      <AppLayout>
        <div className="space-y-4 pb-6 h-full flex flex-col">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => setEditando(null)} className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <input value={editando.titulo} onChange={e => setEditando((p: any) => ({ ...p, titulo: e.target.value }))} className="font-display font-bold text-xl text-foreground bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5 transition-colors" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditando(null)} className="flex items-center gap-1.5 bg-muted border border-border text-muted-foreground hover:text-foreground text-sm font-medium px-3 py-2 rounded-xl transition-all">
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button onClick={saveEdit} className="flex items-center gap-1.5 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
                <Save className="w-3.5 h-3.5" /> Salvar modelo
              </button>
            </div>
          </div>
          <div className="flex-1">
            <textarea
              value={editando.conteudo}
              onChange={e => setEditando((p: any) => ({ ...p, conteudo: e.target.value }))}
              className="w-full h-[calc(100vh-220px)] bg-card border border-border rounded-2xl p-5 text-sm font-mono text-foreground resize-none focus:outline-none focus:border-primary transition-all leading-relaxed"
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" /> Modelos
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Biblioteca de modelos e minutas jurídicas</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
            <Plus className="w-4 h-4" /> Novo modelo
          </button>
        </div>

        <div className="flex gap-5">
          {/* Category sidebar */}
          <div className="w-44 flex-shrink-0">
            <div className="glass-panel rounded-2xl p-2 space-y-0.5">
              {CATEGORIAS.map(cat => {
                const count = cat === "Todos" ? modelos.length : modelos.filter(m => m.categoria === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoriaAtiva(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${categoriaAtiva === cat ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                    style={categoriaAtiva === cat ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}
                  >
                    <span className="truncate">{cat}</span>
                    {count > 0 && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1 ${categoriaAtiva === cat ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>{count}</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Templates grid */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar modelos..." className="w-full bg-muted border border-border rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-primary text-foreground" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(m => (
                <div key={m.id} className="glass-panel rounded-2xl p-4 hover:border-primary/30 border border-transparent transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditando(m)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => duplicate(m)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(m.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{m.categoria}</span>
                    <p className="font-semibold text-foreground text-sm mt-2 leading-snug">{m.titulo}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.descricao}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-3">Atualizado em {m.criadoEm}</p>
                  </div>
                  <button onClick={() => setEditando(m)} className="mt-3 w-full py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center gap-1.5">
                    <Edit2 className="w-3 h-3" /> Abrir no editor
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowNew(false)} />
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 relative z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-border">
              <h2 className="font-display font-bold text-foreground">Novo Modelo</h2>
              <button onClick={() => setShowNew(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Título *</label>
                <input value={newForm.titulo} onChange={e => setNewForm(p => ({ ...p, titulo: e.target.value }))} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground" placeholder="Ex: Petição Inicial Trabalhista" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Categoria</label>
                  <select value={newForm.categoria} onChange={e => setNewForm(p => ({ ...p, categoria: e.target.value }))} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none appearance-none text-foreground">
                    {CATEGORIAS.filter(c => c !== "Todos").map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descrição</label>
                  <input value={newForm.descricao} onChange={e => setNewForm(p => ({ ...p, descricao: e.target.value }))} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground" placeholder="Resumo do modelo..." />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Conteúdo *</label>
                <textarea value={newForm.conteudo} onChange={e => setNewForm(p => ({ ...p, conteudo: e.target.value }))} rows={6} className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground font-mono resize-none" placeholder="Cole ou escreva o conteúdo do modelo..." />
              </div>
              <div className="flex gap-3 pt-2 border-t border-border">
                <button onClick={() => setShowNew(false)} className="flex-1 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={saveNew} className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>Criar modelo</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
