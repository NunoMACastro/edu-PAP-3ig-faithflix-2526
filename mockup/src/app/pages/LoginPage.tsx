import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import logo from "figma:asset/7ee78f5d7cdefaa460656923b505ad19fa2ebd2f.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar lógica de autenticação real
    console.log("Login:", { email, password, rememberMe });
    // Por enquanto, redireciona para a página inicial
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F9F7F3] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img 
              src={logo} 
              alt="FaithFlix Logo" 
              className="w-16 h-16 object-contain"
            />
            <span className="text-[#4B4B4B]" style={{ fontSize: '2rem', fontWeight: '600' }}>FaithFlix</span>
          </Link>
          <h1 className="text-[#4B4B4B] mb-2">Bem-vindo de volta</h1>
          <p className="text-[#4B4B4B]/70">Entre na sua conta para continuar</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#4B4B4B]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#F9F7F3] border-[#BFBFBF]/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#4B4B4B]">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#F9F7F3] border-[#BFBFBF]/30"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm text-[#4B4B4B] cursor-pointer"
                >
                  Lembrar de mim
                </Label>
              </div>
              <Link 
                to="/recuperar-senha" 
                className="text-sm text-[#8DA385] hover:text-[#7a8f74] transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <Button 
              type="submit"
              className="w-full bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
            >
              Entrar
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#BFBFBF]/30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-[#4B4B4B]/60">ou</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                type="button"
                variant="outline"
                className="w-full border-[#BFBFBF]/30"
                onClick={() => console.log("Login com Google")}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </Button>

              <Button 
                type="button"
                variant="outline"
                className="w-full border-[#BFBFBF]/30"
                onClick={() => console.log("Login com Facebook")}
              >
                <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continuar com Facebook
              </Button>
            </div>

            <div className="text-center text-sm text-[#4B4B4B]/70 mt-6">
              Não tem uma conta?{" "}
              <Link 
                to="/registro" 
                className="text-[#8DA385] hover:text-[#7a8f74] transition-colors"
              >
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link 
            to="/" 
            className="text-sm text-[#4B4B4B]/60 hover:text-[#8DA385] transition-colors"
          >
            ← Voltar para a página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
