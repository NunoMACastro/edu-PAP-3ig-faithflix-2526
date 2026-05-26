import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Users, Award, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";

const charities = [
  {
    id: 1,
    name: "Casa da Esperança",
    description: "Apoio a famílias em situação de vulnerabilidade",
    image: "https://images.unsplash.com/photo-1554136369-724d2c41d883?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFyaXR5JTIwaGVscGluZyUyMGhhbmRzfGVufDF8fHx8MTc2MTU1MzA1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    donations: "€ 20 310",
    supporters: 234
  },
  {
    id: 2,
    name: "Mãos que Transformam",
    description: "Educação e capacitação profissional",
    image: "https://images.unsplash.com/photo-1653133672798-7e0c01077ee6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHVyY2glMjB3b3JzaGlwJTIwcGVvcGxlfGVufDF8fHx8MTc2MTQ5NDQ3OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    donations: "€ 18 647",
    supporters: 189
  },
  {
    id: 3,
    name: "Luz do Amanhã",
    description: "Proteção e acolhimento de crianças",
    image: "https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB3YXRjaGluZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc2MTU3NTY2Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    donations: "€ 12 759",
    supporters: 312
  }
];

export function CharitySection() {
  const navigate = useNavigate();

  const handleSupport = (charityName: string) => {
    alert(`Apoio à ${charityName}\n\nEm breve você poderá apoiar instituições diretamente pela plataforma!`);
  };

  return (
    <section id="instituicoes" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4" style={{ fontSize: '2.5rem' }}>Instituições Parceiras</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Parte de cada assinatura é destinada a instituições de caridade cristãs. Juntos, fazemos a diferença.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 text-center bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground" style={{ fontSize: '1.75rem', fontWeight: '700' }}>€ 245K</p>
            <p className="text-muted-foreground text-sm">Total Doado</p>
          </Card>

          <Card className="p-6 text-center bg-card">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-foreground" style={{ fontSize: '1.75rem', fontWeight: '700' }}>1,234</p>
            <p className="text-muted-foreground text-sm">Apoiadores</p>
          </Card>

          <Card className="p-6 text-center bg-card">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <p className="text-foreground" style={{ fontSize: '1.75rem', fontWeight: '700' }}>12</p>
            <p className="text-muted-foreground text-sm">Instituições</p>
          </Card>

          <Card className="p-6 text-center bg-card">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
            <p className="text-foreground" style={{ fontSize: '1.75rem', fontWeight: '700' }}>+34%</p>
            <p className="text-muted-foreground text-sm">Este Mês</p>
          </Card>
        </div>

        {/* Charity Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {charities.map((charity) => (
            <Card key={charity.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow">
              <div className="aspect-video relative overflow-hidden">
                <ImageWithFallback
                  src={charity.image}
                  alt={charity.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-card-foreground mb-2">{charity.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{charity.description}</p>
                
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-muted-foreground text-xs">Total Arrecadado</p>
                    <p className="text-primary" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{charity.donations}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">Apoiadores</p>
                    <p className="text-card-foreground" style={{ fontSize: '1.25rem', fontWeight: '600' }}>{charity.supporters}</p>
                  </div>
                </div>

                <Button 
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  onClick={() => handleSupport(charity.name)}
                >
                  Apoiar Instituição
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground mr-4"
            onClick={() => navigate('/instituicoes')}
          >
            Ver Todas as Instituições
          </Button>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => navigate('/instituicoes#formulario')}
          >
            Cadastrar Minha Instituição
          </Button>
        </div>
      </div>
    </section>
  );
}