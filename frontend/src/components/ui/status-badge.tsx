import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Clock, AlertTriangle, CheckCircle, HelpCircle, Archive, AlertCircle, PlayCircle, Loader2 } from "lucide-react";
import React from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type StatusType = 
  | "ativo" | "atencao" | "prazo_vencido" | "concluido" | "arquivado" // Processos
  | "ok" | "urgente" | "vencido" // Prazos
  | "pendente" | "em_andamento" | "atrasada" // Tarefas
  | "alta" | "media" | "baixa"; // Prioridade

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  // Processos
  ativo: { label: "Ativo", className: "bg-primary/10 text-primary border-primary/20", icon: PlayCircle },
  atencao: { label: "Atenção", className: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  prazo_vencido: { label: "Prazo Vencido", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  concluido: { label: "Concluído", className: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  arquivado: { label: "Arquivado", className: "bg-muted text-muted-foreground border-border", icon: Archive },
  
  // Prazos
  ok: { label: "No Prazo", className: "bg-primary/10 text-primary border-primary/20", icon: Clock },
  urgente: { label: "Urgente", className: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  vencido: { label: "Vencido", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  
  // Tarefas
  pendente: { label: "Pendente", className: "bg-muted text-muted-foreground border-border", icon: Clock },
  em_andamento: { label: "Em Andamento", className: "bg-primary/10 text-primary border-primary/20", icon: Loader2 },
  atrasada: { label: "Atrasada", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  
  // Prioridades
  alta: { label: "Alta Prioridade", className: "bg-destructive/10 text-destructive border-destructive/20", icon: AlertTriangle },
  media: { label: "Média Prioridade", className: "bg-warning/10 text-warning border-warning/20", icon: AlertCircle },
  baixa: { label: "Baixa Prioridade", className: "bg-muted text-muted-foreground border-border", icon: Clock },
};

export function getStatusColor(status: string) {
  const config = statusConfig[status?.toLowerCase()];
  if (!config) return "text-muted-foreground";
  if (config.className.includes("text-destructive")) return "text-destructive";
  if (config.className.includes("text-warning")) return "text-warning";
  if (config.className.includes("text-success")) return "text-success";
  if (config.className.includes("text-primary")) return "text-primary";
  return "text-muted-foreground";
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status?.toLowerCase()] || { 
    label: status ? status.replace(/_/g, ' ') : 'Desconhecido', 
    className: "bg-muted text-muted-foreground border-border",
    icon: HelpCircle
  };

  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.className,
      className
    )}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
