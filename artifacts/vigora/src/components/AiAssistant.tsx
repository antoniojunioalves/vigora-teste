import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Minimize2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Mock AI Responses ────────────────────────────────────────────────────────

const INITIAL_MESSAGE: Message = {
  id: 0,
  role: "assistant",
  content: "Olá! Sou a VIGI, sua assistente jurídica virtual. Posso ajudar com dúvidas sobre prazos processuais, organização de processos, direito processual e muito mais. Como posso ajudar?",
  timestamp: new Date(),
};

function generateResponse(input: string): string {
  const q = input.toLowerCase();

  if (/prazo|vencimento|recurso/i.test(q)) {
    return "Os prazos processuais são contados em dias úteis conforme o CPC (art. 219). Para recursos, o prazo-padrão é de 15 dias. Sempre verifique a intimação para o prazo específico do seu caso. Posso ajudar a cadastrar esse prazo no sistema agora?";
  }
  if (/apelação|apelar/i.test(q)) {
    return "O prazo para interposição de apelação é de 15 dias úteis a partir da intimação da sentença (art. 1.003, §5º, CPC). Certifique-se de apresentar as razões no mesmo momento ou em prazo posterior conforme previsto no edital.";
  }
  if (/recurso especial|resp/i.test(q)) {
    return "O Recurso Especial (REsp) tem prazo de 15 dias úteis. Exige demonstração de violação de lei federal ou divergência jurisprudencial entre tribunais (art. 105, III, CF). Lembre-se: o prequestionamento é essencial.";
  }
  if (/contestação|contestar/i.test(q)) {
    return "O prazo para contestação é de 15 dias úteis (regra geral, CPC art. 335). Para entes públicos, o prazo é em dobro (30 dias úteis). Apresente todas as preliminares e o mérito de forma organizada.";
  }
  if (/audiência|designar/i.test(q)) {
    return "Audiências devem ser agendadas com no mínimo 30 dias de antecedência para as partes se prepararem. No sistema VIGORA, você pode registrar a audiência em 'Prazos' com o tipo 'Audiência' para receber alertas automáticos.";
  }
  if (/cliente|cadastrar/i.test(q)) {
    return "Para cadastrar um novo cliente, acesse o menu 'Clientes' no painel lateral e clique em 'Novo Cliente'. Preencha CPF/CNPJ, dados de contato e observações relevantes. Isso facilita vincular processos futuros.";
  }
  if (/processo|petição inicial/i.test(q)) {
    return "Acesse 'Processos' no menu lateral e clique em 'Novo Processo'. Preencha o número no formato CNJ (NNNNNNN-DD.AAAA.J.TT.OOOO), tribunal, área e cliente. O VIGORA monitora automaticamente o andamento.";
  }
  if (/tarefa|atividade/i.test(q)) {
    return "O quadro de tarefas no VIGORA segue a metodologia Kanban com colunas 'A Fazer', 'Em Andamento' e 'Concluídas'. Você pode vincular tarefas a processos e prazos para manter tudo organizado.";
  }
  if (/alerta|notificação/i.test(q)) {
    return "O VIGORA envia alertas automáticos para prazos que vencem em 7 dias, 3 dias, 1 dia e no dia do vencimento. Acesse 'Alertas' no menu para visualizar e gerenciar todas as notificações.";
  }
  if (/habeas corpus|hc/i.test(q)) {
    return "O Habeas Corpus não tem prazo para impetração — pode ser apresentado a qualquer tempo enquanto durar a ameaça ou coação à liberdade. Deve ser dirigido ao tribunal competente conforme a autoridade coatora.";
  }
  if (/mandado de segurança|ms/i.test(q)) {
    return "O Mandado de Segurança tem prazo decadencial de 120 dias contados da ciência do ato coator (Lei 12.016/2009, art. 23). Atenção: esse prazo é decadencial, não processual, e não se suspende ou interrompe.";
  }
  if (/honorários|advocatícios/i.test(q)) {
    return "Os honorários advocatícios sucumbenciais devem ser fixados entre 10% e 20% sobre o valor da condenação (CPC art. 85). Em causas contra a Fazenda Pública, há tabela escalonada. Os honorários pertencem ao advogado, não à parte.";
  }
  if (/tutela|liminar|urgência/i.test(q)) {
    return "A tutela de urgência (CPC art. 300) exige: (1) probabilidade do direito — fumus boni iuris; e (2) perigo de dano ou risco ao resultado útil do processo — periculum in mora. Pode ser cautelar ou antecipada.";
  }
  if (/olá|oi|bom dia|boa tarde|boa noite|hello/i.test(q)) {
    return "Olá! Fico feliz em ajudar! Sou especializada em questões processuais e organização jurídica. Pode me perguntar sobre prazos, recursos, petições, gestão de processos ou como usar o VIGORA. 😊";
  }
  if (/obrigado|obrigada|valeu|thanks/i.test(q)) {
    return "Fico feliz em ajudar! Se tiver mais dúvidas sobre processos, prazos ou o sistema VIGORA, é só perguntar. Bom trabalho!";
  }

  return "Entendi sua pergunta. Para uma resposta mais precisa, recomendo consultar a legislação aplicável ou um colega especialista na área. Posso ajudar com dúvidas sobre prazos processuais, recursos, gestão de processos no VIGORA ou organização de tarefas. Pode reformular sua pergunta?";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen, messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateResponse(text);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-13 h-13 rounded-2xl shadow-2xl flex items-center justify-center primary-glow"
        style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)", width: 52, height: 52 }}
        title="Assistente Virtual VIGI"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.3 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxWidth: "calc(100vw - 3rem)" }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-border flex items-center gap-3" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">VIGI — Assistente Jurídico</p>
                <p className="text-[10px] text-white/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  Online · Resposta imediata
                </p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <Minimize2 className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" ? (
                    <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-muted shrink-0 flex items-center justify-center mt-0.5">
                      <User className="w-3 h-3 text-muted-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-muted text-foreground rounded-tl-none"
                      : "text-white rounded-tr-none"
                  }`} style={msg.role === "user" ? { background: "linear-gradient(135deg, #2A34D4, #6670F0)" } : {}}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-muted rounded-xl rounded-tl-none px-3 py-2.5 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {["Prazo de contestação", "Honorários advocatícios", "Tutela de urgência", "Cadastrar processo"].map(q => (
                  <button key={q} onClick={() => { setInput(q); setTimeout(send, 50); }}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full border border-border bg-muted hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-muted-foreground transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 py-3 border-t border-border flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Pergunte algo jurídico..."
                className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-foreground placeholder:text-muted-foreground/60"
              />
              <button
                onClick={send}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 shrink-0"
                style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
