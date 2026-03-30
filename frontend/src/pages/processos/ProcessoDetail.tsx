import { useParams } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import { useGetProcesso, useListContatosDoProcesso } from "@/lib/api-client";
import { StatusBadge } from "@/components/ui/status-badge";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Calendar, CheckSquare, Clock, User, FileText, AlertTriangle, Plus, Pencil, LayoutDashboard, ChevronRight, MessageCircle, Phone } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function ProcessoDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: processo, isLoading, error } = useGetProcesso(Number(id));
  const [activeTab, setActiveTab] = useState("visao_geral");

  if (isLoading) return (
    <AppLayout>
      <div className="animate-pulse space-y-6 max-w-6xl mx-auto">
        <div className="h-24 bg-muted rounded-2xl" />
        <div className="h-32 bg-muted rounded-2xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-muted rounded-2xl" />
          <div className="h-96 bg-muted rounded-2xl" />
        </div>
      </div>
    </AppLayout>
  );
  
  if (error || !processo) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Processo não encontrado</h2>
        <Link href="/processos">
          <button className="mt-6 bg-muted hover:bg-muted/80 px-6 py-2 rounded-lg font-semibold transition-colors">
            Voltar para lista
          </button>
        </Link>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        
        {/* Header Hero */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="space-y-3">
              <Link href="/processos" className="inline-flex">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors bg-muted hover:bg-primary/10 px-3 py-1.5 rounded-lg w-fit">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar para processos
                </span>
              </Link>
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <StatusBadge status={processo.status} />
                  {processo.area && <span className="text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-lg">{processo.area}</span>}
                </div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground font-mono">
                  {processo.numeroProcesso}
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">{processo.tribunal || 'Tribunal não informado'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="gradient-blue text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 primary-glow text-sm transition-all hover:opacity-90">
                <Calendar className="w-4 h-4" /> Novo Prazo
              </button>
              <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all border border-border">
                <CheckSquare className="w-4 h-4" /> Nova Tarefa
              </button>
              <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm transition-all border border-border">
                <Pencil className="w-4 h-4" /> Editar
              </button>
            </div>
          </div>
        </div>

        {/* NEXT DEADLINE highlighted box */}
        {processo.proximoPrazo && (
          <div className="bg-gradient-to-r from-warning/20 via-warning/5 to-transparent border border-warning/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[0_0_30px_-10px_rgba(255,165,0,0.2)]">
            <div className="flex items-start md:items-center gap-5 mb-4 md:mb-0">
              <div className="bg-warning/20 p-4 rounded-2xl shrink-0 animate-pulse">
                <AlertTriangle className="w-8 h-8 text-warning" />
              </div>
              <div>
                <p className="text-warning font-bold uppercase tracking-widest text-xs mb-1">Próximo Prazo Crítico</p>
                <h3 className="text-2xl font-bold font-display text-foreground">{processo.proximoPrazo.tipo.replace('_', ' ')}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-muted px-3 py-1 rounded-md text-sm font-medium border border-border">
                    {format(new Date(processo.proximoPrazo.dataLimite), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </span>
                  <StatusBadge status={processo.proximoPrazo.status} />
                </div>
              </div>
            </div>
            
            <div className="bg-muted border border-border rounded-xl p-4 text-center min-w-[150px]">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Tempo Restante</p>
              <p className="text-3xl font-bold font-display text-warning mt-1">
                {differenceInDays(new Date(processo.proximoPrazo.dataLimite), new Date())} dias
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-border pb-4 no-scrollbar">
          {[
            { id: "visao_geral", label: "Visão Geral", icon: LayoutDashboard },
            { id: "prazos", label: `Prazos (${processo.prazos?.length || 0})`, icon: Calendar },
            { id: "tarefas", label: `Tarefas (${processo.tarefas?.length || 0})`, icon: CheckSquare },
            { id: "cliente", label: "Cliente", icon: User },
            { id: "whatsapp", label: "Notificações", icon: MessageCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground primary-glow" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Content (2/3) */}
          <div className="md:col-span-2 space-y-6">
            
            {activeTab === "visao_geral" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="glass-panel p-8 rounded-3xl">
                  <h2 className="text-xl font-bold font-display mb-6 border-b border-border pb-4">Detalhes do Cadastro</h2>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Cadastrado em</p>
                      <p className="font-medium">{format(new Date(processo.criadoEm), "dd/MM/yyyy")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Responsável</p>
                      <p className="font-medium flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs">U</div>
                        Usuário Atual
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-8 rounded-3xl">
                  <h2 className="text-xl font-bold font-display mb-4 border-b border-border pb-4">Observações Internas</h2>
                  {processo.observacoes ? (
                    <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted p-4 rounded-xl border border-border">
                      {processo.observacoes}
                    </p>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground mb-3">Nenhuma observação registrada.</p>
                      <button className="text-primary text-sm font-semibold hover:underline">Adicionar observação</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "prazos" && (
              <div className="glass-panel p-0 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" /> Histórico de Prazos
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {processo.prazos?.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">Nenhum prazo cadastrado</p>
                      <button className="mt-4 bg-muted hover:bg-muted/80 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Cadastrar o primeiro</button>
                    </div>
                  ) : (
                    processo.prazos?.map(prazo => (
                      <div key={prazo.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-border hover:border-primary/30 transition-colors group">
                        <div className="flex gap-4 items-center">
                          <div className="bg-primary/10 p-3 rounded-xl text-primary">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">{prazo.tipo.replace('_', ' ')}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(prazo.dataLimite), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge status={prazo.status} />
                          <button className="text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            Detalhes <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "tarefas" && (
              <div className="glass-panel p-0 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-accent" /> Tarefas Vinculadas
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {processo.tarefas?.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium text-foreground">Nenhuma tarefa para este processo</p>
                    </div>
                  ) : (
                    processo.tarefas?.map(tarefa => (
                      <div key={tarefa.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${tarefa.status === 'concluida' ? 'bg-success' : 'bg-primary border border-primary'}`}></div>
                          <p className={`font-medium ${tarefa.status === 'concluida' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {tarefa.titulo}
                          </p>
                        </div>
                        <StatusBadge status={tarefa.status} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "cliente" && (
              <div className="glass-panel p-8 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
                <h2 className="text-xl font-bold font-display mb-6 border-b border-border pb-4">Informações do Cliente</h2>
                {processo.cliente ? (
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-3xl font-display font-bold border-2 border-border">
                      {processo.cliente.nome.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl font-bold text-foreground">{processo.cliente.nome}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Email</p>
                          <p className="font-medium text-sm">{processo.cliente.email || 'Não informado'}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground mb-1">Telefone</p>
                          <p className="font-medium text-sm">{processo.cliente.telefone || 'Não informado'}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg border border-border col-span-2">
                          <p className="text-xs text-muted-foreground mb-1">Documento (CPF/CNPJ)</p>
                          <p className="font-medium text-sm font-mono">{processo.cliente.cpfCnpj || 'Não informado'}</p>
                        </div>
                      </div>
                      <Link href={`/clientes/${processo.cliente.id}`}>
                        <button className="mt-4 w-full py-3 bg-muted hover:bg-muted/80 rounded-lg text-sm font-semibold transition-colors flex justify-center items-center gap-2">
                          Abrir Perfil Completo <ChevronRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">Processo sem cliente vinculado.</p>
                    <button className="mt-4 text-primary font-semibold hover:underline">Vincular Cliente</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "whatsapp" && (
              <WhatsappContatosTab processoId={Number(id)} />
            )}

          </div>

          {/* Sidebar Info (1/3) */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl bg-card/80 border-t-4 border-t-primary">
              <h3 className="font-bold font-display text-lg mb-4 text-foreground">Resumo</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground text-sm">Status Atual</span>
                  <StatusBadge status={processo.status} />
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground text-sm">Prazos Totais</span>
                  <span className="font-bold text-lg">{processo.prazos?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <span className="text-muted-foreground text-sm">Prazos Pendentes</span>
                  <span className="font-bold text-lg text-warning">
                    {processo.prazos?.filter(p => p.status !== 'concluido').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Tarefas</span>
                  <span className="font-bold text-lg">{processo.tarefas?.length || 0}</span>
                </div>
              </div>
            </div>
            
            {activeTab !== "cliente" && processo.cliente && (
              <div className="glass-panel p-6 rounded-3xl flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors group">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center font-bold">
                  {processo.cliente.nome.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Cliente</p>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{processo.cliente.nome}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            )}
          </div>

        </div>
      </div>
    </AppLayout>
  );
}

function WhatsappContatosTab({ processoId }: { processoId: number }) {
  const { data: contatos = [], isLoading } = useListContatosDoProcesso(processoId);

  return (
    <div className="glass-panel rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
        <h2 className="text-xl font-bold font-display flex items-center gap-2 text-foreground">
          <MessageCircle className="w-5 h-5 text-success" /> Contatos para Notificação
        </h2>
        <Link href="/notificacoes-processos">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer">
            Gerenciar notificações <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : contatos.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-border rounded-2xl">
            <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-semibold text-foreground">Nenhum contato vinculado</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Vincule contatos WhatsApp para receber alertas deste processo.
            </p>
            <Link href="/notificacoes-processos">
              <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-primary/90 transition-all">
                <Plus className="w-4 h-4" /> Vincular Contatos
              </span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {contatos.map((contato: any) => (
              <div
                key={contato.id}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border hover:border-success/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-success/15 flex items-center justify-center text-success font-bold text-sm shrink-0">
                  {contato.nome.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{contato.nome}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {contato.numeroWhatsapp}
                  </p>
                </div>
                <span className="text-xs font-semibold bg-success/15 text-success px-2 py-1 rounded-full">
                  Ativo
                </span>
              </div>
            ))}
            <Link href="/notificacoes-processos">
              <span className="flex items-center justify-center gap-1.5 mt-2 text-xs text-primary font-semibold hover:underline cursor-pointer">
                Gerenciar vínculos <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
