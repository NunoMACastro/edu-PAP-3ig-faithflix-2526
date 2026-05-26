import { Layout } from "../components/Layout";
import { SubscriptionPlans } from "../components/SubscriptionPlans";
import { Check, X } from "lucide-react";

export default function PlanosPage() {
  const features = {
    free: [
      { name: "Acesso a trailers e prévias", included: true },
      { name: "Catálogo limitado (5 títulos/mês)", included: true },
      { name: "Qualidade SD", included: true },
      { name: "1 dispositivo simultâneo", included: true },
      { name: "Com anúncios", included: true },
      { name: "Acesso ao catálogo completo", included: false },
      { name: "Download para assistir offline", included: false },
      { name: "Conteúdo exclusivo", included: false },
      { name: "Suporte prioritário", included: false },
    ],
    pro: [
      { name: "Acesso a trailers e prévias", included: true },
      { name: "Acesso ilimitado ao catálogo completo", included: true },
      { name: "Qualidade HD e Full HD", included: true },
      { name: "3 dispositivos simultâneos", included: true },
      { name: "Download para assistir offline", included: true },
      { name: "Sem anúncios", included: true },
      { name: "Conteúdo exclusivo", included: true },
      { name: "Contribuição para instituições de caridade", included: true },
      { name: "Suporte por email", included: true },
      { name: "Controle parental", included: false },
    ],
    family: [
      { name: "Acesso ilimitado ao catálogo completo", included: true },
      { name: "Qualidade HD, Full HD e 4K", included: true },
      { name: "5 dispositivos simultâneos", included: true },
      { name: "Download ilimitado offline", included: true },
      { name: "Sem anúncios", included: true },
      { name: "Acesso prioritário a eventos ao vivo", included: true },
      { name: "Todo conteúdo exclusivo", included: true },
      { name: "Contribuição para caridade", included: true },
      { name: "Suporte prioritário", included: true },
      { name: "Modo infantil exclusivo", included: true },
      { name: "Controle parental avançado", included: true },
      { name: "Acesso a trailers e prévias", included: true },
      { name: "Suporte por email", included: true }
    ],
  };

  return (
    <Layout>
      <div className="bg-[#F9F7F3]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#8DA385] to-[#7a8f74] text-[#F9F7F3] py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="mb-4">Escolha o Plano Ideal para Você</h1>
              <p className="text-[#F9F7F3]/90 mb-6" style={{ fontSize: '1.125rem' }}>
                Assista a conteúdo cristão de qualidade e ainda ajude instituições de caridade
              </p>
              <div className="inline-flex items-center gap-2 bg-[#F9F7F3]/10 backdrop-blur-sm rounded-full px-6 py-3">
                <Check className="w-5 h-5 text-[#F0CD95]" />
                <span className="text-sm">Cancele quando quiser, sem compromisso</span>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="py-16">
          <SubscriptionPlans />
        </div>

        {/* Comparison Table */}
        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-[#4B4B4B] text-center mb-12">Compare os Planos</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-[#BFBFBF]/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F9F7F3]">
                  <tr>
                    <th className="text-left p-4 text-[#4B4B4B]" style={{ fontWeight: '500' }}>
                      Recursos
                    </th>
                    <th className="text-center p-4 text-[#4B4B4B]" style={{ fontWeight: '500' }}>
                      Gratuito
                    </th>
                    <th className="text-center p-4 text-[#4B4B4B] bg-[#8DA385]/5" style={{ fontWeight: '500' }}>
                      Pro
                      <span className="block text-xs text-[#8DA385] mt-1">Recomendado</span>
                    </th>
                    <th className="text-center p-4 text-[#4B4B4B]" style={{ fontWeight: '500' }}>
                      Família
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Get all unique features */}
                  {Array.from(new Set([
                    ...features.free.map(f => f.name),
                    ...features.pro.map(f => f.name),
                    ...features.family.map(f => f.name),
                  ])).map((featureName, index) => {
                    const freeFeature = features.free.find(f => f.name === featureName);
                    const proFeature = features.pro.find(f => f.name === featureName);
                    const familyFeature = features.family.find(f => f.name === featureName);

                    return (
                      <tr key={index} className="border-t border-[#BFBFBF]/20">
                        <td className="p-4 text-[#4B4B4B]">{featureName}</td>
                        <td className="p-4 text-center">
                          {freeFeature?.included ? (
                            <Check className="w-5 h-5 text-[#8DA385] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-[#BFBFBF] mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center bg-[#8DA385]/5">
                          {proFeature?.included ? (
                            <Check className="w-5 h-5 text-[#8DA385] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-[#BFBFBF] mx-auto" />
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {familyFeature?.included ? (
                            <Check className="w-5 h-5 text-[#8DA385] mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-[#BFBFBF] mx-auto" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="container mx-auto px-4 pb-16">
          <h2 className="text-[#4B4B4B] text-center mb-12">Perguntas Frequentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Você pode cancelar sua assinatura a qualquer momento sem nenhuma taxa de cancelamento. Você terá acesso ao conteúdo até o final do período pago."
              },
              {
                q: "Como funciona o plano gratuito?",
                a: "O plano gratuito permite acesso limitado a 5 títulos por mês, com anúncios. É uma ótima forma de conhecer a plataforma antes de assinar."
              },
              {
                q: "Qual a diferença entre o plano Pro e Família?",
                a: "O plano Pro permite 3 dispositivos simultâneos e qualidade HD/Full HD, ideal para uso individual ou casal. O plano Família permite 5 dispositivos simultâneos, qualidade 4K, e possui recursos exclusivos como modo infantil e controle parental avançado."
              },
              {
                q: "Posso mudar de plano depois?",
                a: "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferença será calculada proporcionalmente."
              },
              {
                q: "Como funciona a contribuição para caridade?",
                a: "Parte da sua assinatura é automaticamente direcionada para instituições de caridade cadastradas na plataforma. É feito um levantamento para saber qual das instituições recebeu mais e qual recebeu menos, e o objetivo é tornar o mais igualitário possível para que todas as instituições sejam beneficiadas."
              },
              {
                q: "Qual a vantagem do plano anual?",
                a: "O plano anual oferece economia de até 20% em relação ao pagamento mensal, além de garantir seu acesso por todo o ano sem preocupações."
              },
            ].map((faq, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20"
              >
                <h3 className="text-[#4B4B4B] mb-2">{faq.q}</h3>
                <p className="text-[#4B4B4B]/70">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
