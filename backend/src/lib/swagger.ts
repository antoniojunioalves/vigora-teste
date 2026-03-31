export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "VIGORA API",
    version: "1.0.0",
    description:
      "API da plataforma de gestão jurídica VIGORA — SaaS para advogados e escritórios.",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Desenvolvimento",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Usuario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          email: { type: "string", format: "email" },
          telefone: { type: "string", nullable: true },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/Usuario" },
          token: { type: "string" },
        },
      },
      Cliente: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          cpfCnpj: { type: "string", nullable: true },
          telefone: { type: "string", nullable: true },
          email: { type: "string", nullable: true },
          observacoes: { type: "string", nullable: true },
          usuarioId: { type: "integer" },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      Processo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          numeroProcesso: { type: "string" },
          tribunal: { type: "string", nullable: true },
          area: { type: "string", nullable: true },
          status: { type: "string", default: "ativo" },
          observacoes: { type: "string", nullable: true },
          clienteId: { type: "integer", nullable: true },
          responsavelId: { type: "integer", nullable: true },
          usuarioId: { type: "integer" },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      Prazo: {
        type: "object",
        properties: {
          id: { type: "integer" },
          processoId: { type: "integer", nullable: true },
          tipo: { type: "string" },
          descricao: { type: "string", nullable: true },
          dataLimite: { type: "string", format: "date" },
          responsavel: { type: "string", nullable: true },
          prioridade: {
            type: "string",
            enum: ["baixa", "media", "alta", "urgente"],
            default: "media",
          },
          status: {
            type: "string",
            enum: ["ok", "proximo", "vencido"],
            default: "ok",
          },
          usuarioId: { type: "integer" },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      Tarefa: {
        type: "object",
        properties: {
          id: { type: "integer" },
          titulo: { type: "string" },
          descricao: { type: "string", nullable: true },
          processoId: { type: "integer", nullable: true },
          prazoId: { type: "integer", nullable: true },
          responsavel: { type: "string", nullable: true },
          dataLimite: { type: "string", format: "date", nullable: true },
          status: {
            type: "string",
            enum: ["pendente", "em_andamento", "concluida"],
            default: "pendente",
          },
          usuarioId: { type: "integer" },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      Alerta: {
        type: "object",
        properties: {
          id: { type: "integer" },
          tipo: { type: "string" },
          mensagem: { type: "string" },
          lido: { type: "boolean" },
          usuarioId: { type: "integer" },
          criadoEm: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          message: { type: "string" },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/healthz": {
      get: {
        tags: ["Sistema"],
        summary: "Health check",
        security: [],
        responses: {
          "200": {
            description: "Serviço funcionando",
            content: {
              "application/json": {
                schema: { type: "object", properties: { status: { type: "string" } } },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", format: "email" },
                  senha: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Login realizado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          "400": { description: "Campos obrigatórios faltando" },
          "401": { description: "Credenciais inválidas" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Cadastro de novo usuário",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha"],
                properties: {
                  nome: { type: "string" },
                  email: { type: "string", format: "email" },
                  telefone: { type: "string" },
                  senha: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Usuário criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          "400": { description: "Dados inválidos ou email já em uso" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Dados do usuário logado",
        responses: {
          "200": {
            description: "Usuário autenticado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Usuario" } },
            },
          },
          "401": { description: "Não autorizado" },
        },
      },
    },
    "/api/clientes": {
      get: {
        tags: ["Clientes"],
        summary: "Lista clientes",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Filtro por nome",
          },
        ],
        responses: {
          "200": {
            description: "Lista de clientes",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Cliente" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Clientes"],
        summary: "Cria cliente",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome"],
                properties: {
                  nome: { type: "string" },
                  cpfCnpj: { type: "string" },
                  telefone: { type: "string" },
                  email: { type: "string", format: "email" },
                  observacoes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Cliente criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Cliente" } },
            },
          },
        },
      },
    },
    "/api/clientes/{id}": {
      get: {
        tags: ["Clientes"],
        summary: "Detalhe do cliente",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Cliente com processos e prazos",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          "404": { description: "Cliente não encontrado" },
        },
      },
      put: {
        tags: ["Clientes"],
        summary: "Atualiza cliente",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  nome: { type: "string" },
                  cpfCnpj: { type: "string" },
                  telefone: { type: "string" },
                  email: { type: "string" },
                  observacoes: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Cliente atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Cliente" } } },
          },
          "404": { description: "Cliente não encontrado" },
        },
      },
      delete: {
        tags: ["Clientes"],
        summary: "Remove cliente",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Removido com sucesso" },
        },
      },
    },
    "/api/processos": {
      get: {
        tags: ["Processos"],
        summary: "Lista processos",
        responses: {
          "200": {
            description: "Lista de processos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Processo" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Processos"],
        summary: "Cria processo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["numeroProcesso"],
                properties: {
                  numeroProcesso: { type: "string" },
                  tribunal: { type: "string" },
                  area: { type: "string" },
                  status: { type: "string", default: "ativo" },
                  observacoes: { type: "string" },
                  clienteId: { type: "integer" },
                  responsavelId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Processo criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Processo" } },
            },
          },
        },
      },
    },
    "/api/processos/{id}": {
      get: {
        tags: ["Processos"],
        summary: "Detalhe do processo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Processo encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Processo" } } },
          },
          "404": { description: "Processo não encontrado" },
        },
      },
      put: {
        tags: ["Processos"],
        summary: "Atualiza processo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  numeroProcesso: { type: "string" },
                  tribunal: { type: "string" },
                  area: { type: "string" },
                  status: { type: "string" },
                  observacoes: { type: "string" },
                  clienteId: { type: "integer" },
                  responsavelId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Processo atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Processo" } } },
          },
          "404": { description: "Processo não encontrado" },
        },
      },
      delete: {
        tags: ["Processos"],
        summary: "Remove processo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Removido com sucesso" },
        },
      },
    },
    "/api/prazos": {
      get: {
        tags: ["Prazos"],
        summary: "Lista prazos",
        responses: {
          "200": {
            description: "Lista de prazos",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Prazo" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Prazos"],
        summary: "Cria prazo",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tipo", "dataLimite"],
                properties: {
                  processoId: { type: "integer" },
                  tipo: { type: "string" },
                  descricao: { type: "string" },
                  dataLimite: { type: "string", format: "date" },
                  responsavel: { type: "string" },
                  prioridade: { type: "string", enum: ["baixa", "media", "alta", "urgente"] },
                  status: { type: "string", enum: ["ok", "proximo", "vencido"] },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Prazo criado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Prazo" } } },
          },
        },
      },
    },
    "/api/prazos/{id}": {
      get: {
        tags: ["Prazos"],
        summary: "Detalhe do prazo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Prazo encontrado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Prazo" } } },
          },
          "404": { description: "Prazo não encontrado" },
        },
      },
      put: {
        tags: ["Prazos"],
        summary: "Atualiza prazo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tipo: { type: "string" },
                  descricao: { type: "string" },
                  dataLimite: { type: "string", format: "date" },
                  responsavel: { type: "string" },
                  prioridade: { type: "string" },
                  status: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Prazo atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Prazo" } } },
          },
          "404": { description: "Prazo não encontrado" },
        },
      },
      delete: {
        tags: ["Prazos"],
        summary: "Remove prazo",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Removido com sucesso" },
        },
      },
    },
    "/api/tarefas": {
      get: {
        tags: ["Tarefas"],
        summary: "Lista tarefas",
        responses: {
          "200": {
            description: "Lista de tarefas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Tarefa" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tarefas"],
        summary: "Cria tarefa",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["titulo"],
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  processoId: { type: "integer" },
                  prazoId: { type: "integer" },
                  responsavel: { type: "string" },
                  dataLimite: { type: "string", format: "date" },
                  status: { type: "string", enum: ["pendente", "em_andamento", "concluida"] },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Tarefa criada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Tarefa" } } },
          },
        },
      },
    },
    "/api/tarefas/{id}": {
      put: {
        tags: ["Tarefas"],
        summary: "Atualiza tarefa",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  responsavel: { type: "string" },
                  dataLimite: { type: "string", format: "date" },
                  status: { type: "string", enum: ["pendente", "em_andamento", "concluida"] },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Tarefa atualizada",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Tarefa" } } },
          },
        },
      },
      delete: {
        tags: ["Tarefas"],
        summary: "Remove tarefa",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "204": { description: "Removido com sucesso" },
        },
      },
    },
    "/api/alertas": {
      get: {
        tags: ["Alertas"],
        summary: "Lista alertas",
        responses: {
          "200": {
            description: "Lista de alertas",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Alerta" } },
              },
            },
          },
        },
      },
    },
    "/api/alertas/marcar-todos-lidos": {
      put: {
        tags: ["Alertas"],
        summary: "Marca todos alertas como lidos",
        responses: {
          "200": { description: "Todos os alertas marcados como lidos" },
        },
      },
    },
    "/api/alertas/{id}/lido": {
      put: {
        tags: ["Alertas"],
        summary: "Marca alerta como lido",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
        responses: {
          "200": {
            description: "Alerta atualizado",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Alerta" } } },
          },
          "404": { description: "Alerta não encontrado" },
        },
      },
    },
    "/api/dashboard/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Estatísticas do dashboard",
        responses: {
          "200": {
            description: "Estatísticas gerais",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalClientes: { type: "integer" },
                    totalProcessos: { type: "integer" },
                    prazosProximos: { type: "integer" },
                    tarefasPendentes: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/equipe/membros": {
      get: {
        tags: ["Equipe"],
        summary: "Lista membros da equipe",
        responses: {
          "200": {
            description: "Lista de membros",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Usuario" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Equipe"],
        summary: "Adiciona membro",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha"],
                properties: {
                  nome: { type: "string" },
                  email: { type: "string", format: "email" },
                  senha: { type: "string" },
                  telefone: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["owner", "socio", "coordenador", "advogado", "estagiario", "financeiro"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Membro adicionado" },
        },
      },
    },
    "/api/equipe/times": {
      get: {
        tags: ["Equipe"],
        summary: "Lista times",
        responses: {
          "200": {
            description: "Lista de times",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: { type: "integer" },
                      nome: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Equipe"],
        summary: "Cria time",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome"],
                properties: { nome: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Time criado" },
        },
      },
    },
  },
};