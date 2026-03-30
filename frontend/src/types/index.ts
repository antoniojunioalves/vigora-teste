// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserRole =
  | "owner"
  | "socio"
  | "coordenador"
  | "advogado"
  | "estagiario"
  | "financeiro";

export type UserStatus = "ativo" | "inativo";
export type ProcessoStatus = "ativo" | "arquivado" | "encerrado";
export type PrazoPrioridade = "baixa" | "media" | "alta" | "urgente";
export type PrazoStatus = "ok" | "atencao" | "critico" | "concluido";
export type TarefaStatus = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type AlertaTipo = "prazo_vencendo" | "prazo_vencido" | "tarefa_pendente" | "sistema";
export type ContatoStatus = "ativo" | "inativo";

// ─── Entidades ────────────────────────────────────────────────────────────────

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  role: UserRole;
  status: UserStatus;
  equipeId?: number;
  ultimoAcesso?: string;
  criadoEm: string;
}

export interface Equipe {
  id: number;
  nome: string;
  descricao?: string;
  cor: string;
  criadoEm: string;
}

export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  observacoes?: string;
  usuarioId: number;
  criadoEm: string;
}

export interface Processo {
  id: number;
  numeroProcesso: string;
  tribunal?: string;
  area?: string;
  status: ProcessoStatus;
  observacoes?: string;
  clienteId?: number;
  responsavelId?: number;
  usuarioId: number;
  criadoEm: string;
  cliente?: Cliente;
  proximoPrazo?: Prazo;
}

export interface Prazo {
  id: number;
  processoId?: number;
  tipo: string;
  descricao?: string;
  dataLimite: string;
  responsavel?: string;
  prioridade: PrazoPrioridade;
  status: PrazoStatus;
  usuarioId: number;
  criadoEm: string;
  processo?: Processo;
}

export interface Tarefa {
  id: number;
  titulo: string;
  descricao?: string;
  processoId?: number;
  prazoId?: number;
  responsavel?: string;
  dataLimite?: string;
  status: TarefaStatus;
  usuarioId: number;
  criadoEm: string;
}

export interface Alerta {
  id: number;
  tipo: AlertaTipo;
  mensagem: string;
  referenciaId?: number;
  referenciaTipo?: string;
  lido: boolean;
  usuarioId: number;
  criadoEm: string;
}

export interface ContatoWhatsapp {
  id: number;
  nome: string;
  numeroWhatsapp: string;
  email?: string;
  status: ContatoStatus;
  observacoes?: string;
  usuarioId: number;
  criadoEm: string;
  atualizadoEm: string;
}

// ─── Requests ────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  telefone?: string;
  senha: string;
}

export interface AuthResponse {
  user: Omit<Usuario, "role" | "status" | "equipeId" | "ultimoAcesso">;
  token: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  processosAtivos: number;
  prazosSemana: number;
  prazosHoje: number;
  prazosVencidos: number;
  taxaCumprimento: number;
  proximosPrazos: Prazo[];
  alertasCriticos: Alerta[];
}
