# FaithFlix - Especificações de Interface

## 📋 Informações do Projeto

**Nome:** FaithFlix  
**Tipo:** Plataforma de Streaming Digital Cristã  
**Equipe:** Matheus Bastos, Mateus Freitas, Davi Ribeiro, Kaue Silva  
**Data:** 2024

## 🎨 Sistema de Design

### Paleta de Cores

A paleta de cores foi cuidadosamente selecionada para transmitir valores cristãos, serenidade e confiança:

| Nome | Cor Hex | Uso |
|------|---------|-----|
| **Bege Claro** | `#F0CD95` | Cor secundária/accent, badges, botões alternativos |
| **Verde Pastel** | `#8DA385` | Cor principal, botões primários, elementos de destaque |
| **Branco Meio Escuro** | `#F9F7F3` | Cor de fundo principal, textos em fundos escuros |
| **Cinza Mediano** | `#4B4B4B` | Cor de texto principal, cabeçalho do rodapé |
| **Cinza Mais Claro** | `#BFBFBF` | Fundos alternativos, bordas, elementos desabilitados |
| **Laranja** | `#D16449` | Alertas, avisos, elementos destrutivos |
| **Branco** | `#FFFFFF` | Cards, inputs, elementos de conteúdo |

### Tokens CSS (Design Tokens)

#### Cores Base (:root)
```css
--background: #F9F7F3
--foreground: #4B4B4B
--card: #ffffff
--card-foreground: #4B4B4B
--popover: oklch(1 0 0)
--popover-foreground: #4B4B4B
--primary: #8DA385
--primary-foreground: #F9F7F3
--secondary: #F0CD95
--secondary-foreground: #4B4B4B
--muted: #BFBFBF
--muted-foreground: #4B4B4B
--accent: #F0CD95
--accent-foreground: #4B4B4B
--destructive: #D16449
--destructive-foreground: #F9F7F3
--border: rgba(75, 75, 75, 0.15)
--input: transparent
--input-background: #ffffff
--switch-background: #BFBFBF
--ring: #8DA385
```

#### Tipografia
```css
--font-size: 16px (base)
--font-weight-medium: 500
--font-weight-normal: 400
```

#### Border Radius
```css
--radius: 0.625rem (10px)
--radius-sm: calc(var(--radius) - 4px)  /* 6px */
--radius-md: calc(var(--radius) - 2px)  /* 8px */
--radius-lg: var(--radius)               /* 10px */
--radius-xl: calc(var(--radius) + 4px)  /* 14px */
```

#### Sidebar
```css
--sidebar: oklch(0.985 0 0)
--sidebar-foreground: #4B4B4B
--sidebar-primary: #8DA385
--sidebar-primary-foreground: #F9F7F3
--sidebar-accent: #F0CD95
--sidebar-accent-foreground: #4B4B4B
--sidebar-border: #BFBFBF
--sidebar-ring: #8DA385
```

#### Charts
```css
--chart-1: oklch(0.646 0.222 41.116)
--chart-2: oklch(0.6 0.118 184.704)
--chart-3: oklch(0.398 0.07 227.392)
--chart-4: oklch(0.828 0.189 84.429)
--chart-5: oklch(0.769 0.188 70.08)
```

### Tipografia Base

A aplicação utiliza um sistema de tipografia consistente:

| Elemento | Font Size | Font Weight | Line Height |
|----------|-----------|-------------|-------------|
| `h1` | `var(--text-2xl)` | 500 (medium) | 1.5 |
| `h2` | `var(--text-xl)` | 500 (medium) | 1.5 |
| `h3` | `var(--text-lg)` | 500 (medium) | 1.5 |
| `h4` | `var(--text-base)` | 500 (medium) | 1.5 |
| `p` | `var(--text-base)` | 400 (normal) | 1.5 |
| `label` | `var(--text-base)` | 500 (medium) | 1.5 |
| `button` | `var(--text-base)` | 500 (medium) | 1.5 |
| `input` | `var(--text-base)` | 400 (normal) | 1.5 |

## 🏗️ Estrutura da Aplicação

### Arquitetura de Componentes

```
/App.tsx (Componente Principal)
├── /components
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── CatalogSection.tsx
│   │   └── ContentCard.tsx
│   ├── CharitySection.tsx
│   ├── SubscriptionPlans.tsx
│   └── Footer.tsx
│
├── /components/ui (Shadcn/UI)
│   ├── button.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── input.tsx
│   └── ... (outros componentes UI)
│
└── /styles
    └── globals.css
```

## 📦 Componentes Principais

### 1. Header (Cabeçalho)

**Arquivo:** `/components/Header.tsx`

**Características:**
- Fixo no topo (sticky)
- Fundo com backdrop blur
- Responsivo

**Elementos:**
- **Logo:** Cruz (✝) em fundo verde (#8DA385) + texto "FaithFlix"
- **Navegação:**
  - Início
  - Catálogo (âncora: #catalogo)
  - Instituições (âncora: #instituicoes)
  - Planos (âncora: #planos)
- **Barra de Busca:** Com ícone de lupa (visível em lg+)
- **Ícones de Ação:**
  - Notificações (Bell)
  - Perfil de Usuário (User)
- **Botão CTA:** "Assinar" (verde #8DA385)

**Responsividade:**
- Navegação oculta em mobile (hidden md:flex)
- Busca oculta em tablets menores (hidden lg:flex)
- Notificações ocultas em mobile (hidden md:flex)

---

### 2. Hero Section

**Arquivo:** `/components/HeroSection.tsx`

**Características:**
- Altura: 600px
- Imagem de fundo com overlay gradiente
- Posicionamento de conteúdo à esquerda

**Elementos:**
- **Badge:** "Destaque da Semana" (fundo bege #F0CD95)
- **Título Principal:** 
  - Texto: "Conteúdo que Inspira e Fortalece sua Fé"
  - Font size: 3.5rem
  - Font weight: 700
  - Cor: #F9F7F3 (branco meio escuro)
- **Descrição:** Parágrafo explicativo (1.25rem)
- **Botões de Ação:**
  - "Assistir Agora" (verde, com ícone Play)
  - "Mais Informações" (outline transparente, com ícone Info)

**Imagem:** Background obtido via Unsplash (tema cristão)

---

### 3. Catalog Section (Seção de Catálogo)

**Arquivo:** `/components/CatalogSection.tsx`

**Características:**
- Padding vertical: 16 (py-16)
- Fundo: #F9F7F3
- ID: #catalogo (para navegação)

**Estrutura:**
1. **Cabeçalho de Seção:**
   - Título: "Destaques do Catálogo"
   - Subtítulo: "Filmes e séries que vão fortalecer sua fé"
   - Botão "Ver todos" (ghost, cor verde)

2. **Grid de Conteúdo:**
   - Layout: 2 cols (mobile) → 3 cols (md) → 5 cols (lg)
   - Gap: 6
   - 5 cards de conteúdo inicial

3. **Categorias:**
   - Título: "Explorar por Categoria"
   - Filtros: Todos, Drama, Família, Documental, Inspiração, Espiritual, Infantil, Jovens
   - "Todos" selecionado por padrão (verde)
   - Outros com hover em bege (#F0CD95)

**Conteúdo de Exemplo:**
- A Jornada da Fé (Drama, 4.8, 2024)
- Mãos que Ajudam (Inspiração, 4.5, 2023)
- Unidos em Família (Família, 4.9, 2024)
- Caminho da Luz (Documental, 4.7, 2023)
- Força da Oração (Espiritual, 5.0, 2024)

---

### 4. Content Card

**Arquivo:** `/components/ContentCard.tsx`

**Características:**
- Aspect ratio: 2/3 (portrait)
- Hover effects: escala da imagem (scale-110)
- Shadow: md → xl no hover
- Cursor: pointer

**Elementos:**
- **Imagem:** Cover com transição suave
- **Badge de Gênero:** Canto superior direito (bege)
- **Overlay Hover:**
  - Gradiente preto (from-black/90)
  - Botão Play centralizado (verde circular)
- **Info Card:**
  - Título do conteúdo (line-clamp-1)
  - Rating com estrela (preenchida em bege)
  - Ano de lançamento
  - Duração (opcional)

**Props:**
```typescript
interface ContentCardProps {
  title: string;
  image: string;
  rating: number;
  year: string;
  genre: string;
  duration?: string;
}
```

---

### 5. Charity Section (Instituições de Caridade)

**Arquivo:** `/components/CharitySection.tsx`

**Características:**
- Padding vertical: 16
- Fundo: #F9F7F3
- ID: #instituicoes

**Estrutura:**
1. **Cabeçalho Centralizado:**
   - Título: "Instituições Parceiras"
   - Descrição sobre destinação de fundos

2. **Cards de Estatísticas:** (4 colunas em desktop)
   - Total Doado: R$ 245K (ícone Heart)
   - Apoiadores: 1,234 (ícone Users)
   - Instituições: 12 (ícone Award)
   - Crescimento: +34% (ícone TrendingUp)

3. **Cards de Instituições:** (3 colunas)
   - Imagem (aspect-video)
   - Nome da instituição
   - Descrição
   - Total arrecadado (cor verde)
   - Número de apoiadores
   - Botão "Apoiar Instituição" (bege)

**Instituições de Exemplo:**
- Casa da Esperança (R$ 45.320, 234 apoiadores)
- Mãos que Transformam (R$ 38.650, 189 apoiadores)
- Luz do Amanhã (R$ 52.890, 312 apoiadores)

4. **Botão "Ver Todas":** Outline verde

---

### 6. Subscription Plans (Planos de Assinatura)

**Arquivo:** `/components/SubscriptionPlans.tsx`

**Características:**
- Padding vertical: 16
- Fundo: Branco (#FFFFFF)
- ID: #planos

**Estrutura:**
1. **Cabeçalho Centralizado:**
   - Título: "Escolha seu Plano"
   - Descrição sobre acesso e cancelamento

2. **Grid de Planos:** (3 colunas em desktop)

**Planos Disponíveis:**

#### Plano Mensal
- Preço: R$ 19,90/mês
- Descrição: "Perfeito para experimentar"
- Features:
  - Acesso total ao catálogo
  - Até 2 dispositivos
  - Qualidade HD
  - Sem compromisso
  - Conteúdo novo toda semana
- Botão: Bege (#F0CD95)

#### Plano Anual (MAIS POPULAR)
- Preço: R$ 189,90/ano (era R$ 238,80)
- Badge: "Mais Popular" (verde)
- Descrição: "Economize 20% no plano anual"
- Features:
  - Acesso total ao catálogo
  - Até 4 dispositivos
  - Qualidade 4K Ultra HD
  - Download offline
  - Conteúdo novo toda semana
  - Apoio direto às instituições
- Borda: Verde dupla (2px)
- Botão: Verde (#8DA385)

#### Plano Família
- Preço: R$ 29,90/mês
- Descrição: "Para toda a família"
- Features:
  - Acesso total ao catálogo
  - Até 6 dispositivos
  - Qualidade 4K Ultra HD
  - Download ilimitado
  - Modo infantil exclusivo
  - Conteúdo novo toda semana
  - Controle parental avançado
- Botão: Bege (#F0CD95)

3. **Nota de Rodapé:** Texto sobre apoio às instituições

---

### 7. Footer (Rodapé)

**Arquivo:** `/components/Footer.tsx`

**Características:**
- Fundo: Cinza escuro (#4B4B4B)
- Texto: Branco meio escuro (#F9F7F3)
- Padding vertical: 12

**Estrutura:** Grid de 4 colunas em desktop

#### Coluna 1 - Brand
- Logo (cruz + FaithFlix)
- Tagline: "Streaming com propósito..."

#### Coluna 2 - Explorar
- Catálogo
- Novidades
- Categorias
- Minha Lista

#### Coluna 3 - Sobre
- Quem Somos
- Instituições
- Planos
- Ajuda

#### Coluna 4 - Legal + Social
- Termos de Uso
- Privacidade
- Cookies
- **Redes Sociais:**
  - Facebook
  - Instagram
  - Youtube
  - Twitter
  - Hover: Verde (#8DA385)

**Rodapé Final:**
- Copyright © 2024 FaithFlix
- Créditos da equipe: Matheus Bastos, Mateus Freitas, Davi Ribeiro, Kaue Silva

---

## 🎭 Estados e Interações

### Hover States

| Elemento | Estado Normal | Estado Hover |
|----------|---------------|--------------|
| Links de Navegação | #4B4B4B | #8DA385 |
| Content Card | Shadow-md, escala 1.0 | Shadow-xl, escala 1.1 |
| Botão Play (Card) | Invisível | Visível com overlay |
| Botões Primários | bg-[#8DA385] | bg-[#7a8f74] |
| Botões Secundários | bg-[#F0CD95] | bg-[#e5c189] |
| Links do Footer | opacity 70% | Cor bege (#F0CD95) |
| Social Icons | bg-white/10 | bg-[#8DA385] |
| Categorias | Outline | bg-[#F0CD95] |

### Transições

- **Cores:** `transition-colors`
- **Opacidade:** `transition-opacity`
- **Transform:** `transition-transform duration-300`
- **Shadow:** `transition-shadow`
- **Geral:** `transition-all duration-300`

---

## 📱 Responsividade

### Breakpoints (Tailwind)

| Breakpoint | Largura | Uso |
|------------|---------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Comportamentos Responsivos

#### Header
- **Mobile:** Logo + User + Botão Assinar
- **Tablet (md+):** + Navegação + Notificações
- **Desktop (lg+):** + Barra de Busca completa

#### Catalog Grid
- **Mobile:** 2 colunas
- **Tablet (md):** 3 colunas
- **Desktop (lg):** 5 colunas

#### Charity Stats
- **Mobile:** Empilhado (1 coluna)
- **Desktop (md):** 4 colunas

#### Charity Cards
- **Mobile:** Empilhado (1 coluna)
- **Desktop (md):** 3 colunas

#### Subscription Plans
- **Mobile:** Empilhado (1 coluna)
- **Desktop (md):** 3 colunas

#### Footer
- **Mobile:** Empilhado (1 coluna)
- **Desktop (md):** 4 colunas

---

## 🎨 Guia de Uso das Cores

### Cores Primárias

**Verde Pastel (#8DA385)** - Uso:
- Botões de ação primária
- Elementos interativos principais
- Indicadores de estado ativo
- Logo background
- Links hover
- Ícones de destaque

**Bege Claro (#F0CD95)** - Uso:
- Botões secundários
- Badges e tags
- Hover states de categorias
- Elementos de acento
- Rating stars

### Cores de Fundo

**Branco Meio Escuro (#F9F7F3)** - Uso:
- Background principal da página
- Seções alternadas
- Textos em fundos escuros

**Branco (#FFFFFF)** - Uso:
- Cards
- Inputs
- Áreas de conteúdo
- Seção de planos

### Cores de Texto

**Cinza Mediano (#4B4B4B)** - Uso:
- Texto principal
- Headings
- Labels
- Background do footer

**Cinza Mais Claro (#BFBFBF)** - Uso:
- Bordas
- Separadores
- Elementos desabilitados
- Background do switch

### Cores de Alerta

**Laranja (#D16449)** - Uso:
- Mensagens de erro
- Alertas importantes
- Elementos destrutivos
- Avisos críticos

---

## 🖼️ Recursos Visuais

### Imagens

Todas as imagens são obtidas via **Unsplash** com fallback:

**Queries de Busca Utilizadas:**
- `christian faith movie`
- `church worship people`
- `charity helping hands`
- `family watching together`
- `bible study cross`
- `prayer peaceful`

**Componente:** `ImageWithFallback` (caminho: `./components/figma/ImageWithFallback`)

### Ícones

**Biblioteca:** Lucide React

**Ícones Utilizados:**
- `Search` - Busca
- `Bell` - Notificações
- `User` - Perfil do usuário
- `Play` - Reproduzir conteúdo
- `Info` - Mais informações
- `Star` - Avaliações
- `ChevronRight` - Navegação/setas
- `Heart` - Doações/favoritos
- `Users` - Apoiadores/usuários
- `Award` - Conquistas/certificações
- `TrendingUp` - Crescimento/estatísticas
- `Check` - Confirmação/features incluídas
- `Facebook`, `Instagram`, `Youtube`, `Twitter` - Redes sociais

---

## 🔧 Tecnologias e Bibliotecas

### Core
- **React** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4.0** - Framework CSS utility-first

### UI Components
- **Shadcn/UI** - Biblioteca de componentes
  - Button
  - Card
  - Badge
  - Input
  - E outros (ver `/components/ui`)

### Utilities
- **Lucide React** - Ícones
- **ImageWithFallback** - Componente customizado para imagens

---

## 📝 Funcionalidades Planejadas (Não Implementadas)

### Backend (Necessário)
- [ ] Autenticação de usuários (login/registro)
- [ ] Sistema de gerenciamento de assinaturas
- [ ] Processamento de pagamentos
- [ ] API de streaming de vídeo
- [ ] Sistema de favoritos/watchlist
- [ ] Gestão de perfis de usuário
- [ ] Sistema de recomendações

### Níveis de Permissão
- [ ] Usuário comum (visualização)
- [ ] Usuário Premium (recursos extras)
- [ ] Administrador (gestão de conteúdo)
- [ ] Instituições de caridade (dashboard específico)

### Páginas Internas
- [ ] Página de login/registro
- [ ] Player de vídeo
- [ ] Página de detalhes do conteúdo
- [ ] Perfil do usuário
- [ ] Painel administrativo
- [ ] Dashboard de instituições
- [ ] Página de pagamento
- [ ] Histórico de visualizações
- [ ] Configurações da conta

### Funcionalidades Adicionais
- [ ] Busca em tempo real
- [ ] Filtros avançados
- [ ] Sistema de notificações
- [ ] Comentários e avaliações
- [ ] Compartilhamento social
- [ ] Downloads offline (app)
- [ ] Controle parental
- [ ] Modo infantil
- [ ] Legendas e áudio
- [ ] Qualidade de streaming adaptativa

---

## 🚀 Próximos Passos

### Fase 1 - Backend e Autenticação
1. Implementar sistema de autenticação (Firebase/Supabase)
2. Criar API REST ou GraphQL
3. Configurar banco de dados (PostgreSQL recomendado)
4. Implementar gestão de sessões

### Fase 2 - Player e Streaming
1. Integrar player de vídeo (Video.js, Plyr, ou similar)
2. Configurar CDN para streaming
3. Implementar sistema de legendas
4. Adicionar controles de qualidade

### Fase 3 - Pagamentos e Assinaturas
1. Integrar gateway de pagamento (Stripe, PagSeguro)
2. Implementar lógica de planos
3. Sistema de renovação automática
4. Gestão de cobranças

### Fase 4 - Features Avançadas
1. Sistema de recomendações
2. Busca inteligente
3. Analytics e métricas
4. Dashboard administrativo
5. Aplicativo mobile (React Native)

---

## 📚 Convenções de Código

### Nomenclatura
- **Componentes:** PascalCase (ex: `ContentCard`, `HeroSection`)
- **Arquivos:** PascalCase.tsx (ex: `Header.tsx`)
- **Props:** camelCase (ex: `isHovered`, `onToggle`)
- **CSS Classes:** Tailwind utilities
- **IDs de Seção:** kebab-case (ex: `#catalogo`, `#instituicoes`)

### Estrutura de Componentes
```typescript
// Imports
import { ... } from "...";

// Types/Interfaces
interface ComponentProps {
  ...
}

// Dados estáticos (se houver)
const data = [...];

// Componente
export function Component({ props }: ComponentProps) {
  // State
  const [state, setState] = useState();

  // Handlers
  const handleEvent = () => {};

  // Render
  return (
    <div>
      ...
    </div>
  );
}
```

### Estilização
- Priorizar Tailwind utilities
- Usar tokens CSS quando apropriado
- `style={{...}}` apenas para valores dinâmicos ou específicos
- Manter consistência de cores via design tokens

---

## 📖 Referências

### Design Tokens Location
- Arquivo: `/styles/globals.css`
- Linhas: 1-189

### Componentes UI (Shadcn)
- Diretório: `/components/ui/`
- Documentação: [ui.shadcn.com](https://ui.shadcn.com)

### Tailwind CSS
- Versão: 4.0
- Documentação: [tailwindcss.com](https://tailwindcss.com)

### Lucide Icons
- Biblioteca: lucide-react
- Documentação: [lucide.dev](https://lucide.dev)

---

## 👥 Equipe de Desenvolvimento

- **Matheus Bastos**
- **Mateus Freitas**
- **Davi Ribeiro**
- **Kaue Silva**

---

## 📄 Licença e Direitos

© 2024 FaithFlix. Todos os direitos reservados.

---

**Última Atualização:** Novembro 2024  
**Versão do Documento:** 1.0

---

## 📞 Contato e Suporte

Para questões sobre implementação ou design, consulte a equipe de desenvolvimento.

---

*Este documento serve como referência completa para o sistema de design, estrutura de componentes e especificações técnicas da plataforma FaithFlix.*
