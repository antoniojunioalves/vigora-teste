import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListProcessos, useCreateProcesso } from "@workspace/api-client-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Link } from "wouter";
import { Search, Plus, Briefcase, X, ChevronRight, Filter, Star } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MOCK_PROCESSOS, MOCK_CLIENTES } from "@/lib/mock-data";
import { useFavorites } from "@/lib/favorites";

const createSchema = z.object({
  numeroProcesso:      z.string().min(1, "Obrigatório"),
  nomeInterno:         z.string().optional(),
  tribunal:            z.string().optional(),
  area:                z.string().optional(),
  status:              z.enum(["ativo", "atencao", "prazo_vencido", "concluido", "arquivado"]),
  clienteId:           z.string().optional(),
  parteContraria:      z.string().optional(),
  comarca:             z.string().optional(),
  varaJuizo:           z.string().optional(),
  faseProcesso:        z.string().optional(),
  tipoAcao:            z.string().optional(),
  responsavelPrincipal:z.string().optional(),
  valorCausa:          z.string().optional(),
  dataDistribuicao:    z.string().optional(),
  observacoes:         z.string().optional(),
});

export default function ProcessosList() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { toggle, isFavorite } = useFavorites("processos");

  const { data: processosApi, isLoading } = useListProcessos({ search });
  const processos = (processosApi && processosApi.length > 0) ? processosApi : MOCK_PROCESSOS;

  const createMutation = useCreateProcesso({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/processos'] });
        setIsModalOpen(false);
        toast({ title: "Processo criado com sucesso!" });
      }
    }
  });

  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { status: "ativo" }
  });

  const onSubmit = (data: any) => createMutation.mutate({ data });

  const filteredProcessos = processos.filter(p => {
    if (showFavoritesOnly && !isFavorite(p.id)) return false;
    if (!search) return true;
    return (
      p.numeroProcesso.toLowerCase().includes(search.toLowerCase()) ||
      (p.cliente?.nome || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tribunal || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const statusColors: Record<string, string> = {
    ativo: "bg-success/15 text-success",
    atencao: "bg-warning/15 text-warning",
    prazo_vencido: "bg-destructive/15 text-destructive",
    concluido: "bg-muted text-muted-foreground",
    arquivado: "bg-muted text-muted-foreground",
  };

  return (
    <AppLayout>
      <div className="space-y-5 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Processos</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Gerencie todos os casos do escritório</p>
          </div>
          <button
            onClick={() => { reset(); setIsModalOpen(true); }}
            className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Novo Processo
          </button>
        </div>

        {/* Filters Bar */}
        <div className="glass-panel rounded-xl p-3 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número, cliente ou tribunal..."
              className="w-full bg-muted border border-border rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60 text-foreground"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground appearance-none min-w-[130px]">
              <option value="">Status (Todos)</option>
              <option value="ativo">Ativo</option>
              <option value="atencao">Atenção</option>
              <option value="prazo_vencido">Prazo Vencido</option>
              <option value="concluido">Concluído</option>
            </select>
            <select className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-foreground appearance-none min-w-[130px]">
              <option value="">Área (Todas)</option>
              <option value="Cível">Cível</option>
              <option value="Trabalhista">Trabalhista</option>
              <option value="Tributário">Tributário</option>
              <option value="Criminal">Criminal</option>
            </select>
            <button
              onClick={() => setShowFavoritesOnly(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all border ${showFavoritesOnly ? "bg-yellow-50 dark:bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/40" : "bg-muted border-border text-muted-foreground hover:text-foreground"}`}
            >
              <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? "fill-yellow-500 text-yellow-500" : ""}`} />
              Favoritos
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProcessos.length}</span> processos encontrados
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-3 w-8"></th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Processo</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Área / Tribunal</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="pl-4 py-4"><div className="h-4 w-4 bg-muted rounded" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-3/4 mb-1.5" /><div className="h-3 bg-muted rounded w-1/2" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-2/3" /></td>
                      <td className="px-5 py-4"><div className="h-4 bg-muted rounded w-1/2 mb-1" /><div className="h-3 bg-muted rounded w-1/3" /></td>
                      <td className="px-5 py-4"><div className="h-5 bg-muted rounded-full w-16" /></td>
                      <td className="px-5 py-4 text-right"><div className="h-7 w-7 bg-muted rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredProcessos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="font-semibold text-foreground">Nenhum processo encontrado</p>
                      <p className="text-sm text-muted-foreground mt-1">Tente outro termo de busca ou crie um novo processo.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProcessos.map((proc: any) => (
                    <tr key={proc.id} className={`table-row-hover group ${isFavorite(proc.id) ? "bg-yellow-50/40 dark:bg-yellow-500/5" : ""}`}>
                      <td className="pl-4 py-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(proc.id); }}
                          className="p-1 rounded-lg transition-all hover:scale-110"
                          title={isFavorite(proc.id) ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                        >
                          <Star className={`w-3.5 h-3.5 transition-colors ${isFavorite(proc.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400"}`} />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <Link href={`/processos/${proc.id}`}>
                          <p className="font-semibold text-foreground hover:text-primary cursor-pointer transition-colors font-mono text-sm">{proc.numeroProcesso}</p>
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatDistanceToNow(new Date(proc.criadoEm), { addSuffix: true, locale: ptBR })}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                            {(proc.cliente?.nome || 'S')[0]}
                          </div>
                          <span className="font-medium text-foreground">{proc.cliente?.nome || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-foreground">{proc.area || '—'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{proc.tribunal || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={proc.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/processos/${proc.id}`}>
                          <button className="p-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-lg text-muted-foreground transition-all opacity-0 group-hover:opacity-100">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="glass-panel w-full max-w-2xl rounded-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-5 border-b border-border shrink-0">
              <h2 className="text-base font-bold font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Novo Processo
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:bg-muted p-1.5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">

                {/* Identificação */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Identificação</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Número do Processo (CNJ) *</label>
                      <input {...register("numeroProcesso")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all font-mono" placeholder="0000000-00.0000.0.00.0000" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Nome Interno / Apelido</label>
                      <input {...register("nomeInterno")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="Ex: Petrobras — Trabalhista 2024" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Área Jurídica</label>
                        <select {...register("area")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
                          <option value="">Selecione...</option>
                          <option>Cível</option><option>Trabalhista</option><option>Criminal</option><option>Tributário</option>
                          <option>Empresarial</option><option>Família</option><option>Ambiental</option><option>Previdenciário</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Status Inicial</label>
                        <select {...register("status")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
                          <option value="ativo">Ativo</option>
                          <option value="atencao">Atenção</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Partes */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Partes</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Cliente (Polo Ativo)</label>
                      <select {...register("clienteId")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
                        <option value="">— Selecione um cliente —</option>
                        {(MOCK_CLIENTES as any[]).map((c: any) => (
                          <option key={c.id} value={String(c.id)}>{c.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Parte Contrária / Polo Passivo</label>
                      <input {...register("parteContraria")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="Nome da parte contrária" />
                    </div>
                  </div>
                </div>

                {/* Localização judicial */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Localização Judicial</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Tribunal / Órgão</label>
                      <input {...register("tribunal")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="TJSP, TRT 2ª, TRF2..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Comarca</label>
                      <input {...register("comarca")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="São Paulo, Rio de Janeiro..." />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Vara / Juízo</label>
                      <input {...register("varaJuizo")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="1ª Vara Cível, JEF..." />
                    </div>
                  </div>
                </div>

                {/* Fase e responsável */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Fase &amp; Responsável</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Fase Processual</label>
                      <select {...register("faseProcesso")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
                        <option value="">Selecione...</option>
                        <option>Inicial</option><option>Citação</option><option>Contestação</option><option>Instrução</option>
                        <option>Audiência</option><option>Conciliação</option><option>Sentença</option><option>Recurso</option><option>Execução</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Tipo de Ação</label>
                      <input {...register("tipoAcao")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="Ação de cobrança, RO..." />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Responsável Principal</label>
                      <select {...register("responsavelPrincipal")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary appearance-none text-foreground transition-all">
                        <option value="">Selecione...</option>
                        <option>Dr. Carlos Mendes</option><option>Dra. Ana Lima</option><option>Dra. Juliana Costa</option>
                        <option>Dr. Ricardo Alves</option><option>Pedro Souza</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Data de Distribuição</label>
                      <input type="date" {...register("dataDistribuicao")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" />
                    </div>
                  </div>
                </div>

                {/* Valor da causa */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Valor da Causa (R$)</label>
                  <input {...register("valorCausa")} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all" placeholder="0,00" />
                </div>

                {/* Observações */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Observações</label>
                  <textarea {...register("observacoes")} rows={3} className="w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-all resize-none" placeholder="Detalhes sobre o caso..." />
                </div>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 py-2.5 rounded-lg gradient-blue text-white font-semibold text-sm primary-glow hover:opacity-90 disabled:opacity-50 transition-all">
                  {createMutation.isPending ? "Salvando..." : "Criar Processo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
