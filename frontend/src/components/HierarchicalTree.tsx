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

interface HierarchicalTreeProps {
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

export const HierarchicalTree: React.FC<HierarchicalTreeProps> = ({ persons, focusedPersonId, onSelectPerson }) => {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = React.useState<Person | null>(null);
  const [scale, setScale] = React.useState(1);

  const rootCandidates = React.useMemo(() => {
    const roots = persons.filter((person) => !person.relations?.some((relation) => relation.type === 'PARENT'));
    return roots.length > 0 ? roots : persons;
  }, [persons]);

  React.useEffect(() => {
    if (rootCandidates[0]) {
      setRootPerson(rootCandidates[0]);
    }
  }, [rootCandidates]);

  React.useEffect(() => {
    if (!focusedPersonId) return;
    const focused = persons.find((person) => person.id === focusedPersonId);
    if (focused) {
      setRootPerson(focused);
    }
  }, [focusedPersonId, persons]);

  const getChildren = React.useCallback((personId: string) => {
    return persons.filter((person) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === personId),
    );
  }, [persons]);

  const getSpouses = React.useCallback((personId: string) => {
    const person = persons.find((candidate) => candidate.id === personId);
    if (!person) return [];

    return persons.filter((candidate) =>
      person.relations?.some((relation) => relation.type === 'SPOUSE' && relation.relatedPersonId === candidate.id),
    );
  }, [persons]);

  const PersonCard: React.FC<{ person: Person; level: number }> = ({ person, level }) => {
    const children = getChildren(person.id);
    const spouses = getSpouses(person.id);
    const [expanded, setExpanded] = React.useState(level < 2);

    return (
      <div className="flex flex-col items-center">
        <div
          className={`tree-card relative w-64 cursor-pointer ${getCardTone(person)}`}
          onClick={() => {
            if (onSelectPerson) {
              onSelectPerson(person);
              return;
            }
            navigate(`/person/${person.id}`);
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="tree-avatar h-16 w-16">
              {person.profilePhotoUrl ? (
                <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-xl text-[var(--color-accent)]">
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
            {spouses.length > 0 && (
              <span className="tree-chip tree-chip-highlight">
                {spouses.length} conjoint{spouses.length > 1 ? 's' : ''}
              </span>
            )}
            {children.length > 0 && (
              <span className="tree-chip tree-chip-accent">
                {children.length} enfant{children.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {children.length > 0 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
              className="app-button-secondary mt-4 w-full justify-center px-4 py-2 text-[0.72rem] uppercase tracking-[0.18em]"
            >
              {expanded ? 'Masquer la descendance' : 'Afficher la descendance'}
            </button>
          )}

          {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
        </div>

        {expanded && children.length > 0 && <div className="tree-line h-8 w-px"></div>}

        {expanded && children.length > 0 && (
          <div className="relative">
            <div className="tree-line absolute left-0 right-0 h-px" style={{ top: '-1px' }}></div>
            <div className="flex gap-8 pt-8">
              {children.map((child) => (
                <div key={child.id} className="relative">
                  <div className="tree-line absolute bottom-full left-1/2 h-8 w-px -translate-x-1/2"></div>
                  <PersonCard person={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!rootPerson) {
    return (
      <div className="tree-empty">
        <div className="font-display text-3xl text-[var(--color-text)]">Aucune racine disponible</div>
        <p className="tree-meta mt-3 max-w-md text-sm leading-7">
          Ajoutez une premiere personne ou definissez des relations pour initialiser cette vue.
        </p>
      </div>
    );
  }

  return (
    <div className="tree-surface overflow-auto">
      <div className="tree-toolbar sticky top-0 z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="app-kicker mb-2">Arbre</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue hierarchique</h2>
          </div>
          <select
            value={rootPerson.id}
            onChange={(event) => {
              const person = persons.find((candidate) => candidate.id === event.target.value);
              if (person) {
                setRootPerson(person);
                onSelectPerson?.(person);
              }
            }}
            className="app-select min-w-[220px]"
          >
            {rootCandidates.map((person) => (
              <option key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setScale((value) => Math.max(0.5, value - 0.1))} className="app-button-ghost h-11 w-11 px-0">
            -
          </button>
          <span className="tree-chip">{Math.round(scale * 100)}%</span>
          <button type="button" onClick={() => setScale((value) => Math.min(2, value + 0.1))} className="app-button-ghost h-11 w-11 px-0">
            +
          </button>
          <button type="button" onClick={() => setScale(1)} className="app-button-primary">
            Reinitialiser
          </button>
        </div>
      </div>

      <div
        className="flex justify-center p-8"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          minHeight: '100vh',
        }}
      >
        <PersonCard person={rootPerson} level={0} />
      </div>
    </div>
  );
};
