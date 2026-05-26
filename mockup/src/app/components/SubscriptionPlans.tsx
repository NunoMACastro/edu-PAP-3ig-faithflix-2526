import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    id: 'free',
    name: "Gratuito",
    description: "Experimente a plataforma",
    features: [
      "Acesso a trailers e prévias",
      "Catálogo limitado (5 títulos/mês)",
      "Qualidade SD",
      "1 dispositivo simultâneo",
      "Com anúncios"
    ],
    popular: false
  },
  {
    id: 'pro',
    name: "Pro",
    description: "Para você que quer mais",
    features: [
      "Acesso ilimitado ao catálogo completo",
      "Qualidade HD e Full HD",
      "3 dispositivos simultâneos",
      "Download para assistir offline",
      "Sem anúncios",
      "Contribuição para instituições de caridade"
    ],
    popular: true
  },
  {
    id: 'family',
    name: "Família",
    description: "Para toda a família",
    features: [
      "Acesso ilimitado ao catálogo completo",
      "Qualidade HD, Full HD e 4K",
      "5 dispositivos simultâneos",
      "Download ilimitado offline",
      "Sem anúncios",
      "Modo infantil exclusivo",
      "Controle parental avançado",
      "Contribuição para instituições de caridade"
    ],
    popular: false
  }
];

export function SubscriptionPlans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section id="planos" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-foreground mb-4" style={{ fontSize: '2.5rem' }}>Escolha seu Plano</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Todos os planos incluem acesso completo ao catálogo de filmes e séries cristãs. Cancele quando quiser.
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 bg-muted rounded-full p-1 border">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full transition-all ${
                billingCycle === 'annual'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-primary'
              }`}
            >
              Anual
            </button>
          </div>
          {billingCycle === 'annual' && (
            <p className="text-primary text-sm mt-2">Economize até 20% no plano anual</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 bg-background ${
                plan.popular
                  ? "border-primary border-2 shadow-xl"
                  : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm">
                    Mais Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-foreground mb-2" style={{ fontSize: '1.5rem' }}>{plan.name}</h3>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8 min-h-[280px]">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : plan.id === 'free'
                    ? "bg-muted hover:bg-muted/80 text-foreground"
                    : "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                }`}
                size="lg"
              >
                {plan.id === 'free' ? 'Começar Grátis' : `Assinar ${billingCycle === 'annual' ? 'Anual' : 'Mensal'}`}
              </Button>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Parte da sua mensalidade apoia instituições de caridade cristãs
          </p>
        </div>
      </div>
    </section>
  );
}