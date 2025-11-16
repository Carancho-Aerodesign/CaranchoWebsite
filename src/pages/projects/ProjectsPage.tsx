import { ClipboardList } from 'lucide-react';

import type { Project } from '../../types';

interface ProjectsPageProps {
  projects: Project[];
}

export function ProjectsPage({ projects }: ProjectsPageProps) {
  const sortedProjects = [...projects].sort((a, b) => b.year - a.year);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <ClipboardList className="mx-auto h-12 w-12 text-[#d4982c]" />
        <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">Nossos Projetos</h1>
        <p className="mt-2 max-w-2xl mx-auto text-lg text-gray-600">
          Uma viagem pela nossa história de inovação e engenharia.
        </p>
      </div>
      {sortedProjects.length ? (
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-300 hidden md:block" />
          <div className="space-y-16">
            {sortedProjects.map((project, index) => (
              <div key={project.id} className="relative">
                <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-4 h-4 rounded-full bg-[#d4982c] border-4 border-gray-100 hidden md:block" />
                <div
                  className={`flex flex-col md:flex-row items-center gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className="md:w-1/2">
                    <img
                      src={project.imageUrl || 'https://placehold.co/600x400/e0e0e0/888888?text=Projeto'}
                      alt={project.title}
                      className="w-full h-auto rounded-lg shadow-lg object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="md:w-1/2 bg-white p-6 rounded-xl border border-gray-200 shadow-md">
                    <p className="text-2xl font-bold text-[#d4982c] mb-2">{project.year}</p>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{project.title}</h3>
                    <p className="text-gray-600 text-justify">{project.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>Ainda não há projetos para exibir. Volte em breve!</p>
        </div>
      )}
    </div>
  );
}
