// Exportar todos os temas e constantes
export * from './themes';
export * from './navigation';

// Re-exportar as principais configurações
export { theme as defaultTheme, colors, customClasses } from './themes';
export { 
  publicNavigation, 
  adminNavigation, 
  socialLinks, 
  siteConfig,
  homeSections 
} from './navigation';