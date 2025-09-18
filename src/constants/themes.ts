import { ColorPalette, Theme } from '@/types/theme';

// Paleta principal baseada em azul
export const colors: ColorPalette = {
  primary: {
    50: '#eff6ff',   // Azul muito claro
    100: '#dbeafe',  // Azul claro
    200: '#bfdbfe',  // Azul claro médio
    300: '#93c5fd',  // Azul médio claro
    400: '#60a5fa',  // Azul médio
    500: '#3b82f6',  // Azul principal
    600: '#2563eb',  // Azul forte
    700: '#1d4ed8',  // Azul escuro
    800: '#1e40af',  // Azul muito escuro
    900: '#1e3a8a',  // Azul profundo
    950: '#172554',  // Azul mais escuro
  },
  secondary: {
    50: '#f0f9ff',   // Azul céu muito claro
    100: '#e0f2fe',  // Azul céu claro
    200: '#bae6fd',  // Azul céu médio claro
    300: '#7dd3fc',  // Azul céu médio
    400: '#38bdf8',  // Azul céu
    500: '#0ea5e9',  // Azul céu principal
    600: '#0284c7',  // Azul céu forte
    700: '#0369a1',  // Azul céu escuro
    800: '#075985',  // Azul céu muito escuro
    900: '#0c4a6e',  // Azul céu profundo
  },
  neutral: {
    50: '#f8fafc',   // Branco azulado
    100: '#f1f5f9',  // Cinza muito claro
    200: '#e2e8f0',  // Cinza claro
    300: '#cbd5e1',  // Cinza médio claro
    400: '#94a3b8',  // Cinza médio
    500: '#64748b',  // Cinza
    600: '#475569',  // Cinza escuro
    700: '#334155',  // Cinza muito escuro
    800: '#1e293b',  // Cinza profundo
    900: '#0f172a',  // Quase preto
    950: '#020617',  // Preto azulado
  },
  accent: {
    blue: '#0066cc',      // Azul corporativo
    lightBlue: '#4da6ff', // Azul claro vibrante
    darkBlue: '#003d7a',  // Azul escuro corporativo
    cyan: '#00b4d8',      // Ciano para destaques
  }
};

// Configurações de espaçamento
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
};

// Configurações de tipografia
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Monaco', 'Courier New', 'monospace'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  } as Record<string, [string, { lineHeight: string }]>,
};

// Configurações de border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

// Configurações de sombras
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  blue: '0 10px 15px -3px rgb(59 130 246 / 0.2), 0 4px 6px -4px rgb(59 130 246 / 0.1)',
  'blue-lg': '0 20px 25px -5px rgb(59 130 246 / 0.3), 0 8px 10px -6px rgb(59 130 246 / 0.2)',
};

// Tema principal
export const theme: Theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

// Classes CSS customizadas para usar com Tailwind
export const customClasses = {
  // Gradientes azuis
  gradients: {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500',
    secondary: 'bg-gradient-to-r from-secondary-500 to-primary-600',
    hero: 'bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600',
    subtle: 'bg-gradient-to-r from-primary-50 to-secondary-50',
    dark: 'bg-gradient-to-r from-primary-900 to-primary-800',
  },
  
  // Botões estilizados
  buttons: {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-200',
    ghost: 'text-primary-600 hover:bg-primary-50 font-medium py-3 px-6 rounded-lg transition-all duration-200',
  },
  
  // Cards
  cards: {
    primary: 'bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-neutral-200',
    featured: 'bg-white rounded-xl shadow-blue hover:shadow-blue-lg transition-all duration-300 border border-primary-200',
    dark: 'bg-neutral-800 rounded-xl shadow-lg border border-neutral-700',
  },
  
  // Textos
  text: {
    heading: 'text-neutral-900 font-bold',
    subheading: 'text-neutral-700 font-semibold',
    body: 'text-neutral-600',
    muted: 'text-neutral-500',
    accent: 'text-primary-600 font-semibold',
  }
};

export default theme;