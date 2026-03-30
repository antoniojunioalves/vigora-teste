import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import clientesRouter from "./clientes.js";
import processosRouter from "./processos.js";
import prazosRouter from "./prazos.js";
import tarefasRouter from "./tarefas.js";
import alertasRouter from "./alertas.js";
import dashboardRouter from "./dashboard.js";
import contatosWhatsappRouter from "./contatos-whatsapp.js";
import notificacoesProcessosRouter from "./notificacoes-processos.js";
import equipeRouter from "./equipe.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/clientes", clientesRouter);
router.use("/processos", processosRouter);
router.use("/prazos", prazosRouter);
router.use("/tarefas", tarefasRouter);
router.use("/alertas", alertasRouter);
router.use("/dashboard", dashboardRouter);
router.use("/contatos-whatsapp", contatosWhatsappRouter);
router.use("/notificacoes-processos", notificacoesProcessosRouter);
router.use("/equipe", equipeRouter);

export default router;
