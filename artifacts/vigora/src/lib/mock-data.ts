
export const MOCK_CLIENTES = [
  { id: 1, nome: "Petrobras S/A", cpfCnpj: "33.000.167/0001-01", email: "juridico@petrobras.com.br", telefone: "(21) 3224-4477", criadoEm: "2023-03-15T10:00:00Z" },
  { id: 2, nome: "Dr. Roberto Almeida", cpfCnpj: "234.567.890-12", email: "roberto.almeida@gmail.com", telefone: "(11) 99876-5432", criadoEm: "2023-05-20T14:30:00Z" },
  { id: 3, nome: "Construções Vega Ltda", cpfCnpj: "12.345.678/0001-90", email: "adm@vegaconstrucoes.com.br", telefone: "(21) 3456-7890", criadoEm: "2023-07-08T09:00:00Z" },
  { id: 4, nome: "Família Mendonça", cpfCnpj: "345.678.901-23", email: "ana.mendonca@outlook.com", telefone: "(31) 98765-4321", criadoEm: "2023-08-12T11:00:00Z" },
  { id: 5, nome: "TechBrasil Inovações S/A", cpfCnpj: "45.678.901/0001-23", email: "legal@techbrasil.com.br", telefone: "(11) 3456-9900", criadoEm: "2024-01-10T08:00:00Z" },
  { id: 6, nome: "Maria Clara Ferreira", cpfCnpj: "567.890.123-45", email: "m.ferreira@email.com", telefone: "(41) 97654-3210", criadoEm: "2024-02-28T15:00:00Z" },
];

export const MOCK_PROCESSOS = [
  { id: 1, numeroProcesso: "0001234-56.2023.8.26.0100", tribunal: "TJSP", area: "Trabalhista", status: "ativo", observacoes: "Reclamação por horas extras e FGTS.", cliente: MOCK_CLIENTES[0], prazos: [], tarefas: [], criadoEm: "2023-03-15T10:00:00Z" },
  { id: 2, numeroProcesso: "0007890-12.2024.5.02.0001", tribunal: "TRT 2ª Região", area: "Previdenciário", status: "atencao", observacoes: "Aposentadoria por invalidez. Recurso em análise.", cliente: MOCK_CLIENTES[1], prazos: [], tarefas: [], criadoEm: "2024-01-18T14:00:00Z" },
  { id: 3, numeroProcesso: "0002345-67.2023.4.02.5001", tribunal: "TRF 2ª Região", area: "Tributário", status: "ativo", observacoes: "Discussão de créditos de PIS/COFINS.", cliente: MOCK_CLIENTES[4], prazos: [], tarefas: [], criadoEm: "2023-09-01T09:00:00Z" },
  { id: 4, numeroProcesso: "0005678-90.2022.8.26.0224", tribunal: "TJSP", area: "Cível", status: "prazo_vencido", observacoes: "Ação de cobrança. Aguardando penhora.", cliente: MOCK_CLIENTES[2], prazos: [], tarefas: [], criadoEm: "2022-11-20T10:30:00Z" },
  { id: 5, numeroProcesso: "0009012-34.2024.8.19.0100", tribunal: "TJMG", area: "Família", status: "ativo", observacoes: "Divórcio litigioso com disputa de guarda.", cliente: MOCK_CLIENTES[3], prazos: [], tarefas: [], criadoEm: "2024-03-05T11:00:00Z" },
  { id: 6, numeroProcesso: "0003456-78.2023.8.26.0100", tribunal: "TJSP", area: "Ambiental", status: "ativo", observacoes: "Licença ambiental contestada.", cliente: MOCK_CLIENTES[2], prazos: [], tarefas: [], criadoEm: "2023-06-14T08:30:00Z" },
  { id: 7, numeroProcesso: "0006789-01.2024.5.15.0001", tribunal: "TRT 15ª Região", area: "Trabalhista", status: "ativo", observacoes: "Dispensa sem justa causa. Indenização.", cliente: MOCK_CLIENTES[5], prazos: [], tarefas: [], criadoEm: "2024-02-10T13:00:00Z" },
  { id: 8, numeroProcesso: "0001111-22.2023.8.26.0332", tribunal: "TJSP", area: "Criminal", status: "atencao", observacoes: "Estelionato. Réu em liberdade provisória.", cliente: MOCK_CLIENTES[1], prazos: [], tarefas: [], criadoEm: "2023-10-30T16:00:00Z" },
];

export const MOCK_PRAZOS = [
  { id: 1, tipo: "Audiência de Instrução", dataLimite: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: "pendente", descricao: "Audiência de instrução e julgamento.", processo: MOCK_PROCESSOS[0], criadoEm: "2024-03-01T10:00:00Z" },
  { id: 2, tipo: "Prazo para Contestação", dataLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), status: "pendente", descricao: "Contestar petição inicial do TRF.", processo: MOCK_PROCESSOS[2], criadoEm: "2024-03-05T09:00:00Z" },
  { id: 3, tipo: "Recurso de Apelação", dataLimite: new Date(Date.now() + 0).toISOString(), status: "pendente", descricao: "Prazo para protocolo do recurso. HOJE!", processo: MOCK_PROCESSOS[3], criadoEm: "2024-02-20T08:00:00Z" },
  { id: 4, tipo: "Petição Complementar", dataLimite: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: "pendente", descricao: "Juntada de documentos complementares.", processo: MOCK_PROCESSOS[1], criadoEm: "2024-03-10T14:00:00Z" },
  { id: 5, tipo: "Alegações Finais", dataLimite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: "pendente", descricao: "Memoriais finais em fase de instrução.", processo: MOCK_PROCESSOS[4], criadoEm: "2024-03-08T11:00:00Z" },
  { id: 6, tipo: "Mandado de Segurança", dataLimite: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: "pendente", descricao: "Impetração do mandado — VENCIDO.", processo: MOCK_PROCESSOS[5], criadoEm: "2024-02-10T09:30:00Z" },
  { id: 7, tipo: "Apresentação de Defesa", dataLimite: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), status: "concluido", descricao: "Defesa apresentada com sucesso.", processo: MOCK_PROCESSOS[6], criadoEm: "2024-03-01T08:00:00Z" },
];

export const MOCK_TAREFAS = [
  { id: 1, titulo: "Revisar minuta de contestação — Vega Ltda", descricao: "Revisar antes de protocolo no TJSP.", status: "em_andamento", prioridade: "alta", processo: MOCK_PROCESSOS[3], criadoEm: "2024-03-12T09:00:00Z" },
  { id: 2, titulo: "Reunião de alinhamento — Petrobras", descricao: "Discutir estratégia de defesa trabalhista.", status: "pendente", prioridade: "alta", processo: MOCK_PROCESSOS[0], criadoEm: "2024-03-14T10:00:00Z" },
  { id: 3, titulo: "Protocolar recurso especial — Roberto Almeida", descricao: "Recurso especial já assinado, protocolar.", status: "concluida", prioridade: "alta", processo: MOCK_PROCESSOS[1], criadoEm: "2024-03-08T08:00:00Z" },
  { id: 4, titulo: "Atualizar base de cálculo trabalhista", descricao: "Corrigir planilha de cálculo de horas extras.", status: "em_andamento", prioridade: "media", processo: MOCK_PROCESSOS[6], criadoEm: "2024-03-10T11:00:00Z" },
  { id: 5, titulo: "Elaborar parecer tributário — TechBrasil", descricao: "Parecer sobre creditamento PIS/COFINS.", status: "pendente", prioridade: "baixa", processo: MOCK_PROCESSOS[2], criadoEm: "2024-03-15T14:00:00Z" },
  { id: 6, titulo: "Análise de contrato de locação", descricao: "Due diligence do contrato de locação comercial.", status: "pendente", prioridade: "media", processo: null, criadoEm: "2024-03-16T09:00:00Z" },
  { id: 7, titulo: "Intimar testemunhas para audiência", descricao: "Enviar carta de intimação para 3 testemunhas.", status: "concluida", prioridade: "alta", processo: MOCK_PROCESSOS[4], criadoEm: "2024-03-05T15:00:00Z" },
];

export const MOCK_ALERTAS = [
  { id: 1, mensagem: "CRÍTICO: Prazo de recurso de apelação vence HOJE — processo 0005678-90.2022.8.26.0224.", tipo: "prazo_vencendo", lido: false, criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), processo: MOCK_PROCESSOS[3] },
  { id: 2, mensagem: "Audiência de instrução em 2 dias — processo 0001234-56.2023.8.26.0100 (TJSP). Preparar documentos.", tipo: "prazo_urgente", lido: false, criadoEm: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), processo: MOCK_PROCESSOS[0] },
  { id: 3, mensagem: "Mandado de segurança vencido há 3 dias — processo 0003456-78.2023.8.26.0100. Verificar com urgência.", tipo: "prazo_vencido", lido: false, criadoEm: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), processo: MOCK_PROCESSOS[5] },
  { id: 4, mensagem: "3 processos sem movimentação há mais de 30 dias. Verificar andamento no PJe.", tipo: "processo_inativo", lido: true, criadoEm: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), processo: null },
  { id: 5, mensagem: "Nova publicação no Diário Oficial — TechBrasil Inovações. Processo tributário: 0002345-67.2023.4.02.5001.", tipo: "publicacao", lido: true, criadoEm: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), processo: MOCK_PROCESSOS[2] },
  { id: 6, mensagem: "Procuração ad judicia — Dr. Roberto Almeida — vence em 15 dias. Renovar antes do prazo.", tipo: "atencao", lido: true, criadoEm: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(), processo: null },
];

export const MOCK_DASHBOARD_STATS = {
  processosAtivos: 8,
  prazosSemana: 4,
  prazosHoje: 1,
  prazosVencidos: 2,
  tarefasPendentes: 3,
  taxaCumprimento: 87,
  proximosPrazos: MOCK_PRAZOS.slice(0, 5),
  alertasCriticos: MOCK_ALERTAS.filter(a => !a.lido).slice(0, 4),
};

export const MOCK_MONTHLY_ACTIVITY = [
  { mes: "Set", prazos: 12, concluidos: 11 },
  { mes: "Out", prazos: 18, concluidos: 15 },
  { mes: "Nov", prazos: 9, concluidos: 9 },
  { mes: "Dez", prazos: 14, concluidos: 12 },
  { mes: "Jan", prazos: 21, concluidos: 18 },
  { mes: "Fev", prazos: 16, concluidos: 14 },
  { mes: "Mar", prazos: 7, concluidos: 5 },
];

export const MOCK_COMPROMISSOS = [
  { id: 1, titulo: "Audiência de instrução — Petrobras", tipo: "prazo", responsavel: "Dr. Carlos Mendes", data: new Date(Date.now() + 2 * 86400000).toISOString(), status: "pendente", processo: MOCK_PROCESSOS[0] },
  { id: 2, titulo: "Reunião com cliente Roberto Almeida", tipo: "compromisso", responsavel: "Dra. Ana Rodrigues", data: new Date(Date.now() + 1 * 86400000).toISOString(), status: "pendente", processo: null },
  { id: 3, titulo: "Protocolar recurso especial — TJSP", tipo: "prazo", responsavel: "Dr. Ricardo Lima", data: new Date(Date.now() + 3 * 86400000).toISOString(), status: "pendente", processo: MOCK_PROCESSOS[3] },
  { id: 4, titulo: "Revisar minutas — TechBrasil", tipo: "tarefa", responsavel: "Dra. Juliana Costa", data: new Date(Date.now() + 5 * 86400000).toISOString(), status: "em_andamento", processo: MOCK_PROCESSOS[2] },
  { id: 5, titulo: "Perícia contábil — Construções Vega", tipo: "compromisso", responsavel: "Dr. Carlos Mendes", data: new Date(Date.now() + 7 * 86400000).toISOString(), status: "pendente", processo: MOCK_PROCESSOS[5] },
  { id: 6, titulo: "Apresentar parecer — Família Mendonça", tipo: "tarefa", responsavel: "Pedro Alves", data: new Date(Date.now() + 10 * 86400000).toISOString(), status: "pendente", processo: MOCK_PROCESSOS[4] },
];

export const MOCK_RECENT_ACTIVITY = [
  { id: 1, acao: "Prazo concluído", detalhe: "Defesa apresentada — Proc. 0006789-01", tempo: "há 1 hora", cor: "text-success" },
  { id: 2, acao: "Novo processo", detalhe: "Família Mendonça — Divórcio Litigioso adicionado", tempo: "há 3 horas", cor: "text-primary" },
  { id: 3, acao: "Alerta criado", detalhe: "Prazo vencendo — Recurso de Apelação TJSP", tempo: "há 5 horas", cor: "text-warning" },
  { id: 4, acao: "Tarefa concluída", detalhe: "Intimação de testemunhas realizada com sucesso", tempo: "há 8 horas", cor: "text-success" },
  { id: 5, acao: "Cliente adicionado", detalhe: "Maria Clara Ferreira cadastrada no sistema", tempo: "ontem", cor: "text-primary" },
];
