import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { 
  User, 
  CreditCard, 
  Settings, 
  Heart, 
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Trash2
} from "lucide-react";
import { ContentCard } from "../components/ContentCard";
import { useState } from "react";

const favoriteContent = [
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
    id: 3,
    title: "Unidos em Família",
    image: "https://images.unsplash.com/photo-1692188071339-2825a8a997f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    rating: 4.9,
    year: "2024",
    genre: "Família",
    duration: "1h 30m"
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

export default function MinhaContaPage() {
  const [userData, setUserData] = useState({
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "",
    address: "",
    memberSince: "Janeiro 2024",
    plan: "Anual",
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#8DA385] to-[#7a8f74] rounded-xl p-8 mb-8 text-[#F9F7F3]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-[#F9F7F3]">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#F0CD95] text-[#4B4B4B]" style={{ fontSize: '2rem' }}>
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-[#F9F7F3]">{userData.name}</h1>
                <Badge className="bg-[#F0CD95] text-[#4B4B4B] hover:bg-[#F0CD95]">
                  <Crown className="w-3 h-3 mr-1" />
                  {userData.plan}
                </Badge>
              </div>
              <p className="text-[#F9F7F3]/80 mb-1">{userData.email}</p>
              <p className="text-[#F9F7F3]/60 text-sm">Membro desde {userData.memberSince}</p>
            </div>

            <Button 
              variant="outline" 
              className="bg-transparent border-[#F9F7F3] text-[#F9F7F3] hover:bg-[#F9F7F3] hover:text-[#8DA385]"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="perfil" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white border border-[#BFBFBF]/20">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-[#8DA385] data-[state=active]:text-[#F9F7F3]">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="assinatura" className="data-[state=active]:bg-[#8DA385] data-[state=active]:text-[#F9F7F3]">
              <CreditCard className="w-4 h-4 mr-2" />
              Assinatura
            </TabsTrigger>
            <TabsTrigger value="favoritos" className="data-[state=active]:bg-[#8DA385] data-[state=active]:text-[#F9F7F3]">
              <Heart className="w-4 h-4 mr-2" />
              Favoritos
            </TabsTrigger>
            <TabsTrigger value="configuracoes" className="data-[state=active]:bg-[#8DA385] data-[state=active]:text-[#F9F7F3]">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
              <h2 className="text-[#4B4B4B] mb-6">Informações Pessoais</h2>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="bg-[#F9F7F3] border-[#BFBFBF]/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B4B4B]/50" />
                      <Input
                        id="email"
                        type="email"
                        value={userData.email}
                        onChange={(e) => setUserData({...userData, email: e.target.value})}
                        className="pl-10 bg-[#F9F7F3] border-[#BFBFBF]/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B4B4B]/50" />
                      <Input
                        id="phone"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        className="pl-10 bg-[#F9F7F3] border-[#BFBFBF]/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Localização</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4B4B4B]/50" />
                      <Input
                        id="address"
                        value={userData.address}
                        onChange={(e) => setUserData({...userData, address: e.target.value})}
                        className="pl-10 bg-[#F9F7F3] border-[#BFBFBF]/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]">
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" type="button" className="border-[#BFBFBF]">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          {/* Assinatura Tab */}
          <TabsContent value="assinatura">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-[#4B4B4B] mb-2">Plano Atual</h2>
                    <p className="text-[#4B4B4B]/70">Gerencie sua assinatura e formas de pagamento</p>
                  </div>
                  <Badge className="bg-[#8DA385] text-[#F9F7F3]">Ativo</Badge>
                </div>

                <div className="bg-[#F9F7F3] rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[#4B4B4B] mb-1">Plano Anual Premium</h3>
                      <p className="text-[#4B4B4B]/70">-/ano</p>
                    </div>
                    <Crown className="w-8 h-8 text-[#F0CD95]" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-[#4B4B4B]/70">
                    <Calendar className="w-4 h-4" />
                    Próxima cobrança: 27 de Novembro de 2025
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]">
                    Gerenciar Assinatura
                  </Button>
                  <Button variant="outline" className="w-full border-[#BFBFBF]">
                    Alterar Forma de Pagamento
                  </Button>
                  <Button variant="outline" className="w-full border-[#D16449] text-[#D16449] hover:bg-[#D16449] hover:text-[#F9F7F3]">
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
                <h3 className="text-[#4B4B4B] mb-4">Histórico de Pagamentos</h3>
                <div className="space-y-3">
                  {[
                    { date: "27/11/2024", amount: "-", status: "Pago" },
                    { date: "27/11/2023", amount: "-", status: "Pago" },
                  ].map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#F9F7F3] rounded-lg">
                      <div>
                        <p className="text-[#4B4B4B]">{payment.date}</p>
                        <p className="text-sm text-[#4B4B4B]/70">Plano Anual</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#4B4B4B]">{payment.amount}</p>
                        <Badge variant="outline" className="border-[#8DA385] text-[#8DA385]">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Favoritos Tab */}
          <TabsContent value="favoritos">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
              <h2 className="text-[#4B4B4B] mb-6">Minha Lista</h2>
              
              {favoriteContent.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {favoriteContent.map((content) => (
                    <ContentCard key={content.id} {...content} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-[#BFBFBF] mx-auto mb-4" />
                  <h3 className="text-[#4B4B4B] mb-2">Sua lista está vazia</h3>
                  <p className="text-[#4B4B4B]/70 mb-6">
                    Adicione filmes e séries aos favoritos para assistir depois
                  </p>
                  <Button className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]">
                    Explorar Catálogo
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Configurações Tab */}
          <TabsContent value="configuracoes">
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#BFBFBF]/20">
                <h2 className="text-[#4B4B4B] mb-6">Preferências</h2>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <select 
                      id="language"
                      className="w-full p-2 bg-[#F9F7F3] border border-[#BFBFBF]/30 rounded-lg text-[#4B4B4B]"
                    >
                      <option>Português (Brasil)</option>
                      <option>English</option>
                      <option>Español</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quality">Qualidade de Vídeo</Label>
                    <select 
                      id="quality"
                      className="w-full p-2 bg-[#F9F7F3] border border-[#BFBFBF]/30 rounded-lg text-[#4B4B4B]"
                    >
                      <option>Automático</option>
                      <option>HD (1080p)</option>
                      <option>Full HD (1080p)</option>
                      <option>4K (2160p)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autoplay">Reprodução Automática</Label>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="autoplay" className="rounded" defaultChecked />
                      <label htmlFor="autoplay" className="text-sm text-[#4B4B4B]/70">
                        Reproduzir próximo episódio automaticamente
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notifications">Notificações</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notify-new" className="rounded" defaultChecked />
                        <label htmlFor="notify-new" className="text-sm text-[#4B4B4B]/70">
                          Novos conteúdos adicionados
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notify-charity" className="rounded" defaultChecked />
                        <label htmlFor="notify-charity" className="text-sm text-[#4B4B4B]/70">
                          Atualizações de instituições de caridade
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notify-promo" className="rounded" />
                        <label htmlFor="notify-promo" className="text-sm text-[#4B4B4B]/70">
                          Promoções e novidades
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]">
                    Salvar Preferências
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-sm border border-[#D16449]/20">
                <h3 className="text-[#D16449] mb-4">Zona de Perigo</h3>
                <p className="text-[#4B4B4B]/70 mb-6">
                  Ao excluir sua conta, todos os seus dados serão permanentemente removidos.
                </p>
                <Button variant="outline" className="border-[#D16449] text-[#D16449] hover:bg-[#D16449] hover:text-[#F9F7F3]">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Conta
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
