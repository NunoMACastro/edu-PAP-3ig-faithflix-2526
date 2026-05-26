import { Search, Bell, User, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "figma:asset/7ee78f5d7cdefaa460656923b505ad19fa2ebd2f.png";

export function Header() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/busca?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="FaithFlix Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-foreground" style={{ fontSize: '1.5rem', fontWeight: '600' }}>FaithFlix</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/catalogo" className="text-foreground hover:text-primary transition-colors">Catálogo</Link>
            <Link to="/instituicoes" className="text-foreground hover:text-primary transition-colors">Instituições</Link>
            <Link to="/planos" className="text-foreground hover:text-primary transition-colors">Planos</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 bg-card rounded-lg px-3 py-2 border">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar filmes e séries..."
                className="border-0 focus-visible:ring-0 p-0 h-auto w-48 bg-transparent text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex text-foreground"
              onClick={() => navigate('/notificacoes')}
            >
              <Bell className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground"
              onClick={() => navigate('/minha-conta')}
            >
              <User className="w-5 h-5" />
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate('/planos')}
            >
              Assinar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}