import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Plus, X, Calendar, Clock,
  MapPin, User, Paperclip,
} from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const URGENCIA_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  baixa: { label: "Baixa",  color: "text-success",     bg: "bg-success/15" },
  media: { label: "Média",  color: "text-warning",      bg: "bg-warning/15" },
  alta:  { label: "Alta",   color: "text-destructive",  bg: "bg-destructive/15" },
  fatal: { label: "Fatal",  color: "text-destructive",  bg: "bg-destructive/30" },
};

const MOCK_EVENTS = [
  { id: 1, titulo: "Audiência de Instrução — Petrobras",     processo: "0001234-56.2023.8.26.0100", responsavel: "Dr. Carlos Mendes",    data: new Date(Date.now() + 2 * 86400000),  hora: "09:00", prazoFatal: true,  local: "TJSP — Sala 5",   descricao: "Audiência de instrução e julgamento trabalhista.", urgencia: "fatal", cor: "#EF4444" },
  { id: 2, titulo: "Reunião cliente — Roberto Almeida",      processo: "",                           responsavel: "Dra. Ana Rodrigues",   data: new Date(Date.now() + 1 * 86400000),  hora: "14:30", prazoFatal: false, local: "Escritório",      descricao: "Alinhamento sobre recurso especial.",              urgencia: "media", cor: "#F59E0B" },
  { id: 3, titulo: "Protocolar Recurso — TJSP",              processo: "0005678-90.2022.8.26.0224", responsavel: "Dr. Ricardo Lima",      data: new Date(Date.now() + 4 * 86400000),  hora: "17:00", prazoFatal: true,  local: "TJSP — Balcão",   descricao: "Protocolo do recurso de apelação.",                urgencia: "alta",  cor: "#F97316" },
  { id: 4, titulo: "Perícia Contábil — Construções Vega",    processo: "0003456-78.2023.8.26.0100", responsavel: "Dr. Carlos Mendes",    data: new Date(Date.now() + 7 * 86400000),  hora: "10:00", prazoFatal: false, local: "TRF 2ª Região",   descricao: "Acompanhamento de perícia contábil.",              urgencia: "baixa", cor: "#22C55E" },
  { id: 5, titulo: "Apresentar parecer — Família Mendonça",  processo: "0009012-34.2024.8.19.0100", responsavel: "Pedro Alves",          data: new Date(Date.now() + 10 * 86400000), hora: "11:00", prazoFatal: false, local: "TJMG",            descricao: "Apresentação de parecer de divórcio.",             urgencia: "media", cor: "#F59E0B" },
];

// ─── Form defaults ────────────────────────────────────────────────────────────

const mkEmpty = (dateStr = "") => ({
  processo:         "",
  responsavel:      "",
  tarefa:           "",
  data:             dateStr,
  hora:             "",
  prazoFatal:       "",
  mostrarAgenda:    false,
  informarTermino:  false,
  diaInteiro:       false,
  local:            "",
  descricao:        "",
  // flags
  importante:  false,
  urgente:     false,
  futura:      false,
  recorrente:  false,
  privada:     false,
  retroativa:  false,
  // internal
  urgencia: "media",
  titulo:   "",
});

// ─── Input style ──────────────────────────────────────────────────────────────

const INP = "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ─── Criar Tarefa Modal ───────────────────────────────────────────────────────

function CriarTarefaModal({ form, setForm, onClose, onSave }: {
  form: any;
  setForm: (fn: (p: any) => any) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const set = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }));

  const FLAGS = [
    { key: "importante",  label: "Importante" },
    { key: "urgente",     label: "Urgente" },
    { key: "futura",      label: "Futura" },
    { key: "recorrente",  label: "Recorrente" },
    { key: "privada",     label: "Privada" },
    { key: "retroativa",  label: "Retroativa" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border flex-shrink-0">
          <h2 className="font-display font-bold text-foreground text-lg">Criar nova tarefa</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">

          {/* Processo ou caso */}
          <Field label="Processo ou caso *">
            <input
              value={form.processo}
              onChange={e => set("processo", e.target.value)}
              placeholder="Nome do cliente ou número do processo"
              className={INP}
            />
          </Field>

          {/* Adicionar responsáveis */}
          <Field label="Adicionar responsáveis *">
            <div className="flex gap-2">
              <input
                value={form.responsavel}
                onChange={e => set("responsavel", e.target.value)}
                placeholder="Quem vai trabalhar nesta tarefa?"
                className={INP}
              />
              <button className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-border bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 transition-all whitespace-nowrap">
                Selecionar time
              </button>
            </div>
          </Field>

          {/* Tarefa */}
          <Field label="Tarefa *">
            <div className="flex gap-2">
              <input
                value={form.tarefa}
                onChange={e => set("tarefa", e.target.value)}
                placeholder="O que essa pessoa irá fazer?"
                className={INP}
              />
              <button className="flex-shrink-0 px-4 py-2.5 rounded-lg border border-border bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 transition-all whitespace-nowrap">
                Selecionar workflow
              </button>
            </div>
          </Field>

          {/* Data / Hora / Prazo fatal */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Data">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={form.data}
                  onChange={e => set("data", e.target.value)}
                  className={INP + " pl-10"}
                />
              </div>
            </Field>
            <Field label="Hora">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="time"
                  value={form.hora}
                  onChange={e => set("hora", e.target.value)}
                  className={INP + " pl-10"}
                />
              </div>
            </Field>
            <Field label="Prazo fatal">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={form.prazoFatal}
                  onChange={e => set("prazoFatal", e.target.value)}
                  className={INP + " pl-10"}
                />
              </div>
            </Field>
          </div>

          {/* Checkboxes row */}
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { key: "mostrarAgenda",   label: "Mostrar na agenda" },
              { key: "informarTermino", label: "Informar término" },
              { key: "diaInteiro",      label: "Dia inteiro" },
            ].map(cb => (
              <label key={cb.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form[cb.key]}
                  onChange={e => set(cb.key, e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                {cb.label}
              </label>
            ))}
          </div>

          {/* Local */}
          <Field label="Local">
            <input
              value={form.local}
              onChange={e => set("local", e.target.value)}
              placeholder="Local do evento"
              className={INP}
            />
          </Field>

          {/* Descrição */}
          <Field label="Descrição">
            <textarea
              value={form.descricao}
              onChange={e => set("descricao", e.target.value)}
              placeholder="Adicione um comentário. Use @ para mencionar."
              rows={4}
              className={INP + " resize-none"}
            />
          </Field>

          {/* Anexos */}
          <div>
            <p className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Anexos</p>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted text-sm font-medium text-foreground hover:bg-muted/70 transition-all"
            >
              <Paperclip className="w-4 h-4" /> Selecionar arquivos
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

          {/* Flags */}
          <div className="flex items-center gap-5 flex-wrap">
            {FLAGS.map(f => (
              <label key={f.key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form[f.key]}
                  onChange={e => set(f.key, e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-all">
            Cancelar
          </button>
          <button onClick={onSave} className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
            Criar nova tarefa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AgendaPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(mkEmpty());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) { days.push(d); d = addDays(d, 1); }

  const eventsForDay = (day: Date) => events.filter(e => isSameDay(e.data, day));
  const selectedEvents = selectedDay ? events.filter(e => isSameDay(e.data, selectedDay)) : [];

  // Click on a calendar day → open modal with date pre-filled
  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    const dateStr = format(day, "yyyy-MM-dd");
    setForm(mkEmpty(dateStr));
    setShowModal(true);
  };

  const openModal = () => {
    const dateStr = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
    setForm(mkEmpty(dateStr));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(mkEmpty());
  };

  const addEvent = () => {
    const title = form.tarefa || form.processo || "Novo evento";
    if (!form.data) return;
    setEvents(p => [...p, {
      id: Date.now(),
      titulo: title,
      processo: form.processo,
      responsavel: form.responsavel,
      data: new Date(form.data + "T12:00:00"),
      hora: form.hora,
      prazoFatal: !!form.prazoFatal,
      local: form.local,
      descricao: form.descricao,
      urgencia: form.urgente ? "alta" : form.importante ? "alta" : "media",
      cor: form.urgente ? "#F97316" : form.importante ? "#EF4444" : "#6670F0",
    }]);
    setShowModal(false);
    setForm(mkEmpty());
  };

  return (
    <AppLayout>
      <div className="space-y-5 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" /> Agenda
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Gerencie compromissos, audiências e prazos do escritório</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition-all primary-glow"
            style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
          >
            <Plus className="w-4 h-4" /> Novo evento
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            {/* Month nav */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-display font-bold text-foreground capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
              </h2>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
                <div key={d} className="py-2 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{d}</div>
              ))}
            </div>

            {/* Days grid — click opens modal */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dayEvents = eventsForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const todayDay = isToday(day);
                return (
                  <div
                    key={i}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[72px] p-1.5 border-b border-r border-border cursor-pointer transition-all group ${
                      isSelected ? "bg-primary/10" : "hover:bg-muted/40"
                    } ${!isCurrentMonth ? "opacity-35" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
                      todayDay ? "text-white" : isSelected ? "text-primary" : "text-foreground"
                    }`} style={todayDay ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : undefined}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map(e => (
                        <div key={e.id} className="text-[9px] font-semibold px-1 py-0.5 rounded truncate text-white" style={{ backgroundColor: e.cor }}>
                          {e.hora} {e.titulo.split("—")[0].trim()}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-muted-foreground font-medium px-1">+{dayEvents.length - 2} mais</div>
                      )}
                    </div>
                    {/* Hover hint */}
                    <div className="hidden group-hover:flex items-center justify-center mt-0.5">
                      <Plus className="w-3 h-3 text-primary/60" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Day detail panel */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="px-4 py-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground text-sm">
                {selectedDay ? format(selectedDay, "dd 'de' MMMM, yyyy", { locale: ptBR }) : "Selecione um dia"}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{selectedEvents.length} evento(s)</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {selectedEvents.length === 0 ? (
                <div className="py-10 text-center">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum evento neste dia</p>
                  <button onClick={openModal} className="mt-3 text-xs text-primary font-semibold hover:underline">
                    + Adicionar evento
                  </button>
                </div>
              ) : selectedEvents.map(e => {
                const urg = URGENCIA_CONFIG[e.urgencia] || URGENCIA_CONFIG.media;
                return (
                  <div key={e.id} className="border border-border rounded-xl p-3 hover:border-primary/30 transition-all" style={{ borderLeftColor: e.cor, borderLeftWidth: 3 }}>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="font-semibold text-foreground text-xs leading-tight">{e.titulo}</p>
                      {e.prazoFatal && <span className="text-[9px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded-full flex-shrink-0">FATAL</span>}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-2.5 h-2.5 flex-shrink-0" /> {e.hora}
                      </div>
                      {e.local && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <MapPin className="w-2.5 h-2.5 flex-shrink-0" /> {e.local}
                        </div>
                      )}
                      {e.responsavel && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <User className="w-2.5 h-2.5 flex-shrink-0" /> {e.responsavel}
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${urg.bg} ${urg.color}`}>{urg.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <CriarTarefaModal
          form={form}
          setForm={setForm}
          onClose={closeModal}
          onSave={addEvent}
        />
      )}
    </AppLayout>
  );
}
