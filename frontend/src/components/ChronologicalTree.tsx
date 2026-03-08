// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildMediaUrl } from '../services/api';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  deathDate?: string;
  profilePhotoUrl?: string;
  gender?: string;
  relations?: Array<{ type: string; relatedPersonId: string }>;
}

interface ChronologicalTreeProps {
  persons: Person[];
  onSelectPerson?: (person: Person) => void;
}

const getCardTone = (person: Person) => {
  if (person.gender === 'MALE') return 'tree-card-male';
  if (person.gender === 'FEMALE') return 'tree-card-female';
  return 'tree-card-neutral';
};

const getYearRange = (person: Person) => {
  const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
  const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
  return death ? `${birth} - ${death}` : `${birth}`;
};

export const ChronologicalTree: React.FC<ChronologicalTreeProps> = ({ persons, onSelectPerson }) => {
  const navigate = useNavigate();
  const [selectedDecade, setSelectedDecade] = React.useState<number | null>(null);

  const personsByDecade = React.useMemo(() => {
    const grouped = new Map<number, Person[]>();

    persons.forEach((person) => {
      if (!person.birthDate) return;
      const year = new Date(person.birthDate).getFullYear();
      const decade = Math.floor(year / 10) * 10;
      if (!grouped.has(decade)) {
        grouped.set(decade, []);
      }
      grouped.get(decade)?.push(person);
    });

    return new Map([...grouped.entries()].sort((left, right) => left[0] - right[0]));
  }, [persons]);

  const decades = Array.from(personsByDecade.keys());
  const minDecade = decades.length > 0 ? Math.min(...decades) : null;
  const maxDecade = decades.length > 0 ? Math.max(...decades) : null;

  const getAge = (person: Person) => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate).getFullYear();
    const end = person.deathDate ? new Date(person.deathDate).getFullYear() : new Date().getFullYear();
    return end - birth;
  };

  const openPerson = (person: Person) => {
    if (onSelectPerson) {
      onSelectPerson(person);
      return;
    }
    navigate(`/person/${person.id}`);
  };

  if (decades.length === 0) {
    return (
      <div className="tree-empty">
        <div className="font-display text-3xl text-[var(--color-text)]">Aucune date disponible</div>
        <p className="tree-meta mt-3 max-w-md text-sm leading-7">Ajoutez des dates de naissance pour faire vivre la vue chronologique.</p>
      </div>
    );
  }

  return (
    <div className="tree-surface">
      <div className="tree-toolbar space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="app-kicker mb-2">Timeline</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue chronologique</h2>
          </div>
          <div className="tree-chip">
            {minDecade}s - {maxDecade}s
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {decades.map((decade) => {
            const count = personsByDecade.get(decade)?.length || 0;
            const selected = selectedDecade === decade;
            return (
              <button
                key={decade}
                type="button"
                onClick={() => setSelectedDecade(selected ? null : decade)}
                className={selected ? 'app-button-primary shrink-0 px-5 py-3' : 'app-button-ghost shrink-0 px-5 py-3'}
              >
                <span className="text-sm font-semibold">{decade}s</span>
                <span className="ml-2 text-xs opacity-80">{count}</span>
              </button>
            );
          })}

          {selectedDecade !== null && (
            <button type="button" onClick={() => setSelectedDecade(null)} className="app-button-ghost shrink-0 px-5 py-3">
              Voir toute la periode
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {selectedDecade !== null ? (
          <div>
            <div className="mb-6">
              <h3 className="font-display text-3xl text-[var(--color-text)]">Annees {selectedDecade}s</h3>
              <p className="tree-meta mt-2 text-sm">Parcours detaille par annee de naissance.</p>
            </div>

            <div className="space-y-8">
              {Array.from({ length: 10 }, (_, index) => selectedDecade + index).map((year) => {
                const personsInYear = (personsByDecade.get(selectedDecade) || []).filter(
                  (person) => new Date(person.birthDate!).getFullYear() === year,
                );

                if (personsInYear.length === 0) return null;

                return (
                  <section key={year} className="relative">
                    <div className="tree-line absolute left-8 top-0 bottom-0 w-px"></div>
                    <div className="flex gap-4">
                      <div className="w-16 shrink-0 text-right">
                        <div className="tree-chip tree-chip-accent inline-flex">{year}</div>
                      </div>

                      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                        {personsInYear.map((person) => (
                          <article key={person.id} onClick={() => openPerson(person)} className={`tree-card relative cursor-pointer ${getCardTone(person)}`}>
                            <div className="flex items-center gap-3">
                              <div className="tree-avatar h-12 w-12 shrink-0">
                                {person.profilePhotoUrl ? (
                                  <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
                                ) : (
                                  <span className="font-display text-lg text-[var(--color-accent)]">
                                    {person.firstName?.[0]}
                                    {person.lastName?.[0]}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                                  {person.firstName} {person.lastName}
                                </div>
                                <div className="tree-meta text-xs">{getYearRange(person)}</div>
                                {getAge(person) !== null && <div className="tree-meta mt-1 text-xs">{getAge(person)} ans</div>}
                              </div>
                            </div>

                            {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {decades.map((decade) => {
              const personsInDecade = personsByDecade.get(decade) || [];
              return (
                <section key={decade} className="tree-panel p-6">
                  <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-display text-2xl text-[var(--color-text)]">Annees {decade}s</h3>
                      <p className="tree-meta mt-2 text-sm">{personsInDecade.length} personnes enregistrees</p>
                    </div>
                    <button type="button" onClick={() => setSelectedDecade(decade)} className="app-button-secondary">
                      Voir le detail
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
                    {personsInDecade.slice(0, 12).map((person) => (
                      <article key={person.id} onClick={() => openPerson(person)} className={`tree-card relative cursor-pointer p-3 ${getCardTone(person)}`}>
                        <div className="tree-avatar mx-auto mb-2 h-12 w-12">
                          {person.profilePhotoUrl ? (
                            <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="font-display text-base text-[var(--color-accent)]">
                              {person.firstName?.[0]}
                              {person.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div className="truncate text-center text-xs font-semibold text-[var(--color-text)]">{person.firstName}</div>
                        <div className="tree-meta text-center text-xs">
                          {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
                        </div>
                        {person.deathDate && <div className="tree-death-mark absolute -right-1 -top-1 h-6 w-6">D</div>}
                      </article>
                    ))}

                    {personsInDecade.length > 12 && (
                      <button type="button" onClick={() => setSelectedDecade(decade)} className="tree-panel flex min-h-[148px] flex-col items-center justify-center p-4 text-center transition-colors hover:bg-white/35 dark:hover:bg-white/5">
                        <div className="font-display text-3xl text-[var(--color-text)]">+{personsInDecade.length - 12}</div>
                        <div className="tree-meta mt-2 text-xs uppercase tracking-[0.16em]">Voir plus</div>
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
