import { ContentCard } from "./ContentCard";
import { Button } from "./ui/button";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const featuredContent = [
  {
    id: 1,
    title: "A Jornada da Fé",
    image: "https://images.unsplash.com/photo-1653133672798-7e0c01077ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwcGVvcGxlfGVufDF8fHx8MTc2MTQ5NDQ3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    year: "2024",
    genre: "Drama",
    duration: "2h 15m"
  },
  {
    id: 2,
    title: "Mãos que Ajudam",
    image: "https://images.unsplash.com/photo-1554136369-724d2c41d883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwaGVscGluZyUyMGhhbmRzfGVufDF8fHx8MTc2MTU1MzA1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.5,
    year: "2023",
    genre: "Inspiração",
    duration: "1h 45m"
  },
  {
    id: 3,
    title: "Unidos em Família",
    image: "https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB3YXRjaGluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2MTU3NTY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    year: "2024",
    genre: "Família",
    duration: "1h 30m"
  },
  {
    id: 4,
    title: "Caminho da Luz",
    image: "https://images.unsplash.com/photo-1704823822615-60b2a0fa04a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaWJsZSUyMHN0dWR5JTIwY3Jvc3N8ZW58MXx8fHwxNzYxNTc1NjYzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    year: "2023",
    genre: "Documental",
    duration: "1h 50m"
  },
  {
    id: 5,
    title: "Força da Oração",
    image: "https://images.unsplash.com/photo-1504021624863-054aa77f753f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmF5ZXIlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NjE1NzU2NjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 5.0,
    year: "2024",
    genre: "Espiritual",
    duration: "2h 00m"
  }
];

const categories = ["Todos", "Drama", "Família", "Documental", "Inspiração", "Espiritual", "Infantil", "Jovens"];

export function CatalogSection() {
  const navigate = useNavigate();

  return (
    <section id="catalogo" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-foreground mb-2" style={{ fontSize: '2rem' }}>Destaques do Catálogo</h2>
            <p className="text-muted-foreground">Filmes e séries que vão fortalecer sua fé</p>
          </div>
          <Button 
            variant="ghost" 
            className="text-primary gap-2"
            onClick={() => navigate('/catalogo')}
          >
            Ver todos
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {featuredContent.map((content) => (
            <ContentCard key={content.id} {...content} />
          ))}
        </div>

        {/* Categories */}
        <div className="mt-16">
          <h3 className="text-foreground mb-6" style={{ fontSize: '1.5rem' }}>Explorar por Categoria</h3>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "Todos" ? "default" : "outline"}
                className={
                  category === "Todos"
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border text-foreground hover:bg-secondary hover:border-secondary hover:text-secondary-foreground"
                }
                onClick={() => navigate('/catalogo')}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}