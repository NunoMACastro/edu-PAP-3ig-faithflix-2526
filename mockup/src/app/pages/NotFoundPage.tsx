import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Home, Search, AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-[#D16449]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-16 h-16 text-[#D16449]" />
            </div>
            <h1 className="text-[#4B4B4B] mb-2" style={{ fontSize: '4rem' }}>404</h1>
            <h2 className="text-[#4B4B4B] mb-4">Página Não Encontrada</h2>
            <p className="text-[#4B4B4B]/70 mb-8">
              Desculpe, a página que você está procurando não existe ou foi movida.
              Verifique se o endereço está correto ou volte para a página inicial.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => navigate('/')}
              className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Voltar para Página Inicial
            </Button>
            <Button 
              onClick={() => navigate('/busca')}
              variant="outline"
              className="border-[#BFBFBF] hover:bg-[#F0CD95] hover:border-[#F0CD95]"
              size="lg"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar Conteúdo
            </Button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
            <h3 className="text-[#4B4B4B] mb-6">Links Rápidos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate('/catalogo')}
                className="p-4 text-center rounded-lg bg-[#F9F7F3] hover:bg-[#8DA385]/10 transition-colors group"
              >
                <div className="text-[#4B4B4B] group-hover:text-[#8DA385]">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span className="text-sm">Catálogo</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/planos')}
                className="p-4 text-center rounded-lg bg-[#F9F7F3] hover:bg-[#8DA385]/10 transition-colors group"
              >
                <div className="text-[#4B4B4B] group-hover:text-[#8DA385]">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Planos</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/instituicoes')}
                className="p-4 text-center rounded-lg bg-[#F9F7F3] hover:bg-[#8DA385]/10 transition-colors group"
              >
                <div className="text-[#4B4B4B] group-hover:text-[#8DA385]">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm">Instituições</span>
                </div>
              </button>

              <button
                onClick={() => navigate('/minha-conta')}
                className="p-4 text-center rounded-lg bg-[#F9F7F3] hover:bg-[#8DA385]/10 transition-colors group"
              >
                <div className="text-[#4B4B4B] group-hover:text-[#8DA385]">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-sm">Minha Conta</span>
                </div>
              </button>
            </div>
          </div>

          {/* Support */}
          <div className="mt-8 text-sm text-[#4B4B4B]/60">
            <p>
              Precisa de ajuda?{" "}
              <button 
                onClick={() => navigate('/ajuda')}
                className="text-[#8DA385] hover:text-[#7a8f74] underline"
              >
                Entre em contato conosco
              </button>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
