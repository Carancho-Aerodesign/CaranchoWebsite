import { Users } from 'lucide-react';

import type { SiteSettings, TeamHierarchy } from '../../types';

interface AboutPageProps {
  teamHierarchy: TeamHierarchy | null;
  siteSettings: SiteSettings;
  projectCount: number;
}

export function AboutPage({ teamHierarchy, siteSettings, projectCount }: AboutPageProps) {
  const memberCount = teamHierarchy?.members?.length ?? 0;
  const participationCount = projectCount;

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <Users className="mx-auto h-12 w-12 text-[#d4982c]" />
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Sobre Nós</h1>
      </div>
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-md space-y-8">
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-4xl font-bold text-[#d4982c]">{memberCount}</h3>
            <p className="mt-2 text-lg text-gray-600">Membros Atuais</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-4xl font-bold text-[#d4982c]">{participationCount}</h3>
            <p className="mt-2 text-lg text-gray-600">Participações / Projetos</p>
          </div>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 text-justify">
          <h2 className="text-[#d4982c]">Nossa História</h2>
          <p>{siteSettings.history || 'Atualize o painel administrativo para contar a nossa história.'}</p>
        </div>
        <div className="prose prose-lg max-w-none text-gray-600 text-justify">
          <h2 className="text-[#d4982c]">Missão e Visão</h2>
          <p>
            <strong>Missão:</strong> {siteSettings.mission || 'Defina a missão no painel administrativo.'}
          </p>
          <p>
            <strong>Visão:</strong> {siteSettings.vision || 'Defina a visão no painel administrativo.'}
          </p>
        </div>
      </div>
    </div>
  );
}
