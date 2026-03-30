import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  useListContatosWhatsapp,
  useCreateContatoWhatsapp,
  useUpdateContatoWhatsapp,
  useDeleteContatoWhatsapp,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Plus, Search, Pencil, Trash2, X, Check, Phone, Mail, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type StatusFiltro = "todos" | "ativo" | "inativo";

interface FormData {
  nome: string;
  numeroWhatsapp: string;
  email: string;
  status: "ativo" | "inativo";
  observacoes: string;
}

const EMPTY_FORM: FormData = {
  nome: "",
  numeroWhatsapp: "",
  email: "",
  status: "ativo",
  observacoes: "",
};

export default function ContatosWhatsapp() {
  const [search, setSearch] = useState("");
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contatos = [], isLoading } = useListContatosWhatsapp({
    search: search || undefined,
    status: statusFiltro !== "todos" ? statusFiltro : undefined,
  });

  const createMutation = useCreateContatoWhatsapp({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/contatos-whatsapp"] });
        closeModal();
        toast({ title: "Contato criado com sucesso" });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Erro ao criar contato";
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  const updateMutation = useUpdateContatoWhatsapp({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/contatos-whatsapp"] });
        closeModal();
        toast({ title: "Contato atualizado com sucesso" });
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || "Erro ao atualizar contato";
        toast({ title: msg, variant: "destructive" });
      },
    },
  });

  const deleteMutation = useDeleteContatoWhatsapp({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/contatos-whatsapp"] });
        setDeletingId(null);
        toast({ title: "Contato excluído" });
      },
    },
  });

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(contato: any) {
    setEditingId(contato.id);
    setForm({
      nome: contato.nome,
      numeroWhatsapp: contato.numeroWhatsapp,
      email: contato.email || "",
      status: contato.status,
      observacoes: contato.observacoes || "",
    });
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setErrors({});
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.nome.trim()) e.nome = "Nome é obrigatório";
    if (!form.numeroWhatsapp.trim()) e.numeroWhatsapp = "Número é obrigatório";
    else {
      const digits = form.numeroWhatsapp.replace(/\D/g, "");
      if (digits.length < 10) e.numeroWhatsapp = "Número deve ter pelo menos 10 dígitos";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const payload = {
      nome: form.nome.trim(),
      numeroWhatsapp: form.numeroWhatsapp.trim(),
      email: form.email.trim() || null,
      status: form.status,
      observacoes: form.observacoes.trim() || null,
    } as any;

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <div className="bg-success/20 p-2 rounded-xl">
                <MessageCircle className="w-6 h-6 text-success" />
              </div>
              Contatos WhatsApp
            </h1>
            <p className="text-muted-foreground mt-1">
              Cadastre contatos para vincular a processos e enviar notificações futuras.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-full font-semibold flex items-center gap-2 primary-glow transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-5 h-5" /> Adicionar Contato
          </button>
        </div>

        {/* Filters */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou número..."
              className="w-full bg-muted border border-border rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="relative">
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value as StatusFiltro)}
              className="appearance-none bg-muted border border-border rounded-xl py-2.5 pl-4 pr-9 text-sm focus:outline-none focus:border-primary transition-all text-foreground cursor-pointer"
            >
              <option value="todos">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : contatos.length === 0 ? (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="bg-muted p-5 rounded-full mb-4">
                <MessageCircle className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <p className="text-xl font-display font-bold text-foreground">Nenhum contato cadastrado</p>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                {search ? "Nenhum resultado para sua busca." : "Adicione o primeiro contato WhatsApp do seu escritório."}
              </p>
              {!search && (
                <button
                  onClick={openCreate}
                  className="mt-5 bg-primary text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-primary/90 transition-all"
                >
                  Adicionar Contato
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Email</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Cadastrado em</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {contatos.map((contato) => (
                    <tr key={contato.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success font-bold text-sm shrink-0">
                            {contato.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-foreground text-sm">{contato.nome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-foreground font-mono">
                          <Phone className="w-3.5 h-3.5 text-success" />
                          {contato.numeroWhatsapp}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {contato.email || <span className="italic opacity-50">—</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          contato.status === "ativo"
                            ? "bg-success/15 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${contato.status === "ativo" ? "bg-success" : "bg-muted-foreground"}`} />
                          {contato.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-muted-foreground">
                        {format(new Date(contato.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(contato)}
                            className="p-2 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(contato.id)}
                            className="p-2 rounded-xl bg-muted hover:bg-destructive/10 hover:text-destructive transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
                {contatos.length} contato{contatos.length !== 1 ? "s" : ""} encontrado{contatos.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={closeModal}>
            <div
              className="w-full max-w-lg glass-panel rounded-3xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold text-foreground">
                  {editingId ? "Editar Contato" : "Novo Contato WhatsApp"}
                </h2>
                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <FormField label="Nome do contato *" error={errors.nome}>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Ex: Maria Silva"
                    className={inputClass(!!errors.nome)}
                  />
                </FormField>

                <FormField label="Número de WhatsApp *" error={errors.numeroWhatsapp}>
                  <input
                    value={form.numeroWhatsapp}
                    onChange={(e) => setForm((f) => ({ ...f, numeroWhatsapp: e.target.value }))}
                    placeholder="Ex: +55 11 99999-9999"
                    className={inputClass(!!errors.numeroWhatsapp)}
                  />
                </FormField>

                <FormField label="Email (opcional)">
                  <input
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                    type="email"
                    className={inputClass(false)}
                  />
                </FormField>

                <FormField label="Status">
                  <div className="flex gap-3">
                    {(["ativo", "inativo"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, status: s }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                          form.status === s
                            ? s === "ativo"
                              ? "border-success bg-success/10 text-success"
                              : "border-muted-foreground bg-muted text-foreground"
                            : "border-border text-muted-foreground hover:border-border/80"
                        }`}
                      >
                        {s === "ativo" ? "Ativo" : "Inativo"}
                      </button>
                    ))}
                  </div>
                </FormField>

                <FormField label="Observações (opcional)">
                  <textarea
                    value={form.observacoes}
                    onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                    placeholder="Anotações sobre este contato..."
                    rows={3}
                    className={`${inputClass(false)} resize-none`}
                  />
                </FormField>
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold transition-all text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isPending}
                  className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all text-sm primary-glow flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  {editingId ? "Salvar Alterações" : "Criar Contato"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm Modal */}
        {deletingId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-sm glass-panel rounded-3xl p-8 shadow-2xl text-center">
              <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-2">Excluir contato?</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Esta ação não pode ser desfeita. O contato será removido de todos os processos vinculados.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border bg-muted text-foreground font-semibold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteMutation.mutate({ id: deletingId })}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {deleteMutation.isPending ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Excluir"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full bg-muted border ${hasError ? "border-destructive" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 transition-all`;
}
