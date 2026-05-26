import { Button } from "./ui/button";
import { Play, Info } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1745356934254-655366644494?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RpYW4lMjBmYWl0aCUyMG1vdmllfGVufDF8fHx8MTc2MTU3NTY2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4B4B4B]/90 via-[#4B4B4B]/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          <div className="inline-block px-4 py-2 bg-[#F0CD95] rounded-lg mb-4">
            <span className="text-[#4B4B4B]">Destaque da Semana</span>
          </div>
          <h1 className="text-[#F9F7F3] mb-4" style={{ fontSize: '3.5rem', fontWeight: '700', lineHeight: '1.2' }}>
            Conteúdo que Inspira e Fortalece sua Fé
          </h1>
          <p className="text-[#F9F7F3] mb-8 max-w-xl" style={{ fontSize: '1.25rem', opacity: 0.95 }}>
            Descubra filmes e séries cristãs que tocam o coração, fortalecem a fé e transformam vidas. Streaming com propósito.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3] gap-2"
              onClick={() => navigate('/catalogo')}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              Assistir Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/20 backdrop-blur-sm text-[#F9F7F3] border-white/40 hover:bg-white/30 gap-2"
              onClick={() => navigate('/catalogo')}
            >
              <Info className="w-5 h-5" />
              Mais Informações
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
