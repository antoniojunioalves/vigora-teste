import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListNotificacoesProcessos,
  useListContatosWhatsapp,
  useListContatosDoProcesso,
  useSalvarVinculosProcesso,
  useRemoverContatoDoProcesso,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell, Briefcase, MessageCircle, Users, X, Check, ChevronRight, Phone, Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";

export default function NotificacoesProcessos() {
  const [selectedProcessoId, setSelectedProcessoId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const { data: processos = [], isLoading } = useListNotificacoesProcessos();

  const filtered = processos.filter((p) => {
    const s = search.toLowerCase();
    return (
      !s ||
      p.numeroProcesso.toLowerCase().includes(s) ||
      (p.cliente?.nome?.toLowerCase().includes(s) ?? false)
    );
  });

  const selectedProcesso = processos.find((p) => p.id === selectedProcessoId) || null;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <div className="bg-primary/20 p-2 rounded-xl">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            Notificações de Processos
          </h1>
          <p className="text-muted-foreground mt-1">
            Vincule contatos WhatsApp a processos para receber notificações automáticas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Process list */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border flex items-center justify-between gap-3">
              <h2 className="font-display font-bold text-foreground flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Processos
              </h2>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar processo..."
                className="bg-muted border border-border rounded-xl px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-all w-48"
              />
            </div>

            <div className="overflow-y-auto flex-1 max-h-[600px]">
              {isLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhum processo encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filtered.map((processo) => (
                    <button
                      key={processo.id}
                      onClick={() => setSelectedProcessoId(processo.id)}
                      className={`w-full text-left p-5 transition-all flex items-center justify-between gap-3 group ${
                        selectedProcessoId === processo.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-muted/50 border-l-2 border-l-transparent"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {processo.numeroProcesso}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {processo.cliente?.nome || "Sem cliente"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {processo.totalContatos > 0 && (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-success/15 text-success px-2 py-1 rounded-full">
                            <MessageCircle className="w-3 h-3" />
                            {processo.totalContatos}
                          </span>
                        )}
                        <StatusBadge status={processo.status} />
                        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-colors ${selectedProcessoId === processo.id ? "text-primary" : ""}`} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Contact management panel */}
          <div>
            {selectedProcessoId ? (
              <ContactPanel
                processoId={selectedProcessoId}
                processo={selectedProcesso}
                onClose={() => setSelectedProcessoId(null)}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                <div className="bg-muted p-5 rounded-full mb-4">
                  <Users className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <p className="font-display font-bold text-foreground">Selecione um processo</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  Clique em um processo à esquerda para gerenciar seus contatos WhatsApp vinculados.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ContactPanel({
  processoId,
  processo,
  onClose,
}: {
  processoId: number;
  processo: any;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vinculados = [], isLoading: loadingVinculados } = useListContatosDoProcesso(processoId);
  const { data: todosContatos = [], isLoading: loadingTodos } = useListContatosWhatsapp({ status: "ativo" });

  const vinculadosIds = new Set(vinculados.map((c: any) => c.id));
  const [selectedIds, setSelectedIds] = useState<Set<number>>(vinculadosIds);

  const initialized = !loadingVinculados;
  const [localIds, setLocalIds] = useState<Set<number>>(() => new Set());

  if (!loadingVinculados && localIds.size === 0 && vinculados.length > 0) {
    setLocalIds(new Set(vinculados.map((c: any) => c.id)));
  }

  function toggle(id: number) {
    setLocalIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const saveMutation = useSalvarVinculosProcesso({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["/api/notificacoes-processos"] });
        queryClient.invalidateQueries({ queryKey: [`/api/notificacoes-processos/${processoId}/contatos`] });
        toast({
          title: `Vinculação salva — ${data.added} adicionado${data.added !== 1 ? "s" : ""}, ${data.removed} removido${data.removed !== 1 ? "s" : ""}`,
        });
      },
      onError: () => toast({ title: "Erro ao salvar vinculação", variant: "destructive" }),
    },
  });

  const removeMutation = useRemoverContatoDoProcesso({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/notificacoes-processos"] });
        queryClient.invalidateQueries({ queryKey: [`/api/notificacoes-processos/${processoId}/contatos`] });
        toast({ title: "Contato desvinculado" });
      },
    },
  });

  function handleSave() {
    saveMutation.mutate({
      processoId,
      data: { contatoIds: [...localIds] },
    });
  }

  const isLoading = loadingVinculados || loadingTodos;

  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
      {/* Panel header */}
      <div className="p-5 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Processo selecionado</p>
            <p className="font-display font-bold text-foreground truncate">{processo?.numeroProcesso}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{processo?.cliente?.nome || "Sem cliente"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Contact checkboxes */}
      <div className="p-5">
        <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-success" />
          Contatos WhatsApp ativos
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : todosContatos.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum contato ativo cadastrado.</p>
            <a href="/contatos-whatsapp" className="text-xs text-primary font-semibold mt-1 inline-block">
              Cadastrar contatos →
            </a>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {todosContatos.map((contato) => {
              const checked = localIds.has(contato.id);
              return (
                <button
                  key={contato.id}
                  type="button"
                  onClick={() => toggle(contato.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                    checked
                      ? "border-success bg-success/10"
                      : "border-border hover:border-border/60 hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                    checked ? "border-success bg-success" : "border-border"
                  }`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center text-success font-bold text-xs shrink-0">
                    {contato.nome.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{contato.nome}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {contato.numeroWhatsapp}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Save button */}
      {!isLoading && todosContatos.length > 0 && (
        <div className="px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all primary-glow text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Salvar Vinculação ({localIds.size} selecionado{localIds.size !== 1 ? "s" : ""})
          </button>
        </div>
      )}
    </div>
  );
}
