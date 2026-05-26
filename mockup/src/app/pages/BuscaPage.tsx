import { Layout } from "../components/Layout";
import { ContentCard } from "../components/ContentCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const allContent = [
  {
    id: 1,
    title: "A Jornada da Fé",
    image: "https://images.unsplash.com/photo-1653133672798-7e0c01077ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 4.8,
    year: "2024",
    genre: "Drama",
    duration: "2h 15m"
  },
  {
    id: 2,
    title: "Mãos que Ajudam",
    image: "https://images.unsplash.com/photo-1554136369-724d2c41d883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 4.5,
    year: "2023",
    genre: "Inspiração",
    duration: "1h 45m"
  },
  {
    id: 3,
    title: "Unidos em Família",
    image: "https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 4.9,
    year: "2024",
    genre: "Família",
    duration: "1h 30m"
  },
  {
    id: 4,
    title: "Caminho da Luz",
    image: "https://images.unsplash.com/photo-1704823822615-60b2a0fa04a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 4.7,
    year: "2023",
    genre: "Documental",
    duration: "1h 50m"
  },
  {
    id: 5,
    title: "Força da Oração",
    image: "https://images.unsplash.com/photo-1504021624863-054aa77f753f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 5.0,
    year: "2024",
    genre: "Espiritual",
    duration: "2h 00m"
  },
];

export default function BuscaPage() {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [activeSearch, setActiveSearch] = useState(queryParam);

  useEffect(() => {
    setSearchTerm(queryParam);
    setActiveSearch(queryParam);
  }, [queryParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setActiveSearch("");
  };

  const filteredContent = allContent.filter(content =>
    content.title.toLowerCase().includes(activeSearch.toLowerCase()) ||
    content.genre.toLowerCase().includes(activeSearch.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-[#4B4B4B] mb-2">Buscar</h1>
          <p className="text-[#4B4B4B]/70">
            Encontre filmes e séries cristãos
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B4B4B]/50" />
              <Input
                placeholder="Digite o nome do filme, série ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-10 bg-[#F9F7F3] border-[#BFBFBF]/30 h-12"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4B4B4B]/50 hover:text-[#4B4B4B]"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button 
              type="submit"
              className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3] h-12 px-8"
            >
              Buscar
            </Button>
          </form>
        </div>

        {/* Results */}
        {activeSearch ? (
          <>
            <div className="mb-6">
              <h2 className="text-[#4B4B4B] mb-2">
                Resultados para "{activeSearch}"
              </h2>
              <p className="text-[#4B4B4B]/70">
                {filteredContent.length} {filteredContent.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>

            {filteredContent.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredContent.map((content) => (
                  <ContentCard key={content.id} {...content} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-16 shadow-sm border border-[#BFBFBF]/20 text-center">
                <div className="w-20 h-20 bg-[#F0CD95]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-[#F0CD95]" />
                </div>
                <h2 className="text-[#4B4B4B] mb-2">Nenhum resultado encontrado</h2>
                <p className="text-[#4B4B4B]/70 mb-6">
                  Não encontramos nada para "{activeSearch}". Tente buscar por outro termo.
                </p>
                <Button 
                  onClick={clearSearch}
                  className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
                >
                  Limpar Busca
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl p-16 shadow-sm border border-[#BFBFBF]/20 text-center">
            <div className="w-20 h-20 bg-[#8DA385]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-[#8DA385]" />
            </div>
            <h2 className="text-[#4B4B4B] mb-2">Comece a buscar</h2>
            <p className="text-[#4B4B4B]/70 mb-6">
              Digite algo na barra de busca acima para encontrar filmes e séries
            </p>
            
            {/* Popular Searches */}
            <div className="max-w-md mx-auto">
              <p className="text-sm text-[#4B4B4B]/60 mb-4">Buscas populares:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Família", "Fé", "Inspiração", "Drama", "Jovens"].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm(term);
                      setActiveSearch(term);
                    }}
                    className="border-[#BFBFBF] text-[#4B4B4B] hover:bg-[#8DA385] hover:text-[#F9F7F3] hover:border-[#8DA385]"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
