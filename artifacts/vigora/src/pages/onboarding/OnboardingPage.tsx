import { useState } from "react";
import { useLocation } from "wouter";
import {
  ShieldAlert, ChevronRight, Check, Search, Building2,
  User, Briefcase, ArrowRight, Sparkles
} from "lucide-react";

const STEPS = [
  { id: 1, label: "OAB", title: "Verificação da OAB" },
  { id: 2, label: "Escritório", title: "Seu Escritório" },
  { id: 3, label: "Pronto!", title: "Tudo configurado" },
];

const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC",
  "SP","SE","TO"
];

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);

  const [oab, setOab] = useState("");
  const [uf, setUf] = useState("SP");
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "found" | "not_found">("idle");
  const [oabData, setOabData] = useState<{ nome: string; situacao: string } | null>(null);

  const [escritorioNome, setEscritorioNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cidade, setCidade] = useState("");
  const [areaAtuacao, setAreaAtuacao] = useState("");

  const inputCls = "w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all";

  const handleOabSearch = () => {
    if (!oab.trim()) return;
    setSearchStatus("loading");
    setTimeout(() => {
      if (oab.length >= 4) {
        setSearchStatus("found");
        setOabData({ nome: "Dr. Carlos Mendes", situacao: "Inscrito Regular" });
      } else {
        setSearchStatus("not_found");
      }
    }, 1200);
  };

  const handleFinish = () => {
    localStorage.setItem("vigora_onboarding_done", "1");
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-xl text-foreground leading-none">VIGORA</div>
            <div className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">Radar Jurídico</div>
          </div>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.id ? "bg-primary text-white" :
                  step === s.id ? "border-2 border-primary text-primary" :
                  "border-2 border-border text-muted-foreground"
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[10px] font-medium ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-px mx-2 mb-5 ${step > s.id ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl p-7 shadow-2xl">
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Verificação da OAB</h2>
                <p className="text-sm text-muted-foreground mt-1">Informe seu número de inscrição na OAB para validar seu cadastro.</p>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Número OAB</label>
                  <input
                    value={oab}
                    onChange={e => { setOab(e.target.value); setSearchStatus("idle"); setOabData(null); }}
                    className={inputCls}
                    placeholder="Ex: 123456"
                    onKeyDown={e => e.key === "Enter" && handleOabSearch()}
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">UF</label>
                  <select value={uf} onChange={e => setUf(e.target.value)} className={`${inputCls} appearance-none`}>
                    {ESTADOS_BR.map(e => <option key={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleOabSearch}
                disabled={searchStatus === "loading" || !oab.trim()}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
              >
                {searchStatus === "loading" ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Consultando...</>
                ) : (
                  <><Search className="w-4 h-4" /> Consultar OAB</>
                )}
              </button>

              {searchStatus === "found" && oabData && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-500">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-semibold">Inscrição encontrada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">{oabData.nome}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">OAB/{uf} {oab} — {oabData.situacao}</span>
                  </div>
                </div>
              )}

              {searchStatus === "not_found" && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                  <p className="text-sm text-destructive">Número de OAB não encontrado. Verifique e tente novamente.</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={searchStatus !== "found"}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setStep(2)} className="px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground font-medium hover:bg-muted transition-colors">
                  Pular
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-display font-bold text-foreground">Dados do Escritório</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure as informações básicas do seu escritório para personalizar a plataforma.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Nome do Escritório *</label>
                  <input value={escritorioNome} onChange={e => setEscritorioNome(e.target.value)} className={inputCls} placeholder="Ex: Mendes & Associados Advogados" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">CNPJ</label>
                    <input value={cnpj} onChange={e => setCnpj(e.target.value)} className={inputCls} placeholder="00.000.000/0001-00" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Cidade</label>
                    <input value={cidade} onChange={e => setCidade(e.target.value)} className={inputCls} placeholder="São Paulo, SP" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 uppercase tracking-wider">Área de Atuação Principal</label>
                  <select value={areaAtuacao} onChange={e => setAreaAtuacao(e.target.value)} className={`${inputCls} appearance-none`}>
                    <option value="">Selecione...</option>
                    <option>Cível</option>
                    <option>Trabalhista</option>
                    <option>Criminal</option>
                    <option>Tributário</option>
                    <option>Empresarial</option>
                    <option>Família e Sucessões</option>
                    <option>Previdenciário</option>
                    <option>Ambiental</option>
                    <option>Múltiplas áreas</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="px-4 py-3 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!escritorioNome.trim()}
                  className="flex-1 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setStep(3)} className="px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground font-medium hover:bg-muted transition-colors">
                  Pular
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}>
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Tudo pronto!</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {escritorioNome ? `Bem-vindo ao VIGORA, ${escritorioNome}!` : "Bem-vindo ao VIGORA!"}<br />
                  Nunca mais perca um prazo.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                {[
                  { icon: Briefcase, label: "Gestão de Processos", desc: "Monitore todos os processos em tempo real" },
                  { icon: Building2, label: "Controle de Prazos", desc: "Alertas automáticos antes do vencimento" },
                ].map(f => (
                  <div key={f.label} className="bg-muted/50 border border-border/50 rounded-xl p-4">
                    <f.icon className="w-5 h-5 text-primary mb-2" />
                    <p className="text-xs font-semibold text-foreground">{f.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg, #2A34D4, #6670F0)" }}
              >
                Acessar o Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          VIGORA © {new Date().getFullYear()} — Plataforma Jurídica Inteligente
        </p>
      </div>
    </div>
  );
}
