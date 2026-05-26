import { useState } from "react";
import { Layout } from "../components/Layout";
import { ContentCard } from "../components/ContentCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const catalogContent = [
  {
    id: 1,
    title: "A Jornada da Fé",
    image: "https://images.unsplash.com/photo-1653133672798-7e0c01077ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwcGVvcGxlfGVufDF8fHx8MTc2MTQ5NDQ3OXww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    year: "2024",
    genre: "Drama",
    duration: "2h 15m"
  },
  {
    id: 2,
    title: "Mãos que Ajudam",
    image: "https://images.unsplash.com/photo-1554136369-724d2c41d883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwaGVscGluZyUyMGhhbmRzfGVufDF8fHx8MTc2MTU1MzA1NHww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.5,
    year: "2023",
    genre: "Inspiração",
    duration: "1h 45m"
  },
  {
    id: 3,
    title: "Unidos em Família",
    image: "https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB3YXRjaGluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2MTU3NTY2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    year: "2024",
    genre: "Família",
    duration: "1h 30m"
  },
  {
    id: 4,
    title: "Caminho da Luz",
    image: "https://images.unsplash.com/photo-1704823822615-60b2a0fa04a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWJsZSUyMHN0dWR5JTIwY3Jvc3N8ZW58MXx8fHwxNzYxNTc1NjYzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    year: "2023",
    genre: "Documental",
    duration: "1h 50m"
  },
  {
    id: 5,
    title: "Força da Oração",
    image: "https://images.unsplash.com/photo-1504021624863-054aa77f753f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmF5ZXIlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NjE1NzU2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 5.0,
    year: "2024",
    genre: "Espiritual",
    duration: "2h 00m"
  },
  {
    id: 6,
    title: "Esperança Renovada",
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3BlJTIwc3Vuc2V0fGVufDF8fHx8MTc2MTU3NTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    year: "2023",
    genre: "Drama",
    duration: "1h 55m"
  },
  {
    id: 7,
    title: "Corações Transformados",
    image: "https://images.unsplash.com/photo-1516981879613-9f5da904015f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFydCUyMGhhbmRzfGVufDF8fHx8MTc2MTU3NTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    year: "2024",
    genre: "Inspiração",
    duration: "2h 10m"
  },
  {
    id: 8,
    title: "Desafios da Juventude",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3V0aCUyMGdyb3VwfGVufDF8fHx8MTc2MTU3NTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.4,
    year: "2024",
    genre: "Jovens",
    duration: "1h 40m"
  },
  {
    id: 9,
    title: "O Poder da Comunidade",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjB0b2dldGhlcnxlbnwxfHx8fDE3NjE1NzU2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    year: "2023",
    genre: "Documental",
    duration: "1h 35m"
  },
  {
    id: 10,
    title: "Pequenos Milagres",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGhhcHB5fGVufDF8fHx8MTc2MTU3NTY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    year: "2024",
    genre: "Infantil",
    duration: "1h 25m"
  }
];

const categories = ["Todos", "Drama", "Família", "Documental", "Inspiração", "Espiritual", "Infantil", "Jovens"];

export default function CatalogoPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevancia");

  const filteredContent = catalogContent.filter(content => {
    const matchesCategory = selectedCategory === "Todos" || content.genre === selectedCategory;
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[#4B4B4B] mb-2">Catálogo Completo</h1>
          <p className="text-[#4B4B4B]/70">Explore nossa coleção de filmes e séries cristãos</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4B4B4B]/50" />
              <Input
                placeholder="Buscar no catálogo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#F9F7F3] border-[#BFBFBF]/30"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48 bg-[#F9F7F3] border-[#BFBFBF]/30">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="recentes">Mais Recentes</SelectItem>
                <SelectItem value="antigos">Mais Antigos</SelectItem>
                <SelectItem value="avaliacao">Melhor Avaliação</SelectItem>
                <SelectItem value="titulo">Título (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-[#4B4B4B] mb-4">Categorias</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === selectedCategory ? "default" : "outline"}
                className={
                  category === selectedCategory
                    ? "bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
                    : "border-[#BFBFBF] text-[#4B4B4B] hover:bg-[#F0CD95] hover:border-[#F0CD95]"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-[#4B4B4B]/70">
            Mostrando {filteredContent.length} {filteredContent.length === 1 ? 'resultado' : 'resultados'}
            {searchTerm && ` para "${searchTerm}"`}
          </p>
        </div>

        {/* Content Grid */}
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredContent.map((content) => (
              <ContentCard key={content.id} {...content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-[#F0CD95]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-[#F0CD95]" />
            </div>
            <h3 className="text-[#4B4B4B] mb-2">Nenhum conteúdo encontrado</h3>
            <p className="text-[#4B4B4B]/70 mb-6">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todos");
              }}
              className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
