import { Link } from "wouter";
import { ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center p-4">
      <ShieldAlert className="w-24 h-24 text-primary mb-8" />
      <h1 className="text-6xl font-display font-bold text-foreground mb-4 text-glow">404</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link href="/">
        <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl font-bold primary-glow transition-all hover:-translate-y-1">
          Voltar para o Início
        </button>
      </Link>
    </div>
  );
}
