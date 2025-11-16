import { Trophy, Crown, User } from 'lucide-react';

import type { Achievement, SiteSettings, Sponsor, TeamHierarchy, TeamMember } from '../../types';

const CAPTAIN_ROLES: string[] = ['Capitão', 'Capitã'];
const VICE_CAPTAIN_ROLES: string[] = ['Vice-capitão', 'Vice-capitã'];
const SUPPORT_ROLES: string[] = ['Piloto', 'Administrador', 'Orientador'];

interface HomePageProps {
  teamHierarchy: TeamHierarchy | null;
  sponsors: Sponsor[];
  siteSettings: SiteSettings;
  achievements: Achievement[];
  onMemberSelect: (member: TeamMember) => void;
}

export function HomePage({ teamHierarchy, sponsors, siteSettings, achievements, onMemberSelect }: HomePageProps) {
  return (
    <div className="space-y-24 md:space-y-32 mb-24 md:mb-32">
      <div className="relative h-[80vh] flex items-center justify-center text-center -mt-20 px-4">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url('${siteSettings.heroImageUrl}')` }}
        />
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div className="relative z-20">
          <h1 className="font-poppins text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 text-shadow-lg text-white">
            Carancho Aerodesign
          </h1>
        </div>
      </div>

      <SponsorsCarousel sponsors={sponsors} />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossas Conquistas</h2>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-1 md:grid-cols-3">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <AchievementCard key={achievement.id} title={achievement.title} description={achievement.description} />
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">Nenhuma conquista adicionada ainda.</p>
          )}
        </div>
      </section>

      <TeamHierarchySection teamHierarchy={teamHierarchy} onMemberSelect={onMemberSelect} />
    </div>
  );
}

interface AchievementCardProps {
  title: string;
  description: string;
}

function AchievementCard({ title, description }: AchievementCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-[#d4982c]/10 text-[#d4982c]">
          <Trophy />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

interface TeamHierarchySectionProps {
  teamHierarchy: TeamHierarchy | null;
  onMemberSelect: (member: TeamMember) => void;
}

function TeamHierarchySection({ teamHierarchy, onMemberSelect }: TeamHierarchySectionProps) {
  if (!teamHierarchy || !teamHierarchy.members?.length) {
    return (
      <div className="text-center text-gray-500 py-10 max-w-2xl mx-auto">
        A equipa ainda não foi formada. Adicione membros no painel de administração para começar.
      </div>
    );
  }

  const captain = teamHierarchy.members.find((member) => member.generalRoles?.some((role) => CAPTAIN_ROLES.includes(role)));
  const viceCaptain = teamHierarchy.members.find(
    (member) =>
      member.id !== captain?.id && member.generalRoles?.some((role) => VICE_CAPTAIN_ROLES.includes(role)),
  );
  const supportMembers = teamHierarchy.members.filter(
    (member) =>
      member.generalRoles?.some((role) => SUPPORT_ROLES.includes(role)) &&
      !member.generalRoles?.some((role) => CAPTAIN_ROLES.includes(role) || VICE_CAPTAIN_ROLES.includes(role)),
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossa Estrutura</h2>
      </div>

      {(captain || viceCaptain) ? (
        <div className="flex justify-center gap-6 flex-wrap">
          {captain ? (
            <MemberCard
              member={captain}
              displayRole={captain.generalRoles?.find((role) => CAPTAIN_ROLES.includes(role)) ?? 'Capitão'}
              onCardClick={onMemberSelect}
            />
          ) : null}
          {viceCaptain ? (
            <MemberCard
              member={viceCaptain}
              displayRole={viceCaptain.generalRoles?.find((role) => VICE_CAPTAIN_ROLES.includes(role)) ?? 'Vice-capitão'}
              onCardClick={onMemberSelect}
            />
          ) : null}
        </div>
      ) : null}

      <div className="space-y-12">
        {teamHierarchy.departments.map((department) => {
          const departmentMembers = teamHierarchy.members.filter((member) =>
            member.assignments?.some((assignment) => assignment.department === department.name),
          );

          if (!departmentMembers.length) {
            return null;
          }

          return (
            <div key={department.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">{department.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 justify-items-center">
                {departmentMembers.map((member) => {
                  const assignment = member.assignments?.find((item) => item.department === department.name);
                  return (
                    <MemberCard
                      key={member.id}
                      member={member}
                      displayRole={assignment?.role ?? ''}
                      onCardClick={onMemberSelect}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {supportMembers.length ? (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Funções de Suporte</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 justify-items-center">
              {supportMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  displayRole={
                    (member.generalRoles ?? []).filter((role) => !CAPTAIN_ROLES.includes(role)).join(', ')
                  }
                  onCardClick={onMemberSelect}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

interface MemberCardProps {
  member: TeamMember;
  onCardClick: (member: TeamMember) => void;
  displayRole: string;
}

function MemberCard({ member, onCardClick, displayRole }: MemberCardProps) {
  const isCaptain = member.generalRoles?.some((role) => CAPTAIN_ROLES.includes(role));
  const Icon = isCaptain ? Crown : User;

  return (
    <button
      type="button"
      className="text-center group"
      onClick={() => onCardClick(member)}
    >
      <div
        className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto transform transition-all duration-300 group-hover:scale-105 shadow-lg ring-2 ${
          isCaptain ? 'ring-[#d4982c]' : 'ring-gray-300 group-hover:ring-[#d4982c]'
        }`}
      >
        {member.img ? (
          <img src={member.img} alt={member.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Icon size={isCaptain ? 40 : 32} className="text-gray-500" />
          </div>
        )}
      </div>
      <h4 className="mt-3 text-base sm:text-lg font-bold text-gray-900">{member.name}</h4>
      <p className="text-sm font-semibold text-[#d4982c]">{displayRole}</p>
    </button>
  );
}

interface SponsorsCarouselProps {
  sponsors: Sponsor[];
}

function SponsorsCarousel({ sponsors }: SponsorsCarouselProps) {
  if (!sponsors.length) {
    return null;
  }

  const animationDuration = sponsors.length * 5;

  return (
    <section className="py-12 bg-gray-100">
      <div className="text-center mb-10 px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-[#d4982c]">Nossos Parceiros</h2>
      </div>
      <div
        className="w-full inline-flex flex-nowrap overflow-hidden group"
        style={{ maskImage: 'linear-gradient(to right, transparent 0, black 10%, black 90%, transparent 100%)' }}
      >
        <div
          className="flex items-center justify-start animate-infinite-scroll group-hover:pause"
          style={{ animationDuration: `${animationDuration}s` }}
        >
          {[...sponsors, ...sponsors].map((sponsor, index) => (
            <div key={`${sponsor.id}-${index}`} className="mx-8 flex-shrink-0">
              <img src={sponsor.logo} alt={sponsor.name} className="max-h-24 w-auto" loading="lazy" decoding="async" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
