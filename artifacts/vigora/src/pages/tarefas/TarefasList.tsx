import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Plus, Clock, Loader2, CheckCircle, MoreHorizontal,
  Flag, Star, X, Calendar, Timer, Paperclip, Users, GitBranch, Columns3,
  Pencil, Trash2, Check, Tag, Search, ChevronDown, ArrowLeft, Briefcase,
} from "lucide-react";
import { MOCK_TAREFAS } from "@/lib/mock-data";
import { useFavorites } from "@/lib/favorites";

// ─── Filter / Label constants ─────────────────────────────────────────────────

type Etiqueta = { id: string; label: string; color: string; mostrarEm: string };

const ETIQUETAS_INICIAL: Etiqueta[] = [
  { id: "audiencia",        label: "Audiência",        color: "#EF4444", mostrarEm: "Personalizado" },
  { id: "consumidor",       label: "Consumidor",       color: "#22C55E", mostrarEm: "Personalizado" },
  { id: "criminal",         label: "Criminal",         color: "#DC2626", mostrarEm: "Personalizado" },
  { id: "civel",            label: "Cível",            color: "#06B6D4", mostrarEm: "Personalizado" },
  { id: "fase_audiencia",   label: "Fase audiência",   color: "#A855F7", mostrarEm: "Personalizado" },
  { id: "fase_citacao",     label: "Fase citação",     color: "#F97316", mostrarEm: "Personalizado" },
  { id: "fase_conciliacao", label: "Fase conciliação", color: "#84CC16", mostrarEm: "Personalizado" },
  { id: "fase_contestacao", label: "Fase contestação", color: "#EF4444", mostrarEm: "Personalizado" },
  { id: "fase_inicial",     label: "Fase inicial",     color: "#EAB308", mostrarEm: "Personalizado" },
  { id: "fase_sentenca",    label: "Fase sentença",    color: "#22D3EE", mostrarEm: "Personalizado" },
  { id: "prazo",            label: "Prazo",            color: "#F97316", mostrarEm: "Personalizado" },
  { id: "trabalhista",      label: "Trabalhista",      color: "#EA580C", mostrarEm: "Personalizado" },
  { id: "tributario",       label: "Tributário",       color: "#D946EF", mostrarEm: "Personalizado" },
];

const ETIQ_PALETTE = [
  "#EF4444","#DC2626","#F97316","#EA580C","#EAB308","#F59E0B",
  "#22C55E","#84CC16","#22D3EE","#06B6D4","#3B82F6","#6366F1",
  "#A855F7","#D946EF","#EC4899","#64748B",
];

const MOSTRAR_EM_OPTS = ["Personalizado","Tarefas","Processos","Clientes","Financeiro"];

const PESSOAS = ["Roberto J.", "Carlos M.", "Ana R.", "Ricardo L.", "Pedro A."];

const AVATAR_COLORS = ["#2A34D4","#22C55E","#F59E0B","#EF4444","#8B5CF6"];

const TASK_ASSIGNEES: Record<number | string, string[]> = {
  1: ["Carlos M.", "Ana R."],
  2: ["Carlos M."],
  3: ["Ana R.", "Ricardo L."],
  4: ["Pedro A."],
  5: ["Juliana C.", "Ricardo L."],
  6: ["Carlos M.", "Pedro A."],
  7: ["Ana R."],
};

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  alta: "text-destructive bg-destructive/15",
  media: "text-warning bg-warning/15",
  baixa: "text-success bg-success/15",
};
const PRIORITY_LABELS: Record<string, string> = {
  alta: "Alta", media: "Média", baixa: "Baixa",
};

// ─── Column definition ────────────────────────────────────────────────────────

type ColDef = { id: string; label: string; color: string; countBg: string };

const DEFAULT_COLUMNS: ColDef[] = [
  { id: "pendente",     label: "A Fazer",      color: "text-muted-foreground", countBg: "bg-muted" },
  { id: "em_andamento", label: "Em Andamento", color: "text-primary",          countBg: "bg-primary/15" },
  { id: "concluida",    label: "Concluídas",   color: "text-success",          countBg: "bg-success/15" },
];

const COL_ICON: Record<string, React.ElementType> = {
  pendente:     Clock,
  em_andamento: Loader2,
  concluida:    CheckCircle,
};
const DefaultIcon = Columns3;

// ─── Shared styles ────────────────────────────────────────────────────────────

const INPUT =
  "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

// ─── Nova Tarefa modal ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  processo: "", responsaveis: "", tarefa: "",
  data: "", hora: "", prazoFatal: "",
  mostrarAgenda: false, informarTermino: false, diaInteiro: false,
  local: "", descricao: "",
  importante: false, urgente: false, futura: false,
  recorrente: false, privada: false, retroativa: false,
};

function NovaTarefaModal({
  initialStatus,
  onClose,
  onSave,
}: {
  initialStatus?: string;
  onClose: () => void;
  onSave: (f: typeof EMPTY_FORM, status: string) => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [targetStatus, setTargetStatus] = useState(initialStatus || "pendente");
  const set = (k: keyof typeof EMPTY_FORM, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    if (!form.processo || !form.tarefa) return;
    onSave(form, targetStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

        <div className="flex items-center justify-between px-6 py-5 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-display font-bold text-foreground">Criar nova tarefa</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          <Field label="Processo ou caso *">
            <input value={form.processo} onChange={e => set("processo", e.target.value)} placeholder="Nome do cliente ou número do processo" className={INPUT} />
          </Field>

          <Field label="Adicionar responsáveis *">
            <div className="flex gap-2">
              <input value={form.responsaveis} onChange={e => set("responsaveis", e.target.value)} placeholder="Quem vai trabalhar nesta tarefa?" className={INPUT} />
              <button className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap transition-all flex-shrink-0">
                <Users className="w-3.5 h-3.5" /> Selecionar time
              </button>
            </div>
          </Field>

          <Field label="Tarefa *">
            <div className="flex gap-2">
              <input value={form.tarefa} onChange={e => set("tarefa", e.target.value)} placeholder="O que essa pessoa irá fazer?" className={INPUT} />
              <button className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground whitespace-nowrap transition-all flex-shrink-0">
                <GitBranch className="w-3.5 h-3.5" /> Selecionar workflow
              </button>
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Data">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input type="date" value={form.data} onChange={e => set("data", e.target.value)} className={INPUT + " pl-9"} />
              </div>
            </Field>
            <Field label="Hora">
              <div className="relative">
                <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input type="time" value={form.hora} onChange={e => set("hora", e.target.value)} className={INPUT + " pl-9"} />
              </div>
            </Field>
            <Field label="Prazo fatal">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input type="date" value={form.prazoFatal} onChange={e => set("prazoFatal", e.target.value)} className={INPUT + " pl-9"} />
              </div>
            </Field>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {([["mostrarAgenda", "Mostrar na agenda"], ["informarTermino", "Informar término"], ["diaInteiro", "Dia inteiro"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
                {label}
              </label>
            ))}
          </div>

          <Field label="Local">
            <input value={form.local} onChange={e => set("local", e.target.value)} placeholder="Local do evento" className={INPUT} />
          </Field>

          <Field label="Descrição">
            <textarea value={form.descricao} onChange={e => set("descricao", e.target.value)} placeholder="Adicione um comentário. Use @ para mencionar." rows={4} className={INPUT + " resize-none"} />
          </Field>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Anexos</label>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
            <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
              <Paperclip className="w-3.5 h-3.5" /> Selecionar arquivos
            </button>
            {files.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {files.map((f, i) => (
                  <span key={i} className="text-[11px] bg-muted border border-border rounded-lg px-2.5 py-1 text-muted-foreground flex items-center gap-1.5">
                    <Paperclip className="w-3 h-3" /> {f.name}
                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))} className="hover:text-destructive ml-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 pb-1">
            {([["importante", "Importante"], ["urgente", "Urgente"], ["futura", "Futura"], ["recorrente", "Recorrente"], ["privada", "Privada"], ["retroativa", "Retroativa"]] as const).map(([k, label]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} className="w-4 h-4 rounded border-border accent-primary" />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">Cancelar</button>
          <button onClick={handleSubmit} className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
            Criar nova tarefa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Column modal ─────────────────────────────────────────────────────────

function AdicionarColunaModal({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-sm rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-foreground">Nova coluna</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <Field label="Nome da coluna *">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && name.trim() && (onAdd(name.trim()), onClose())}
            placeholder="Ex: Em revisão"
            className={INPUT}
            autoFocus
          />
        </Field>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">Cancelar</button>
          <button
            onClick={() => { if (name.trim()) { onAdd(name.trim()); onClose(); } }}
            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all"
            style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TarefaDetalheModal ───────────────────────────────────────────────────────

function TarefaDetalheModal({ tarefa, onClose, onComplete, isFav, onToggleFav }: {
  tarefa: any;
  onClose: () => void;
  onComplete: () => void;
  isFav: boolean;
  onToggleFav: () => void;
}) {
  const assignees = TASK_ASSIGNEES[tarefa.id] || [tarefa.titulo.charAt(0)];
  const prioLabel = PRIORITY_LABELS[tarefa.prioridade] || tarefa.prioridade;
  const prioBg    = PRIORITY_COLORS[tarefa.prioridade] || "bg-muted text-muted-foreground";

  const statusLabel: Record<string, string> = {
    pendente: "A Fazer", em_andamento: "Em Andamento", concluida: "Concluída",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel w-full max-w-lg rounded-2xl relative z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            {tarefa.prioridade && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 ${prioBg}`}>
                <Flag className="w-2.5 h-2.5" /> {prioLabel}
              </span>
            )}
            <h2 className="text-base font-bold font-display text-foreground leading-snug">{tarefa.titulo}</h2>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={onToggleFav} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Star className={`w-4 h-4 ${isFav ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Description */}
          {tarefa.descricao && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Descrição</p>
              <p className="text-sm text-foreground bg-muted rounded-xl p-3 leading-relaxed">{tarefa.descricao}</p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Status</p>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full ${tarefa.status === "concluida" ? "bg-success" : tarefa.status === "em_andamento" ? "bg-primary" : "bg-muted-foreground"}`} />
                <span className="text-sm font-medium text-foreground">{statusLabel[tarefa.status] || tarefa.status}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Criado em</p>
              <p className="text-sm text-foreground bg-muted rounded-lg px-3 py-2 font-mono">
                {tarefa.criadoEm ? new Date(tarefa.criadoEm).toLocaleDateString("pt-BR") : "—"}
              </p>
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Responsáveis</p>
            <div className="flex flex-wrap gap-2">
              {assignees.map((name: string, i: number) => (
                <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-foreground">{name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Processo */}
          {tarefa.processo && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Processo</p>
              <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-sm font-mono text-foreground">{tarefa.processo.numeroProcesso}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Fechar</button>
          {tarefa.status !== "concluida" && (
            <button onClick={onComplete} className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 flex items-center justify-center gap-2 transition-all">
              <CheckCircle className="w-4 h-4" /> Concluir Tarefa
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TarefasList() {
  const { toggle, isFavorite } = useFavorites("tarefas");

  // Local tasks state (initialised from mock)
  const [tasks, setTasks] = useState<any[]>(MOCK_TAREFAS);
  const [columns, setColumns] = useState<ColDef[]>(DEFAULT_COLUMNS);

  // Modals
  const [showNewTask,     setShowNewTask]     = useState(false);
  const [newTaskCol,      setNewTaskCol]      = useState<string | undefined>(undefined);
  const [showAddCol,      setShowAddCol]      = useState(false);
  const [selectedTarefa,  setSelectedTarefa]  = useState<any | null>(null);

  // Column edit / delete
  const [menuColId,       setMenuColId]       = useState<string | null>(null);
  const [editingColId,    setEditingColId]    = useState<string | null>(null);
  const [editLabel,       setEditLabel]       = useState("");
  const [confirmDelColId, setConfirmDelColId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuColId) return;
    const close = () => setMenuColId(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuColId]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingColId) editInputRef.current?.focus();
  }, [editingColId]);

  const startEdit = (col: ColDef) => {
    setEditLabel(col.label);
    setEditingColId(col.id);
    setMenuColId(null);
  };

  const commitEdit = () => {
    if (editLabel.trim()) {
      setColumns(p => p.map(c => c.id === editingColId ? { ...c, label: editLabel.trim() } : c));
    }
    setEditingColId(null);
  };

  const deleteColumn = (colId: string) => {
    // Move tasks from deleted column to the first remaining column
    const remaining = columns.filter(c => c.id !== colId);
    const fallback = remaining[0]?.id;
    if (fallback) {
      setTasks(p => p.map(t => t.status === colId ? { ...t, status: fallback } : t));
    }
    setColumns(remaining);
    setConfirmDelColId(null);
    setMenuColId(null);
  };

  // Drag state
  const [dragId,       setDragId]       = useState<number | string | null>(null);
  const [dragOverCol,  setDragOverCol]  = useState<string | null>(null);

  // Open modal for a specific column (or header button)
  const openModal = (colId?: string) => {
    setNewTaskCol(colId);
    setShowNewTask(true);
  };

  const saveTask = (f: typeof EMPTY_FORM, status: string) => {
    const newTask = {
      id: Date.now(),
      titulo: f.tarefa,
      descricao: f.descricao,
      status,
      prioridade: f.urgente ? "alta" : f.importante ? "media" : "baixa",
      processo: f.processo ? { numeroProcesso: f.processo } : null,
    };
    setTasks(p => [...p, newTask]);
  };

  const addColumn = (name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setColumns(p => [...p, { id, label: name, color: "text-primary", countBg: "bg-primary/10" }]);
  };

  // ── Filter state ────────────────────────────────────────────────────────────

  const [openDropdown,    setOpenDropdown]    = useState<null | "date" | "pessoas" | "tipos" | "etiquetas">(null);
  const [filterAtrib,     setFilterAtrib]     = useState("todas");
  const [filterPessoa,    setFilterPessoa]    = useState("todas");
  const [filterTipo,      setFilterTipo]      = useState("todas");
  const [filterStatusF,   setFilterStatusF]   = useState("todos");
  const [filterEtiq,      setFilterEtiq]      = useState<string[]>([]);
  const [etiqBusca,       setEtiqBusca]       = useState("");
  const [showSearch,      setShowSearch]       = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");

  // ── Gerenciar Etiquetas state ────────────────────────────────────────────────
  const [manageEtiq,      setManageEtiq]      = useState(false);
  const [etiqList,        setEtiqList]        = useState<Etiqueta[]>(ETIQUETAS_INICIAL);
  const [etiqMenuId,      setEtiqMenuId]      = useState<string | null>(null);
  const [showAddEtiq,     setShowAddEtiq]     = useState(false);
  const [newEtiqName,     setNewEtiqName]     = useState("");
  const [newEtiqColor,    setNewEtiqColor]    = useState(ETIQ_PALETTE[0]);
  const [newEtiqMostrar,  setNewEtiqMostrar]  = useState("Personalizado");
  const [editingEtiqId,   setEditingEtiqId]   = useState<string | null>(null);
  const [editEtiqName,    setEditEtiqName]    = useState("");
  const [editEtiqColor,   setEditEtiqColor]   = useState(ETIQ_PALETTE[0]);

  const saveNewEtiq = () => {
    if (!newEtiqName.trim()) return;
    const id = newEtiqName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setEtiqList(p => [...p, { id, label: newEtiqName.trim(), color: newEtiqColor, mostrarEm: newEtiqMostrar }]);
    setNewEtiqName(""); setNewEtiqColor(ETIQ_PALETTE[0]); setNewEtiqMostrar("Personalizado"); setShowAddEtiq(false);
  };

  const startEditEtiq = (e: Etiqueta) => {
    setEditingEtiqId(e.id); setEditEtiqName(e.label); setEditEtiqColor(e.color); setEtiqMenuId(null);
  };

  const saveEditEtiq = (id: string) => {
    if (!editEtiqName.trim()) return;
    setEtiqList(p => p.map(e => e.id === id ? { ...e, label: editEtiqName.trim(), color: editEtiqColor } : e));
    setEditingEtiqId(null);
  };

  const deleteEtiq = (id: string) => {
    setEtiqList(p => p.filter(e => e.id !== id));
    setEtiqMenuId(null);
    setFilterEtiq(p => p.filter(x => x !== id));
  };

  const changeMostrarEm = (id: string, val: string) => {
    setEtiqList(p => p.map(e => e.id === id ? { ...e, mostrarEm: val } : e));
  };

  // Pending (unapplied) estado for dropdowns
  const [pendingAtrib,    setPendingAtrib]    = useState("todas");
  const [pendingPessoa,   setPendingPessoa]   = useState("todas");
  const [pendingTipo,     setPendingTipo]     = useState("todas");
  const [pendingStatusF,  setPendingStatusF]  = useState("todos");

  const closeDropdown = () => setOpenDropdown(null);

  const openDrop = (id: typeof openDropdown) => {
    if (openDropdown === id) { setOpenDropdown(null); return; }
    // Reset pending to current applied values when opening
    setPendingAtrib(filterAtrib);
    setPendingPessoa(filterPessoa);
    setPendingTipo(filterTipo);
    setPendingStatusF(filterStatusF);
    setOpenDropdown(id);
  };

  const applyPessoas = () => { setFilterAtrib(pendingAtrib); setFilterPessoa(pendingPessoa); setOpenDropdown(null); };
  const applyTipos   = () => { setFilterTipo(pendingTipo); setFilterStatusF(pendingStatusF); setOpenDropdown(null); };

  // Filtered tasks
  const filteredTasks = tasks.filter(t => {
    if (searchQuery && !`${t.titulo} ${t.descricao || ""}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterEtiq.length > 0) {
      const taskEtiq = t.prioridade === "alta" ? "audiencia" : t.prioridade === "media" ? "prazo" : null;
      if (!taskEtiq || !filterEtiq.includes(taskEtiq)) return false;
    }
    if (filterTipo !== "todas") {
      const titleLower = t.titulo.toLowerCase();
      const tipoMap: Record<string, string[]> = {
        audiencias: ["audiência", "audiencia"],
        prazos: ["prazo", "protocolar"],
        eventos: ["reunião", "reuniao", "perícia", "pericia"],
        tarefas: [],
      };
      const keywords = tipoMap[filterTipo] || [];
      if (keywords.length > 0 && !keywords.some(k => titleLower.includes(k))) return false;
    }
    return true;
  });

  const pessoasLabel = filterPessoa === "todas" && filterAtrib === "todas"
    ? "TODAS AS PESSOAS E ATRIBUIÇÕES"
    : filterPessoa !== "todas" ? filterPessoa.toUpperCase()
    : filterAtrib === "responsavel" ? "RESPONSÁVEIS" : filterAtrib === "quem_criou" ? "QUEM CRIOU" : "ENVOLVIDOS";

  const tiposLabel = filterTipo === "todas" ? "TODOS OS TIPOS"
    : filterTipo === "audiencias" ? "AUDIÊNCIAS"
    : filterTipo === "prazos" ? "PRAZOS"
    : filterTipo === "eventos" ? "EVENTOS"
    : "TAREFAS";

  const etiqActiveSel = filterEtiq.length > 0;
  const visibleEtiquetas = etiqList.filter(e => !etiqBusca || e.label.toLowerCase().includes(etiqBusca.toLowerCase()));

  // ── Drag handlers ────────────────────────────────────────────────────────────

  const onDragStart = (e: React.DragEvent, taskId: number | string) => {
    setDragId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(colId);
  };

  const onDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    if (dragId !== null) {
      setTasks(p => p.map(t => t.id === dragId ? { ...t, status: colId } : t));
    }
    setDragId(null);
    setDragOverCol(null);
  };

  const onDragEnd = () => {
    setDragId(null);
    setDragOverCol(null);
  };

  // ─── Gerenciar Etiquetas view ────────────────────────────────────────────────

  if (manageEtiq) {
    return (
      <AppLayout>
        <div
          className="flex flex-col h-full pb-6"
          onClick={e => { if (!(e.target as HTMLElement).closest(".etiq-menu-wrap")) setEtiqMenuId(null); }}
        >
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-foreground">Etiquetas</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setManageEtiq(false)}
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-muted border border-border"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={() => setShowAddEtiq(true)}
                className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90 uppercase tracking-wide"
              >
                <Plus className="w-4 h-4" /> Adicionar Etiqueta
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-xl border border-border overflow-hidden flex-1 overflow-y-auto">
            {/* Table header */}
            <div className="grid border-b border-border bg-muted/50" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
              <div className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Nome</div>
              <div className="px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-widest border-l border-border">Mostrar em</div>
              <div className="w-14" />
            </div>

            {/* Add-new row (shown when showAddEtiq) */}
            {showAddEtiq && (
              <div className="grid border-b border-border bg-primary/5" style={{ gridTemplateColumns: "1fr 1fr auto" }}>
                <div className="px-6 py-4 flex items-center gap-3">
                  {/* Color palette */}
                  <div className="relative group flex-shrink-0">
                    <div className="w-5 h-5 rounded cursor-pointer ring-2 ring-border hover:ring-primary transition-all" style={{ backgroundColor: newEtiqColor }} />
                    <div className="absolute left-0 top-7 z-50 glass-panel rounded-xl p-3 border border-border shadow-xl w-52 hidden group-hover:grid grid-cols-8 gap-1.5">
                      {ETIQ_PALETTE.map(c => (
                        <button key={c} onClick={() => setNewEtiqColor(c)}
                          className={`w-5 h-5 rounded transition-all hover:scale-110 ${newEtiqColor === c ? "ring-2 ring-primary ring-offset-1" : ""}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <input
                    autoFocus
                    value={newEtiqName}
                    onChange={e => setNewEtiqName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") saveNewEtiq(); if (e.key === "Escape") { setShowAddEtiq(false); setNewEtiqName(""); } }}
                    placeholder="Nome da etiqueta"
                    className="flex-1 bg-transparent border-b border-primary text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none pb-0.5"
                  />
                </div>
                <div className="px-6 py-4 border-l border-border flex items-center">
                  <select
                    value={newEtiqMostrar}
                    onChange={e => setNewEtiqMostrar(e.target.value)}
                    className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary w-full"
                  >
                    {MOSTRAR_EM_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="w-14 flex items-center justify-center gap-1.5">
                  <button onClick={saveNewEtiq} className="p-1.5 rounded-lg text-success hover:bg-success/10 transition-colors"><Check className="w-4 h-4" /></button>
                  <button onClick={() => { setShowAddEtiq(false); setNewEtiqName(""); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /></button>
                </div>
              </div>
            )}

            {/* Rows */}
            {etiqList.map(etiq => (
              <div
                key={etiq.id}
                className="grid border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                style={{ gridTemplateColumns: "1fr 1fr auto" }}
              >
                {/* NOME cell */}
                <div className="px-6 py-4 flex items-center gap-3">
                  {editingEtiqId === etiq.id ? (
                    <>
                      {/* Inline color palette */}
                      <div className="relative group flex-shrink-0">
                        <div className="w-5 h-5 rounded cursor-pointer ring-2 ring-primary" style={{ backgroundColor: editEtiqColor }} />
                        <div className="absolute left-0 top-7 z-50 glass-panel rounded-xl p-3 border border-border shadow-xl w-52 hidden group-hover:grid grid-cols-8 gap-1.5">
                          {ETIQ_PALETTE.map(c => (
                            <button key={c} onClick={() => setEditEtiqColor(c)}
                              className={`w-5 h-5 rounded transition-all hover:scale-110 ${editEtiqColor === c ? "ring-2 ring-primary ring-offset-1" : ""}`}
                              style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                      <input
                        autoFocus
                        value={editEtiqName}
                        onChange={e => setEditEtiqName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") saveEditEtiq(etiq.id); if (e.key === "Escape") setEditingEtiqId(null); }}
                        className="flex-1 bg-transparent border-b border-primary text-sm text-foreground focus:outline-none pb-0.5"
                      />
                      <button onClick={() => saveEditEtiq(etiq.id)} className="p-1 text-success hover:opacity-70 transition-opacity"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingEtiqId(null)} className="p-1 text-muted-foreground hover:opacity-70 transition-opacity"><X className="w-3.5 h-3.5" /></button>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded flex-shrink-0" style={{ backgroundColor: etiq.color }} />
                      <span className="text-sm text-foreground">{etiq.label}</span>
                    </>
                  )}
                </div>

                {/* MOSTRAR EM cell */}
                <div className="px-6 py-4 border-l border-border flex items-center">
                  <select
                    value={etiq.mostrarEm}
                    onChange={e => changeMostrarEm(etiq.id, e.target.value)}
                    className="bg-transparent text-sm text-foreground focus:outline-none cursor-pointer hover:text-primary transition-colors border-0 p-0 w-auto"
                  >
                    {MOSTRAR_EM_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>

                {/* Actions cell */}
                <div className="w-14 flex items-center justify-center etiq-menu-wrap">
                  <div className="relative">
                    <button
                      onClick={() => setEtiqMenuId(etiqMenuId === etiq.id ? null : etiq.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {etiqMenuId === etiq.id && (
                      <div className="absolute right-0 top-8 z-50 glass-panel rounded-xl shadow-xl border border-border py-1 w-40">
                        <button
                          onClick={() => startEditEtiq(etiq)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors text-left"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Renomear
                        </button>
                        <button
                          onClick={() => deleteEtiq(etiq.id)}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {etiqList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Tag className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">Nenhuma etiqueta criada</p>
                <p className="text-xs text-muted-foreground">Clique em "Adicionar Etiqueta" para começar.</p>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className="space-y-5 pb-6 flex flex-col h-full">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Quadro de Tarefas</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Kanban de atividades da equipe jurídica</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {["C", "A", "R"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-lg border-2 border-background gradient-blue flex items-center justify-center text-[10px] font-bold text-white">{l}</div>
              ))}
              <div className="w-8 h-8 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">+2</div>
            </div>
            <button
              onClick={() => openModal()}
              className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Nova Tarefa
            </button>
          </div>
        </div>

        {/* ── Filter bar ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap" onClick={e => { if (!(e.target as HTMLElement).closest(".filter-drop")) closeDropdown(); }}>

          {/* Date button */}
          <div className="filter-drop relative">
            <button
              onClick={() => openDrop("date")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${openDropdown === "date" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              HOJE <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "date" && (
              <div className="absolute left-0 top-9 z-40 glass-panel rounded-xl shadow-xl border border-border p-3 text-sm w-44">
                {["Hoje", "Semana", "Mês", "Personalizado"].map(d => (
                  <label key={d} className="flex items-center gap-2 py-1.5 cursor-pointer hover:text-foreground text-foreground/80">
                    <input type="radio" name="date" defaultChecked={d === "Hoje"} className="accent-primary" /> {d}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date display pill */}
          <span className="px-3 py-1.5 rounded-lg border border-border bg-muted text-xs font-mono text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR")}
          </span>

          {/* Pessoas / Atribuição */}
          <div className="filter-drop relative">
            <button
              onClick={() => openDrop("pessoas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${(filterAtrib !== "todas" || filterPessoa !== "todas") ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {pessoasLabel} <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "pessoas" && (
              <div className="absolute left-0 top-9 z-40 glass-panel rounded-xl shadow-xl border border-border p-4 text-sm w-80">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Atribuição</p>
                    {[["todas","Todas as atribuições"],["responsavel","Responsável"],["quem_criou","Quem criou"],["envolvido","Envolvido"]].map(([v,l]) => (
                      <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer text-foreground/80 hover:text-foreground text-xs">
                        <input type="radio" name="atrib" checked={pendingAtrib === v} onChange={() => setPendingAtrib(v)} className="accent-primary" /> {l}
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Pessoas</p>
                    <label className="flex items-center gap-2 py-1.5 cursor-pointer text-foreground/80 hover:text-foreground text-xs">
                      <input type="radio" name="pessoa" checked={pendingPessoa === "todas"} onChange={() => setPendingPessoa("todas")} className="accent-primary" /> Todas as pessoas
                    </label>
                    {PESSOAS.map(p => (
                      <label key={p} className="flex items-center gap-2 py-1.5 cursor-pointer text-foreground/80 hover:text-foreground text-xs">
                        <input type="radio" name="pessoa" checked={pendingPessoa === p} onChange={() => setPendingPessoa(p)} className="accent-primary" /> {p}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-border">
                  <button onClick={closeDropdown} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Cancelar</button>
                  <button onClick={applyPessoas} className="text-xs font-bold text-primary hover:opacity-80 transition-colors uppercase tracking-wider">Aplicar</button>
                </div>
              </div>
            )}
          </div>

          {/* Todos os tipos */}
          <div className="filter-drop relative">
            <button
              onClick={() => openDrop("tipos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${filterTipo !== "todas" ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              {tiposLabel} <ChevronDown className="w-3 h-3" />
            </button>
            {openDropdown === "tipos" && (
              <div className="absolute left-0 top-9 z-40 glass-panel rounded-xl shadow-xl border border-border p-4 text-sm w-56">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Exibir</p>
                {[["todas","Todas as atividades"],["tarefas","Tarefas"],["eventos","Eventos"],["prazos","Prazos"],["audiencias","Audiências"]].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer text-foreground/80 hover:text-foreground text-xs">
                    <input type="radio" name="tipo" checked={pendingTipo === v} onChange={() => setPendingTipo(v)} className="accent-primary" /> {l}
                  </label>
                ))}
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-3 mb-2">Status</p>
                {[["todos","Todos os status"],["canceladas","Canceladas"]].map(([v,l]) => (
                  <label key={v} className="flex items-center gap-2 py-1.5 cursor-pointer text-foreground/80 hover:text-foreground text-xs">
                    <input type="radio" name="statusf" checked={pendingStatusF === v} onChange={() => setPendingStatusF(v)} className="accent-primary" /> {l}
                  </label>
                ))}
                <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-border">
                  <button onClick={closeDropdown} className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">Cancelar</button>
                  <button onClick={applyTipos} className="text-xs font-bold text-primary hover:opacity-80 transition-colors uppercase tracking-wider">Aplicar</button>
                </div>
              </div>
            )}
          </div>

          {/* Etiquetas */}
          <div className="filter-drop relative">
            <button
              onClick={() => openDrop("etiquetas")}
              className={`p-1.5 rounded-lg border transition-all ${etiqActiveSel ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
            >
              <Tag className="w-4 h-4" />
            </button>
            {openDropdown === "etiquetas" && (
              <div className="absolute left-0 top-10 z-40 glass-panel rounded-xl shadow-xl border border-border p-0 text-sm w-56 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Etiquetas</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    <input
                      value={etiqBusca}
                      onChange={e => setEtiqBusca(e.target.value)}
                      placeholder="Encontrar etiqueta"
                      className="w-full bg-muted border border-border rounded-lg pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="px-4 py-2">
                  {visibleEtiquetas.map(e => (
                    <label key={e.id} className="flex items-center gap-2.5 py-2 cursor-pointer hover:text-foreground text-foreground/80 text-xs">
                      <input
                        type="checkbox"
                        checked={filterEtiq.includes(e.id)}
                        onChange={() => setFilterEtiq(p => p.includes(e.id) ? p.filter(x => x !== e.id) : [...p, e.id])}
                        className="accent-primary w-3.5 h-3.5"
                      />
                      <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: e.color }} />
                      {e.label}
                    </label>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-border">
                  <button
                    onClick={() => { setManageEtiq(true); setOpenDropdown(null); }}
                    className="text-xs font-bold text-primary hover:opacity-80 transition-colors uppercase tracking-wider w-full text-center"
                  >Gerenciar Etiquetas</button>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearchQuery(""); }}
            className={`p-1.5 rounded-lg border transition-all ${showSearch || searchQuery ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            <Search className="w-4 h-4" />
          </button>
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar tarefas..."
                className="pl-8 pr-3 py-1.5 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all w-48"
              />
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
          {columns.map(col => {
            const Icon = COL_ICON[col.id] || DefaultIcon;
            const count = filteredTasks.filter(t => t.status === col.id).length;
            return (
              <div key={col.id} className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3">
                <div className={`${col.countBg} p-2 rounded-lg`}>
                  <Icon className={`w-4 h-4 ${col.color} ${col.id === "em_andamento" ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                </div>
                <div>
                  <p className="text-xl font-bold font-display text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{col.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kanban board */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-x-auto pb-2">
          {columns.map(col => {
            const colTasks = filteredTasks.filter(t => t.status === col.id);
            const Icon = COL_ICON[col.id] || DefaultIcon;
            const isOver = dragOverCol === col.id;
            return (
              <div
                key={col.id}
                className="glass-panel rounded-xl flex flex-col overflow-hidden flex-shrink-0 w-72"
                onDragOver={e => onDragOver(e, col.id)}
                onDrop={e => onDrop(e, col.id)}
              >
                {/* Column header */}
                <div className="px-3 py-3 border-b border-border flex items-center justify-between bg-muted/30 flex-shrink-0 group/header">

                  {/* Title or inline edit input */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 ${col.color} flex-shrink-0`} />
                    {editingColId === col.id ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <input
                          ref={editInputRef}
                          value={editLabel}
                          onChange={e => setEditLabel(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter") commitEdit();
                            if (e.key === "Escape") setEditingColId(null);
                          }}
                          className="flex-1 min-w-0 bg-background border border-primary rounded px-2 py-0.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                        <button onClick={commitEdit} className="p-0.5 text-success hover:text-success/80 transition-colors flex-shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingColId(null)} className="p-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <h3 className="font-semibold text-sm text-foreground truncate">{col.label}</h3>
                    )}
                  </div>

                  {/* Count + menu */}
                  {editingColId !== col.id && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.countBg} ${col.color}`}>
                        {colTasks.length}
                      </span>

                      {/* ⋯ menu button */}
                      <div className="relative" onMouseDown={e => e.stopPropagation()}>
                        <button
                          onClick={() => setMenuColId(menuColId === col.id ? null : col.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted opacity-0 group-hover/header:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>

                        {/* Dropdown */}
                        {menuColId === col.id && (
                          <div className="absolute right-0 top-7 z-30 w-44 glass-panel rounded-xl shadow-xl border border-border py-1 text-sm">
                            <button
                              onClick={() => startEdit(col)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-foreground hover:bg-muted transition-colors text-left"
                            >
                              <Pencil className="w-3.5 h-3.5 text-muted-foreground" /> Editar nome
                            </button>
                            {confirmDelColId === col.id ? (
                              <div className="px-3 py-2 border-t border-border">
                                <p className="text-xs text-muted-foreground mb-2">Excluir coluna? As tarefas serão movidas.</p>
                                <div className="flex gap-1.5">
                                  <button onClick={() => setConfirmDelColId(null)} className="flex-1 py-1 rounded-md border border-border text-xs font-semibold hover:bg-muted transition-all">Não</button>
                                  <button onClick={() => deleteColumn(col.id)} className="flex-1 py-1 rounded-md bg-destructive text-white text-xs font-semibold hover:opacity-90 transition-all">Sim</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDelColId(col.id)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-destructive hover:bg-destructive/10 transition-colors text-left border-t border-border"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Excluir coluna
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Task list */}
                <div
                  className={`flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar transition-colors ${isOver ? "bg-primary/5" : ""}`}
                >
                  {colTasks.length === 0 ? (
                    <div className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-medium transition-colors ${isOver ? "border-primary/40 text-primary/60 bg-primary/5" : "border-border text-muted-foreground/50"}`}>
                      {isOver ? "Soltar aqui" : "Nenhuma tarefa"}
                    </div>
                  ) : (
                    colTasks.map((tarefa: any) => {
                      const assignees = TASK_ASSIGNEES[tarefa.id] || [tarefa.titulo.charAt(0)];
                      return (
                        <div
                          key={tarefa.id}
                          draggable
                          onDragStart={e => { onDragStart(e, tarefa.id); }}
                          onDragEnd={onDragEnd}
                          onClick={() => setSelectedTarefa(tarefa)}
                          className={`bg-background border p-4 rounded-xl hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group select-none ${
                            dragId === tarefa.id ? "opacity-40 scale-95" : ""
                          } ${isFavorite(tarefa.id) ? "border-yellow-300 dark:border-yellow-500/40 bg-yellow-50/30 dark:bg-yellow-500/5" : "border-border"}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2.5">
                            {tarefa.prioridade && (
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${PRIORITY_COLORS[tarefa.prioridade] || "bg-muted text-muted-foreground"}`}>
                                <Flag className="w-2.5 h-2.5" /> {PRIORITY_LABELS[tarefa.prioridade] || tarefa.prioridade}
                              </span>
                            )}
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={e => { e.stopPropagation(); toggle(tarefa.id); }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:scale-110"
                              >
                                <Star className={`w-3.5 h-3.5 ${isFavorite(tarefa.id) ? "fill-yellow-400 text-yellow-400 opacity-100" : "text-muted-foreground/60"}`} style={{ opacity: isFavorite(tarefa.id) ? 1 : undefined }} />
                              </button>
                              <button onClick={e => e.stopPropagation()} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="font-semibold text-foreground text-sm leading-snug mb-2">{tarefa.titulo}</p>

                          {tarefa.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{tarefa.descricao}</p>
                          )}

                          <div className="pt-2.5 border-t border-border flex items-center justify-between">
                            {tarefa.processo ? (
                              <span className="text-[10px] font-mono bg-muted px-2 py-1 rounded text-muted-foreground truncate max-w-[110px]">
                                {tarefa.processo.numeroProcesso?.substring(0, 12)}...
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground italic">Tarefa avulsa</span>
                            )}
                            {/* Multi-avatar row */}
                            <div className="flex -space-x-1.5">
                              {assignees.slice(0, 3).map((name: string, i: number) => (
                                <div key={i} className="w-5 h-5 rounded border-2 border-background flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                                  {name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                              {assignees.length > 3 && (
                                <div className="w-5 h-5 rounded border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                  +{assignees.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Drop zone hint when dragging over a non-empty column */}
                  {isOver && colTasks.length > 0 && (
                    <div className="h-14 border-2 border-dashed border-primary/40 rounded-xl flex items-center justify-center text-xs text-primary/70 font-medium bg-primary/5">
                      Soltar aqui
                    </div>
                  )}
                </div>

                {/* ➕ Nova tarefa no rodapé da coluna */}
                <div className="flex-shrink-0 px-3 pb-3 pt-1">
                  <button
                    onClick={() => openModal(col.id)}
                    className="w-full flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-dashed border-border hover:border-border rounded-lg px-3 py-2 text-xs font-semibold transition-all group"
                  >
                    <Plus className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    Nova tarefa
                  </button>
                </div>
              </div>
            );
          })}

          {/* ➕ Adicionar coluna */}
          <div className="flex-shrink-0 w-56">
            <button
              onClick={() => setShowAddCol(true)}
              className="h-full min-h-[200px] w-full flex flex-col items-center justify-center gap-2.5 glass-panel rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold">Adicionar coluna</span>
            </button>
          </div>
        </div>
      </div>

      {selectedTarefa && (
        <TarefaDetalheModal
          tarefa={selectedTarefa}
          isFav={isFavorite(selectedTarefa.id)}
          onToggleFav={() => toggle(selectedTarefa.id)}
          onClose={() => setSelectedTarefa(null)}
          onComplete={() => {
            setTasks(p => p.map(t => t.id === selectedTarefa.id ? { ...t, status: "concluida" } : t));
            setSelectedTarefa(null);
          }}
        />
      )}

      {showNewTask && (
        <NovaTarefaModal
          initialStatus={newTaskCol}
          onClose={() => setShowNewTask(false)}
          onSave={saveTask}
        />
      )}

      {showAddCol && (
        <AdicionarColunaModal
          onClose={() => setShowAddCol(false)}
          onAdd={addColumn}
        />
      )}
    </AppLayout>
  );
}
