// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetData, buildMediaUrl } from '../services/api';

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

interface Union {
  id: string;
  person1Id: string;
  person2Id: string;
  unionType: string;
  startDate?: string;
  location?: string;
  status: string;
}

interface MultiSpouseTreeProps {
  persons: Person[];
  focusedPersonId?: string;
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

export const MultiSpouseTree: React.FC<MultiSpouseTreeProps> = ({ persons, focusedPersonId, onSelectPerson }) => {
  const navigate = useNavigate();
  const [unions, setUnions] = React.useState<Union[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);

  React.useEffect(() => {
    apiGetData<any[]>('/unions')
      .then((data) => setUnions(data || []))
      .catch(() => setUnions([]));

    const personWithMultipleSpouses = persons.find((person) => {
      const spouseCount = persons.filter((candidate) =>
        person.relations?.some((relation) => relation.type === 'SPOUSE' && relation.relatedPersonId === candidate.id),
      ).length;
      return spouseCount > 1;
    });

    setSelectedPerson(personWithMultipleSpouses || persons[0] || null);
  }, [persons]);

  React.useEffect(() => {
    if (!focusedPersonId) return;
    const focused = persons.find((person) => person.id === focusedPersonId);
    if (focused) {
      setSelectedPerson(focused);
    }
  }, [focusedPersonId, persons]);

  const getSpouses = React.useCallback((personId: string) => {
    const person = persons.find((candidate) => candidate.id === personId);
    if (!person) return [];

    return persons.filter((candidate) =>
      person.relations?.some((relation) => relation.type === 'SPOUSE' && relation.relatedPersonId === candidate.id),
    );
  }, [persons]);

  const getUnionBetween = React.useCallback((person1Id: string, person2Id: string) => {
    return unions.find(
      (union) =>
        (union.person1Id === person1Id && union.person2Id === person2Id) ||
        (union.person1Id === person2Id && union.person2Id === person1Id),
    );
  }, [unions]);

  const getChildrenOfUnion = React.useCallback((person1Id: string, person2Id: string) => {
    return persons.filter((child) => {
      const parents = persons.filter((candidate) =>
        child.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === candidate.id),
      );
      return parents.some((parent) => parent.id === person1Id) && parents.some((parent) => parent.id === person2Id);
    });
  }, [persons]);

  const PersonCard: React.FC<{ person: Person; size?: 'small' | 'large' }> = ({ person, size = 'small' }) => {
    const large = size === 'large';
    return (
      <article
        onClick={() => {
          if (onSelectPerson) {
            onSelectPerson(person);
            return;
          }
          navigate(`/person/${person.id}`);
        }}
        className={`tree-card relative cursor-pointer ${large ? 'w-full max-w-[340px]' : ''} ${getCardTone(person)}`}
      >
        <div className="flex items-center gap-3">
          <div className={`tree-avatar shrink-0 ${large ? 'h-16 w-16' : 'h-12 w-12'}`}>
            {person.profilePhotoUrl ? (
              <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
            ) : (
              <span className={`font-display text-[var(--color-accent)] ${large ? 'text-xl' : 'text-lg'}`}>
                {person.firstName?.[0]}
                {person.lastName?.[0]}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className={`truncate font-semibold text-[var(--color-text)] ${large ? 'text-base' : 'text-sm'}`}>
              {person.firstName} {person.lastName}
            </div>
            <div className="tree-meta text-xs">{getYearRange(person)}</div>
          </div>
        </div>

        {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
      </article>
    );
  };

  if (!selectedPerson) {
    return (
      <div className="tree-empty">
        <div className="font-display text-3xl text-[var(--color-text)]">Aucune personne</div>
        <p className="tree-meta mt-3 max-w-md text-sm leading-7">Ajoutez des unions pour activer cette vue.</p>
      </div>
    );
  }

  const spouses = getSpouses(selectedPerson.id);
  const totalChildren = spouses.reduce((sum, spouse) => sum + getChildrenOfUnion(selectedPerson.id, spouse.id).length, 0);

  return (
    <div className="tree-surface">
      <div className="tree-toolbar flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="app-kicker mb-2">Unions</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue multi-unions</h2>
          </div>
          <select
            value={selectedPerson.id}
            onChange={(event) => {
              const person = persons.find((candidate) => candidate.id === event.target.value);
              if (person) {
                setSelectedPerson(person);
                onSelectPerson?.(person);
              }
            }}
            className="app-select min-w-[280px]"
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.firstName} {person.lastName} ({getSpouses(person.id).length})
              </option>
            ))}
          </select>
        </div>

        <div className="tree-chip">{spouses.length} union{spouses.length > 1 ? 's' : ''}</div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {spouses.length === 0 ? (
          <div className="tree-empty">
            <div className="font-display text-3xl text-[var(--color-text)]">Aucune union trouvee</div>
            <p className="tree-meta mt-3 max-w-md text-sm leading-7">Selectionnez une autre personne ou ajoutez une union pour activer cette vue.</p>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="flex justify-center">
              <PersonCard person={selectedPerson} size="large" />
            </div>

            <div className="flex items-center gap-4">
              <div className="tree-line h-px flex-1"></div>
              <span className="tree-chip tree-chip-highlight">Unions</span>
              <div className="tree-line h-px flex-1"></div>
            </div>

            <div className="space-y-6">
              {spouses.map((spouse, index) => {
                const union = getUnionBetween(selectedPerson.id, spouse.id);
                const children = getChildrenOfUnion(selectedPerson.id, spouse.id);

                return (
                  <section key={spouse.id} className="tree-panel p-6">
                    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="tree-chip tree-chip-accent mt-1">{index + 1}</div>
                        <div>
                          <h3 className="font-display text-2xl text-[var(--color-text)]">Union {index + 1}</h3>
                          <div className="tree-meta mt-2 space-y-1 text-sm">
                            {union?.startDate && <div>Debut: {new Date(union.startDate).toLocaleDateString('fr-FR')}</div>}
                            {union?.location && <div>Lieu: {union.location}</div>}
                          </div>
                        </div>
                      </div>

                      <div>
                        {union?.status === 'active' ? (
                          <span className="tree-chip tree-chip-accent">Active</span>
                        ) : (
                          <span className="tree-chip">Terminee</span>
                        )}
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] tree-meta">Conjoint</div>
                      <PersonCard person={spouse} />
                    </div>

                    {children.length > 0 ? (
                      <div>
                        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] tree-meta">
                          Enfants de cette union ({children.length})
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {children.map((child) => (
                            <PersonCard key={child.id} person={child} />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="tree-empty py-10">
                        <div className="text-base font-semibold text-[var(--color-text)]">Aucun enfant renseigne</div>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <section className="tree-panel grid gap-4 p-6 md:grid-cols-3">
              <div className="text-center">
                <div className="font-display text-4xl text-[var(--color-text)]">{spouses.length}</div>
                <div className="tree-meta mt-2 text-sm">Union{spouses.length > 1 ? 's' : ''}</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-[var(--color-text)]">{totalChildren}</div>
                <div className="tree-meta mt-2 text-sm">Enfants au total</div>
              </div>
              <div className="text-center">
                <div className="font-display text-4xl text-[var(--color-text)]">{unions.filter((union) => union.status === 'active').length}</div>
                <div className="tree-meta mt-2 text-sm">Unions actives</div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
