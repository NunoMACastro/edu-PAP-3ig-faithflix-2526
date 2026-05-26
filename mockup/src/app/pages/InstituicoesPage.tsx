import { Layout } from "../components/Layout";
import { CharitySection } from "../components/CharitySection";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Heart, Users, Target, Award, FileText, Upload } from "lucide-react";
import { useState, useEffect } from "react";

export default function InstituicoesPage() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#formulario') {
      setShowForm(true);
      setTimeout(() => {
        document.getElementById('formulario')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, []);

  return (
    <Layout>
      <div className="bg-[#F9F7F3]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#8DA385] to-[#7a8f74] text-[#F9F7F3] py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <Heart className="w-16 h-16 mx-auto mb-6" />
              <h1 className="mb-4">Instituições de Caridade</h1>
              <p className="text-[#F9F7F3]/90 mb-8" style={{ fontSize: '1.125rem' }}>
                Conectando corações generosos a causas que transformam vidas. 
                Juntos, fazemos a diferença no mundo.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-[#F0CD95] hover:bg-[#e0bd85] text-[#4B4B4B]"
                  onClick={() => setShowForm(true)}
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Candidatar Minha Instituição
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-[#F9F7F3] text-[#F9F7F3] hover:bg-[#F9F7F3] hover:text-[#8DA385]"
                  onClick={() => document.getElementById('instituicoes')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Ver Instituições Parceiras
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-[#4B4B4B] text-center mb-12">Por que fazer parte da FaithFlix?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 text-center">
              <div className="w-14 h-14 bg-[#8DA385]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-[#8DA385]" />
              </div>
              <h3 className="text-[#4B4B4B] mb-2">Alcance Global</h3>
              <p className="text-[#4B4B4B]/70 text-sm">
                Conecte-se com milhares de pessoas dispostas a apoiar sua causa
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 text-center">
              <div className="w-14 h-14 bg-[#F0CD95]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-[#F0CD95]" />
              </div>
              <h3 className="text-[#4B4B4B] mb-2">Visibilidade</h3>
              <p className="text-[#4B4B4B]/70 text-sm">
                Destaque sua instituição em uma plataforma focada no bem comum
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 text-center">
              <div className="w-14 h-14 bg-[#8DA385]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-[#8DA385]" />
              </div>
              <h3 className="text-[#4B4B4B] mb-2">Transparência</h3>
              <p className="text-[#4B4B4B]/70 text-sm">
                Sistema transparente de doações e acompanhamento de resultados
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#BFBFBF]/20 text-center">
              <div className="w-14 h-14 bg-[#F0CD95]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-7 h-7 text-[#F0CD95]" />
              </div>
              <h3 className="text-[#4B4B4B] mb-2">Credibilidade</h3>
              <p className="text-[#4B4B4B]/70 text-sm">
                Faça parte de uma comunidade confiável e comprometida
              </p>
            </div>
          </div>
        </div>

        {/* Application Form */}
        {showForm && (
          <div id="formulario" className="container mx-auto px-4 pb-16">
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
              <div className="text-center mb-8">
                <h2 className="text-[#4B4B4B] mb-2">Formulário de Candidatura</h2>
                <p className="text-[#4B4B4B]/70">
                  Preencha os dados abaixo para candidatar sua instituição
                </p>
              </div>

              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nome-instituicao">Nome da Instituição *</Label>
                    <Input
                      id="nome-instituicao"
                      placeholder="Nome completo da instituição"
                      required
                      className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      required
                      className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Institucional *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@instituicao.org"
                    required
                    className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(00) 0000-0000"
                      required
                      className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="site">Site</Label>
                    <Input
                      id="site"
                      placeholder="https://www.instituicao.org"
                      className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    required
                    className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="missao">Missão e Propósito *</Label>
                  <Textarea
                    id="missao"
                    placeholder="Descreva a missão, visão e valores da sua instituição..."
                    rows={4}
                    required
                    className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projetos">Projetos e Atividades *</Label>
                  <Textarea
                    id="projetos"
                    placeholder="Descreva os principais projetos e atividades desenvolvidas..."
                    rows={4}
                    required
                    className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentos">Documentos Comprobatórios</Label>
                  <div className="border-2 border-dashed border-[#BFBFBF]/30 rounded-lg p-8 text-center bg-[#F9F7F3]">
                    <Upload className="w-10 h-10 text-[#4B4B4B]/40 mx-auto mb-4" />
                    <p className="text-[#4B4B4B]/70 mb-2">
                      Arraste e solte seus documentos aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-[#4B4B4B]/50">
                      Formatos aceitos: PDF, DOC, DOCX (máx. 10MB)
                    </p>
                    <Button type="button" variant="outline" className="mt-4">
                      Selecionar Arquivos
                    </Button>
                  </div>
                  <p className="text-sm text-[#4B4B4B]/60">
                    * Envie cópia do CNPJ, estatuto social e comprovante de endereço
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit"
                    className="flex-1 bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
                  >
                    Enviar Candidatura
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-[#BFBFBF]"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Existing Charities Section */}
        <div id="instituicoes">
          <CharitySection />
        </div>
      </div>
    </Layout>
  );
}