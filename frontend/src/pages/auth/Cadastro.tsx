import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ShieldAlert, ArrowRight, Loader2 } from "lucide-react";
import { useRegister } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const registerSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Cadastro() {
  const { login } = useAuth();
  const { toast } = useToast();
  const registerMutation = useRegister();
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const response = await registerMutation.mutateAsync({ data });
      login(response.token, response.user);
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo à plataforma VIGORA.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.message || "Email já está em uso ou dados inválidos.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Visual branding matches Login */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}images/auth-bg.png`} 
            alt="Arquitetura institucional" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3 text-primary font-display font-bold text-3xl">
          <div className="bg-primary/20 p-2.5 rounded-2xl backdrop-blur-md border border-primary/30">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          VIGORA
        </div>
        
        <div className="relative z-10 max-w-lg mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="text-5xl font-display font-bold text-foreground leading-tight mb-6 text-glow">
              O fim dos prazos perdidos.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Junte-se a milhares de advogados que dormem tranquilos sabendo que suas operações estão blindadas.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="glass-panel p-8 sm:p-10 rounded-3xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Criar conta</h2>
              <p className="text-muted-foreground">Preencha seus dados para começar.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome Completo</label>
                <input 
                  {...register("nome")}
                  type="text"
                  placeholder="Dr. João Silva"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                {errors.nome && <p className="text-xs text-destructive mt-1">{errors.nome.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input 
                  {...register("email")}
                  type="email"
                  placeholder="advogado@escritorio.com.br"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Telefone (Opcional)</label>
                <input 
                  {...register("telefone")}
                  type="tel"
                  placeholder="(11) 99999-9999"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Senha</label>
                <input 
                  {...register("senha")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
                />
                {errors.senha && <p className="text-xs text-destructive mt-1">{errors.senha.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={registerMutation.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl mt-6 transition-all duration-200 primary-glow flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Criando conta...</>
                ) : (
                  <>Criar Conta Segura</>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Já possui uma conta?{' '}
              <Link href="/login">
                <span className="text-primary hover:underline font-semibold cursor-pointer">Acessar sistema</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
