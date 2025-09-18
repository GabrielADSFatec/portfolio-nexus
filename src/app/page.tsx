import { Suspense } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import ClientsSection from '@/components/sections/ClientsSection';
import ContactSection from '@/components/sections/ContactSection';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section com Carrossel */}
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
        <HeroSection />
      </Suspense>

      {/* Seção de Projetos */}
      <Suspense fallback={<div className="py-20 flex items-center justify-center"><LoadingSpinner /></div>}>
        <ProjectsSection />
      </Suspense>

      {/* Seção de Clientes */}
      <Suspense fallback={<div className="py-20 flex items-center justify-center"><LoadingSpinner /></div>}>
        <ClientsSection />
      </Suspense>

      {/* Seção de Contato */}
      <ContactSection />
    </main>
  );
}