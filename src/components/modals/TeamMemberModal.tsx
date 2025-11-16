import type { ReactNode } from 'react';
import { Briefcase, CalendarDays, GraduationCap, User, Users, X } from 'lucide-react';

import type { TeamMember } from '../../types';
import { calculateAgeFromDate, parseDateInput } from '../../utils/dateHelpers';

interface TeamMemberModalProps {
  member: TeamMember | null;
  onClose: () => void;
}

export function TeamMemberModal({ member, onClose }: TeamMemberModalProps) {
  if (!member) {
    return null;
  }

  const { name, assignments, generalRoles, age, course, img, birthDate } = member;
  const computedAge = calculateAgeFromDate(birthDate, age);
  const birthInfo = computedAge ? `${computedAge} anos` : null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 animate-scale-up flex flex-col md:flex-row overflow-hidden relative"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="md:w-2/5 flex-shrink-0 bg-gray-100">
          {img ? (
            <img src={img} alt={name} className="w-full h-48 md:h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <div className="w-full h-48 md:h-full flex items-center justify-center">
              <User size={96} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-grow text-gray-800">
          <h2 className="text-3xl font-bold text-[#d4982c] mb-4">{name}</h2>
          <div className="space-y-3 text-gray-600 flex-grow">
            {generalRoles?.length ? (
              <InfoRow icon={<Briefcase size={16} />}>
                {generalRoles.join(', ')}
              </InfoRow>
            ) : null}

            {assignments?.length ? (
              <div className="flex items-start">
                <Users size={16} className="mr-3 mt-1 text-[#d4982c] flex-shrink-0" />
                <div>
                  {assignments.map((assignment) => (
                    <div key={`${assignment.department}-${assignment.role}`}>
                      {assignment.department}: <span className="font-semibold">{assignment.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {birthInfo ? <InfoRow icon={<CalendarDays size={16} />}>{birthInfo}</InfoRow> : null}
            {course ? <InfoRow icon={<GraduationCap size={16} />}>{course}</InfoRow> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full md:w-auto self-end bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 bg-white/50 p-1.5 rounded-full text-gray-800 hover:bg-white/80 transition-colors md:hidden"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  children: ReactNode;
}

function InfoRow({ icon, children }: InfoRowProps) {
  return (
    <div className="flex items-center">
      <span className="mr-3 text-[#d4982c] flex-shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
