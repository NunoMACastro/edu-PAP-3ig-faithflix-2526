import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  Bell, 
  Heart, 
  Video, 
  Gift, 
  Users,
  Settings,
  Check,
  Trash2
} from "lucide-react";
import { useState } from "react";

interface Notification {
  id: number;
  type: 'new-content' | 'charity' | 'system' | 'promo';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: typeof Bell;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'new-content',
    title: 'Novo filme adicionado',
    message: '"A Luz da Esperança" está disponível agora no catálogo!',
    time: 'Há 2 horas',
    read: false,
    icon: Video
  },
  {
    id: 2,
    type: 'charity',
    title: 'Doação realizada',
    message: '10,00 € foram destinados ao Lar São Francisco',
    time: 'Há 1 dia',
    read: false,
    icon: Heart
  },
  {
    id: 3,
    type: 'system',
    title: 'Bem-vindo ao FaithFlix!',
    message: 'Obrigado por se juntar à nossa comunidade. Explore nosso catálogo de filmes e séries cristãos.',
    time: 'Há 2 dias',
    read: true,
    icon: Users
  },
  {
    id: 4,
    type: 'promo',
    title: 'Promoção Especial',
    message: 'Ganhe 20% de desconto no plano anual até o final do mês!',
    time: 'Há 3 dias',
    read: true,
    icon: Gift
  },
  {
    id: 5,
    type: 'new-content',
    title: 'Nova série disponível',
    message: 'Confira "Jornadas de Fé" - Temporada completa já disponível',
    time: 'Há 5 dias',
    read: true,
    icon: Video
  },
];

export default function NotificacoesPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'new-content':
        return 'bg-[#8DA385]';
      case 'charity':
        return 'bg-[#F0CD95]';
      case 'system':
        return 'bg-[#4B4B4B]';
      case 'promo':
        return 'bg-[#D16449]';
      default:
        return 'bg-[#BFBFBF]';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-[#4B4B4B]">Notificações</h1>
              {unreadCount > 0 && (
                <Badge className="bg-[#D16449] text-[#F9F7F3]">
                  {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => window.location.href = '/minha-conta?tab=configuracoes'}
            >
              <Settings className="w-5 h-5 text-[#4B4B4B]" />
            </Button>
          </div>
          <p className="text-[#4B4B4B]/70">
            Fique por dentro das novidades e atualizações
          </p>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {unreadCount > 0 && (
              <Button 
                variant="outline"
                onClick={markAllAsRead}
                className="border-[#8DA385] text-[#8DA385] hover:bg-[#8DA385] hover:text-[#F9F7F3]"
              >
                <Check className="w-4 h-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={clearAll}
              className="border-[#D16449] text-[#D16449] hover:bg-[#D16449] hover:text-[#F9F7F3]"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar tudo
            </Button>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl p-6 shadow-sm border transition-all ${
                  notification.read 
                    ? 'border-[#BFBFBF]/20' 
                    : 'border-[#8DA385]/30 bg-[#8DA385]/5'
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 ${getTypeColor(notification.type)} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <notification.icon className="w-6 h-6 text-[#F9F7F3]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-[#4B4B4B]">{notification.title}</h3>
                      <span className="text-sm text-[#4B4B4B]/60 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-[#4B4B4B]/70 mb-4">
                      {notification.message}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button 
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="text-[#8DA385] hover:text-[#7a8f74] hover:bg-[#8DA385]/10"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Marcar como lida
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-[#D16449] hover:text-[#D16449] hover:bg-[#D16449]/10"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-16 shadow-sm border border-[#BFBFBF]/20 text-center">
            <div className="w-20 h-20 bg-[#F0CD95]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-[#F0CD95]" />
            </div>
            <h2 className="text-[#4B4B4B] mb-2">Nenhuma notificação</h2>
            <p className="text-[#4B4B4B]/70 mb-6">
              Você está em dia! Novas notificações aparecerão aqui.
            </p>
            <Button 
              onClick={() => window.location.href = '/catalogo'}
              className="bg-[#8DA385] hover:bg-[#7a8f74] text-[#F9F7F3]"
            >
              Explorar Catálogo
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
