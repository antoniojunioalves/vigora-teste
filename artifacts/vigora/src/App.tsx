import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/auth/Login";
import Cadastro from "@/pages/auth/Cadastro";
import Dashboard from "@/pages/dashboard/Dashboard";
import ProcessosList from "@/pages/processos/ProcessosList";
import ProcessoDetail from "@/pages/processos/ProcessoDetail";
import PrazosList from "@/pages/prazos/PrazosList";
import ClientesList from "@/pages/clientes/ClientesList";
import TarefasList from "@/pages/tarefas/TarefasList";
import AlertasList from "@/pages/alertas/AlertasList";
import Configuracoes from "@/pages/configuracoes/Configuracoes";
import ContatosWhatsapp from "@/pages/contatos-whatsapp/ContatosWhatsapp";
import NotificacoesProcessos from "@/pages/notificacoes-processos/NotificacoesProcessos";
import EquipePage from "@/pages/equipe/EquipePage";
import AgendaPage from "@/pages/agenda/AgendaPage";
import ContatosPage from "@/pages/contatos/ContatosPage";
import IntimacoesPage from "@/pages/intimacoes/IntimacoesPage";
import FinanceiroPage from "@/pages/financeiro/FinanceiroPage";
import ParceirosPage from "@/pages/parceiros/ParceirosPage";
import ModelosPage from "@/pages/modelos/ModelosPage";
import RelatoriosPage from "@/pages/relatorios/RelatoriosPage";
import NotFound from "@/pages/not-found";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";

// Inject fetch interceptor
import "@/lib/fetch-interceptor";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Carregando...</div>;
  if (!user) return <Login />;

  const onboardingDone = localStorage.getItem("vigora_onboarding_done");
  if (!onboardingDone) return <Redirect to="/onboarding" />;
  
  return <Component />;
}


function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/cadastro" component={Cadastro} />
      <Route path="/onboarding" component={OnboardingPage} />
      
      {/* Protected Routes */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/processos" component={() => <ProtectedRoute component={ProcessosList} />} />
      <Route path="/processos/:id" component={() => <ProtectedRoute component={ProcessoDetail} />} />
      <Route path="/prazos" component={() => <ProtectedRoute component={PrazosList} />} />
      <Route path="/clientes" component={() => <ProtectedRoute component={ClientesList} />} />
      {/* Placeholder for cliente detail mapping to list for now to ensure no hard fail without real page built */}
      <Route path="/clientes/:id" component={() => <ProtectedRoute component={ClientesList} />} /> 
      <Route path="/tarefas" component={() => <ProtectedRoute component={TarefasList} />} />
      <Route path="/alertas" component={() => <ProtectedRoute component={AlertasList} />} />
      
      <Route path="/equipe" component={() => <ProtectedRoute component={EquipePage} />} />
      <Route path="/contatos-whatsapp" component={() => <ProtectedRoute component={ContatosWhatsapp} />} />
      <Route path="/notificacoes-processos" component={() => <ProtectedRoute component={NotificacoesProcessos} />} />
      <Route path="/configuracoes" component={() => <ProtectedRoute component={Configuracoes} />} />
      <Route path="/perfil" component={() => <ProtectedRoute component={Configuracoes} />} />
      <Route path="/agenda" component={() => <ProtectedRoute component={AgendaPage} />} />
      <Route path="/contatos" component={() => <ProtectedRoute component={ContatosPage} />} />
      <Route path="/intimacoes" component={() => <ProtectedRoute component={IntimacoesPage} />} />
      <Route path="/financeiro" component={() => <ProtectedRoute component={FinanceiroPage} />} />
      <Route path="/parceiros" component={() => <ProtectedRoute component={ParceirosPage} />} />
      <Route path="/modelos" component={() => <ProtectedRoute component={ModelosPage} />} />
      <Route path="/relatorios" component={() => <ProtectedRoute component={RelatoriosPage} />} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
