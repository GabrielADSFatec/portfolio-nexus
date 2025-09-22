// Navegação do site público
export const publicNavigation = [
  {
    name: 'Início',
    href: '/',
    icon: 'Home',
  },
  {
    name: 'Projetos',
    href: '/#projetos',  // Modificado
    icon: 'Briefcase',
  },
  {
    name: 'Clientes',
    href: '/#clientes',  // Modificado
    icon: 'Users',
  },
  {
    name: 'Contato',
    href: '/#contato',   // Modificado
    icon: 'Mail',
  },
] as const;

// Navegação do admin
export const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: 'LayoutDashboard',
    description: 'Visão geral do sistema',
  },
  {
    name: 'Carrossel',
    href: '/admin/carousel',
    icon: 'Images',
    description: 'Gerenciar slides do carrossel',
  },
  {
    name: 'Projetos',
    href: '/admin/projects',
    icon: 'Briefcase',
    description: 'Gerenciar portfólio de projetos',
  },
  {
    name: 'Clientes',
    href: '/admin/clients',
    icon: 'Users',
    description: 'Gerenciar lista de clientes',
  },
  {
    name: 'Mensagens',
    href: '/admin/messages',
    icon: 'MessageSquare',
    description: 'Visualizar mensagens de contato',
  },
] as const;

// Links sociais (exemplo)
export const socialLinks = [
  {
    name: 'GitHub',
    href: 'https://github.com/FatecEJ',
    icon: 'Github',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/seuusuario',
    icon: 'Linkedin',
  },
  {
    name: 'Email',
    href: 'mailto:empreendefatecej@gmail.com',
    icon: 'Mail',
  },
] as const;

// Configurações do site
export const siteConfig = {
  name: 'NexusJr',
  title: 'Escritório de Projetos - NexusJr',
  description: 'Escritório de projetos da Fatec Itu - NexusJr',
  url: 'https://seusite.com',
  keywords: [
    'desenvolvedor',
    'fullstack',
    'react',
    'nextjs',
    'nodejs',
    'javascript',
    'typescript',
    'portfolio',
    'fatec',
    'itu',
    'nexus',
  ],
} as const;

// Seções da homepage
export const homeSections = [
  {
    id: 'hero',
    name: 'Hero',
    title: 'Início',
  },
  {
    id: 'projetos',
    name: 'Projects',
    title: 'Projetos',
  },
  {
    id: 'clientes',
    name: 'Clients',
    title: 'Clientes',
  },
  {
    id: 'contato',
    name: 'Contact',
    title: 'Contato',
  },
] as const;