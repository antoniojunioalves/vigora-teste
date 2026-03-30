import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  Briefcase, Calendar, CheckSquare, Users, Bell, Settings, Shield,
  LogOut, Plus, Search, Menu, X, ShieldAlert, LayoutDashboard, ChevronDown, User, MessageCircle, Smartphone,
  Sun, Moon, CalendarDays, UserSquare, AlarmClock, DollarSign, Handshake, FileText, BarChart2
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { motion, AnimatePresence } from "framer-motion";
import { useListAlertas } from "@workspace/api-client-react";
import { AiAssistant } from "@/components/AiAssistant";

interface AppLayoutProps {
  children: ReactNode;
}

interface NavItem { icon: React.ElementType; label: string; href: string; hasBadge?: boolean }
interface NavGroup { label: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/" },
      { icon: Briefcase, label: "Processos", href: "/processos" },
      { icon: Calendar, label: "Prazos", href: "/prazos" },
      { icon: CheckSquare, label: "Tarefas", href: "/tarefas" },
      { icon: Users, label: "Clientes", href: "/clientes" },
      { icon: Shield, label: "Equipe", href: "/equipe" },
    ],
  },
  {
    label: "Módulos",
    items: [
      { icon: CalendarDays, label: "Agenda", href: "/agenda" },
      { icon: UserSquare, label: "Contatos", href: "/contatos" },
      { icon: AlarmClock, label: "Intimações", href: "/intimacoes" },
      { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
      { icon: Handshake, label: "Parceiros", href: "/parceiros" },
      { icon: FileText, label: "Modelos", href: "/modelos" },
      { icon: BarChart2, label: "Relatórios", href: "/relatorios" },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      { icon: Bell, label: "Alertas", href: "/alertas", hasBadge: true },
      { icon: MessageCircle, label: "WhatsApp", href: "/contatos-whatsapp" },
      { icon: Smartphone, label: "Notif. Processos", href: "/notificacoes-processos" },
    ],
  },
];

const allNavItems = NAV_GROUPS.flatMap(g => g.items);

function getHiddenHrefs(): string[] {
  try { return JSON.parse(localStorage.getItem("vigora_nav_hidden") || "[]"); } catch { return []; }
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [hiddenHrefs, setHiddenHrefs] = useState<string[]>(getHiddenHrefs);
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  const { data: alertas } = useListAlertas({ lido: false });
  const unreadAlerts = alertas?.length || 0;

  useEffect(() => {
    const handleClickOutside = () => {
      if (isUserMenuOpen || isQuickActionOpen) {
        setIsUserMenuOpen(false);
        setIsQuickActionOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isUserMenuOpen, isQuickActionOpen]);

  useEffect(() => {
    const onNavChanged = () => setHiddenHrefs(getHiddenHrefs());
    window.addEventListener("vigora_nav_changed", onNavChanged);
    window.addEventListener("storage", onNavChanged);
    return () => {
      window.removeEventListener("vigora_nav_changed", onNavChanged);
      window.removeEventListener("storage", onNavChanged);
    };
  }, []);

  const visibleNavGroups = NAV_GROUPS.map(group => ({
    ...group,
    items: group.items.filter(item => !hiddenHrefs.includes(item.href)),
  })).filter(group => group.items.length > 0);

  const pageTitle = allNavItems.find(item => location === item.href || (item.href !== "/" && location.startsWith(item.href)))?.label || "Dashboard";
  const userInitial = user?.nome?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">VIGORA</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/alertas" className="relative p-2 text-muted-foreground">
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />}
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-muted-foreground">
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobileMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed inset-y-0 left-0 z-40 w-60 sidebar flex flex-col md:relative md:translate-x-0"
          >
            {/* Logo */}
            <div className="px-5 pt-6 pb-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl gradient-blue flex items-center justify-center primary-glow shrink-0">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg text-foreground leading-none">VIGORA</div>
                    <div className="text-[9px] text-muted-foreground font-medium tracking-widest uppercase mt-0.5">Radar Jurídico</div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
              {visibleNavGroups.map(group => (
                <div key={group.label}>
                  <div className="nav-section-label">{group.label}</div>
                  {group.items.map((item) => {
                    const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
                    return (
                      <Link key={item.href} href={item.href}>
                        <div
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                        >
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1">{item.label}</span>
                          {item.hasBadge && unreadAlerts > 0 && (
                            <span className="bg-destructive text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                              {unreadAlerts}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom */}
            <div className="p-3 border-t border-[hsl(var(--sidebar-border))] space-y-0.5">
              <Link href="/configuracoes">
                <div className="nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Configurações</span>
                </div>
              </Link>
              <button
                onClick={logout}
                className="nav-item w-full text-left hover:!bg-destructive/10 hover:!text-destructive"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sair</span>
              </button>
              <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-[hsl(var(--sidebar-hover))]">
                <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.nome || 'Usuário'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 z-10 hidden md:flex shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{pageTitle}</span>
            </div>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar processos, clientes..."
                className="w-full bg-muted border border-border rounded-lg py-1.5 pl-8 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Action */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
                className="flex items-center gap-1.5 gradient-blue hover:opacity-90 text-white px-3.5 py-1.5 rounded-lg font-semibold text-sm transition-all primary-glow"
              >
                <Plus className="w-4 h-4" />
                Nova Ação
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              <AnimatePresence>
                {isQuickActionOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full right-0 mt-2 w-52 glass-panel rounded-xl p-1.5 z-50 shadow-xl"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Criar novo</div>
                    {[
                      { href: "/processos", icon: Briefcase, label: "Processo", color: "text-primary" },
                      { href: "/prazos", icon: Calendar, label: "Prazo", color: "text-warning" },
                      { href: "/tarefas", icon: CheckSquare, label: "Tarefa", color: "text-success" },
                      { href: "/clientes", icon: Users, label: "Cliente", color: "text-accent" },
                    ].map(item => (
                      <Link href={item.href} key={item.href}>
                        <span
                          className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted rounded-lg cursor-pointer text-sm font-medium text-foreground transition-colors"
                          onClick={() => setIsQuickActionOpen(false)}
                        >
                          <item.icon className={`w-4 h-4 ${item.color}`} /> {item.label}
                        </span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title={resolvedTheme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Alerts */}
            <Link href="/alertas" className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Link>

            <div className="w-px h-5 bg-border" />

            {/* User menu */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 hover:bg-muted p-1 pl-1 pr-2.5 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-xs">
                  {userInitial}
                </div>
                <span className="text-sm font-medium text-foreground hidden lg:block">{user?.nome?.split(' ')[0] || 'Usuário'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full right-0 mt-2 w-52 glass-panel rounded-xl p-1.5 z-50 shadow-xl"
                  >
                    <div className="px-2.5 py-2.5 border-b border-border mb-1.5">
                      <p className="text-sm font-bold text-foreground truncate">{user?.nome}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link href="/configuracoes">
                      <span className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-muted rounded-lg cursor-pointer text-sm font-medium text-foreground transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                        <Settings className="w-4 h-4" /> Configurações
                      </span>
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 hover:bg-destructive/10 text-destructive rounded-lg cursor-pointer text-sm font-medium transition-colors mt-0.5"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* AI Assistant — floating, global */}
      <AiAssistant />
    </div>
  );
}
