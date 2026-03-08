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

interface CompactTreeProps {
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

export const CompactTree: React.FC<CompactTreeProps> = ({ persons, onSelectPerson }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGeneration, setSelectedGeneration] = React.useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string>('all');
  const [showAliveOnly, setShowAliveOnly] = React.useState(false);
  const [showDeceasedOnly, setShowDeceasedOnly] = React.useState(false);

  const getGeneration = React.useCallback((person: Person): number => {
    const hasParents = person.relations?.some((relation) => relation.type === 'PARENT');
    if (!hasParents) return 0;

    const parents = persons.filter((candidate) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === candidate.id),
    );

    if (parents.length === 0) return 0;
    return Math.max(...parents.map((parent) => getGeneration(parent))) + 1;
  }, [persons]);

  const personsByGeneration = React.useMemo(() => {
    const grouped = new Map<number, Person[]>();
    persons.forEach((person) => {
      const generation = getGeneration(person);
      if (!grouped.has(generation)) {
        grouped.set(generation, []);
      }
      grouped.get(generation)?.push(person);
    });
    return grouped;
  }, [getGeneration, persons]);

  const branches = React.useMemo(() => {
    return Array.from(new Set(persons.map((person) => person.lastName))).sort();
  }, [persons]);

  const filteredPersons = React.useMemo(() => {
    return persons.filter((person) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
        if (!fullName.includes(query)) return false;
      }

      if (selectedGeneration !== null && getGeneration(person) !== selectedGeneration) {
        return false;
      }

      if (selectedBranch !== 'all' && person.lastName !== selectedBranch) {
        return false;
      }

      if (showAliveOnly && person.deathDate) {
        return false;
      }

      if (showDeceasedOnly && !person.deathDate) {
        return false;
      }

      return true;
    });
  }, [getGeneration, persons, searchQuery, selectedBranch, selectedGeneration, showAliveOnly, showDeceasedOnly]);

  const generations = Array.from(personsByGeneration.keys());
  const minGeneration = generations.length > 0 ? Math.min(...generations) : 0;
  const maxGeneration = generations.length > 0 ? Math.max(...generations) : 0;

  return (
    <div className="tree-surface">
      <div className="tree-toolbar space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="app-kicker mb-2">Arbre</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue compacte</h2>
          </div>
          <div className="tree-chip">{filteredPersons.length} / {persons.length} personnes</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.7fr_0.6fr_0.6fr_auto]">
          <div className="tree-panel p-2">
            <input
              type="text"
              placeholder="Rechercher une personne"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="app-input border-0 bg-transparent shadow-none"
            />
          </div>

          <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="app-select">
            <option value="all">Toutes les branches</option>
            {branches.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <div className="tree-panel px-4 py-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] tree-meta">Generation</div>
            <input
              type="range"
              min={minGeneration}
              max={maxGeneration}
              value={selectedGeneration ?? minGeneration}
              onChange={(event) => setSelectedGeneration(Number.parseInt(event.target.value, 10))}
              className="w-full accent-[var(--color-accent)]"
            />
            <div className="mt-2 flex items-center justify-between text-xs tree-meta">
              <span>{selectedGeneration === null ? 'Toutes' : `Niveau ${selectedGeneration}`}</span>
              {selectedGeneration !== null && (
                <button type="button" onClick={() => setSelectedGeneration(null)} className="font-semibold text-[var(--color-accent)]">
                  Effacer
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAliveOnly((value) => !value);
                setShowDeceasedOnly(false);
              }}
              className={showAliveOnly ? 'app-button-secondary flex-1 justify-center px-4 py-3 text-xs uppercase tracking-[0.16em]' : 'app-button-ghost flex-1 justify-center px-4 py-3 text-xs uppercase tracking-[0.16em]'}
            >
              Vivants
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDeceasedOnly((value) => !value);
                setShowAliveOnly(false);
              }}
              className={showDeceasedOnly ? 'app-button-danger flex-1 justify-center px-4 py-3 text-xs uppercase tracking-[0.16em]' : 'app-button-ghost flex-1 justify-center px-4 py-3 text-xs uppercase tracking-[0.16em]'}
            >
              Decedes
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedGeneration(null);
              setSelectedBranch('all');
              setShowAliveOnly(false);
              setShowDeceasedOnly(false);
            }}
            className="app-button-primary"
          >
            Reinitialiser
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {filteredPersons.length === 0 ? (
          <div className="tree-empty">
            <div className="font-display text-3xl text-[var(--color-text)]">Aucun resultat</div>
            <p className="tree-meta mt-3 max-w-md text-sm leading-7">
              Ajustez les filtres ou la recherche pour retrouver une personne dans l&apos;archive.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredPersons.map((person) => (
              <article
                key={person.id}
                onClick={() => {
                  if (onSelectPerson) {
                    onSelectPerson(person);
                    return;
                  }
                  navigate(`/person/${person.id}`);
                }}
                className={`tree-card relative cursor-pointer ${getCardTone(person)}`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="tree-avatar h-14 w-14 shrink-0">
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
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="tree-chip tree-chip-accent">Generation {getGeneration(person)}</span>
                  {person.deathDate ? <span className="tree-chip tree-chip-danger">Decede</span> : <span className="tree-chip">Actif</span>}
                </div>

                {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
