import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "figma:asset/7ee78f5d7cdefaa460656923b505ad19fa2ebd2f.png";

export function Footer() {
  return (
    <footer className="bg-[#4B4B4B] text-[#F9F7F3] py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="FaithFlix Logo" 
                className="w-10 h-10 object-contain"
              />
              <span style={{ fontSize: '1.5rem', fontWeight: '600' }}>FaithFlix</span>
            </div>
            <p className="text-[#F9F7F3]/70 text-sm">
              Streaming com propósito. Conteúdo que inspira e fortalece sua fé.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4" style={{ fontSize: '1.125rem' }}>Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalogo" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Catálogo</Link></li>
              <li><Link to="/catalogo?filter=novidades" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Novidades</Link></li>
              <li><Link to="/catalogo?filter=categorias" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Categorias</Link></li>
              <li><Link to="/minha-conta?tab=lista" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Minha Lista</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4" style={{ fontSize: '1.125rem' }}>Sobre</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/sobre" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Quem Somos</Link></li>
              <li><Link to="/instituicoes" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Instituições</Link></li>
              <li><Link to="/planos" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Planos</Link></li>
              <li><Link to="/ajuda" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Ajuda</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4" style={{ fontSize: '1.125rem' }}>Legal</h4>
            <ul className="space-y-2 text-sm mb-6">
              <li><Link to="/termos" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Termos de Uso</Link></li>
              <li><Link to="/privacidade" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Privacidade</Link></li>
              <li><Link to="/cookies" className="text-[#F9F7F3]/70 hover:text-[#F0CD95] transition-colors">Cookies</Link></li>
            </ul>

            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F9F7F3]/10 flex items-center justify-center hover:bg-[#8DA385] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F9F7F3]/10 flex items-center justify-center hover:bg-[#8DA385] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F9F7F3]/10 flex items-center justify-center hover:bg-[#8DA385] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-[#F9F7F3]/10 flex items-center justify-center hover:bg-[#8DA385] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#F9F7F3]/10 text-center text-sm text-[#F9F7F3]/60">
          <p>© 2024 FaithFlix. Todos os direitos reservados.</p>
          <p className="mt-2">Desenvolvido por Matheus Bastos, Mateus Freitas, Davi Ribeiro, Kaue Silva</p>
        </div>
      </div>
    </footer>
  );
}
