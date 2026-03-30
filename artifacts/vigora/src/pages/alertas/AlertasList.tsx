import { AppLayout } from "@/components/layout/AppLayout";
import { useListAlertas, useMarcarTodosAlertasLidos } from "@workspace/api-client-react";
import { Bell, Check, ShieldAlert, AlertTriangle, Clock, Info, CheckCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MOCK_ALERTAS } from "@/lib/mock-data";

function getAlertStyle(tipo: string) {
  if (tipo.includes('vencido') || tipo.includes('critico')) {
    return { borderColor: 'border-l-destructive', iconBg: 'bg-destructive/15', iconColor: 'text-destructive', icon: AlertTriangle, badge: 'bg-destructive/15 text-destructive', label: 'Crítico' };
  }
  if (tipo.includes('urgente') || tipo.includes('atencao') || tipo.includes('vencendo')) {
    return { borderColor: 'border-l-warning', iconBg: 'bg-warning/15', iconColor: 'text-warning', icon: Clock, badge: 'bg-warning/15 text-warning', label: 'Urgente' };
  }
  return { borderColor: 'border-l-primary', iconBg: 'bg-primary/15', iconColor: 'text-primary', icon: Info, badge: 'bg-primary/15 text-primary', label: 'Info' };
}

export default function AlertasList() {
  const { data: alertasApi, isLoading } = useListAlertas();
  const alertas = (alertasApi && alertasApi.length > 0) ? alertasApi : MOCK_ALERTAS;
  const markAllMutation = useMarcarTodosAlertasLidos();
  const queryClient = useQueryClient();

  const handleMarkAll = async () => {
    await markAllMutation.mutateAsync();
    queryClient.invalidateQueries({ queryKey: ['/api/alertas'] });
    queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
  };

  const unread = alertas?.filter((a: any) => !a.lido).length ?? 0;

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-5 pb-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2.5">
              <div className="bg-destructive/15 p-2 rounded-xl">
                <Bell className="w-5 h-5 text-destructive" />
              </div>
              Central de Alertas
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {unread > 0 ? (
                <span><span className="font-semibold text-destructive">{unread}</span> alertas não lidos</span>
              ) : "Nenhum alerta pendente"}
            </p>
          </div>
          <button
            onClick={handleMarkAll}
            disabled={markAllMutation.isPending || unread === 0}
            className="flex items-center gap-2 bg-muted hover:bg-muted/80 border border-border px-3.5 py-2 rounded-lg text-sm font-semibold text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 text-success" /> Marcar todos como lidos
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))
          ) : alertas?.length === 0 ? (
            <div className="glass-panel p-16 text-center rounded-2xl border-2 border-dashed border-border">
              <div className="bg-success/10 p-5 rounded-full w-fit mx-auto mb-4">
                <CheckCircle className="w-12 h-12 text-success opacity-80" />
              </div>
              <p className="text-lg font-display font-bold text-foreground">Central limpa</p>
              <p className="text-muted-foreground text-sm mt-1">Não há riscos detectados no momento.</p>
            </div>
          ) : (
            alertas?.map((alerta: any) => {
              const style = getAlertStyle(alerta.tipo);
              const Icon = style.icon;
              return (
                <div
                  key={alerta.id}
                  className={`glass-panel rounded-xl flex gap-4 p-4 border-l-4 ${style.borderColor} transition-all hover:-translate-y-0.5 ${!alerta.lido ? '' : 'opacity-60'}`}
                >
                  <div className={`${style.iconBg} ${style.iconColor} p-2.5 rounded-xl h-fit shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                        {style.label}
                      </span>
                      {!alerta.lido && (
                        <span className="bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">NOVO</span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${!alerta.lido ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>
                      {alerta.mensagem}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(alerta.criadoEm), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>

                  {!alerta.lido && (
                    <button className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-success hover:bg-success/10 px-3 py-1.5 rounded-lg transition-colors self-start">
                      <Check className="w-3.5 h-3.5" /> Lido
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
