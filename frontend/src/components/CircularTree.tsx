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

interface CircularTreeProps {
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

export const CircularTree: React.FC<CircularTreeProps> = ({ persons, focusedPersonId, onSelectPerson }) => {
  const navigate = useNavigate();
  const [centerPerson, setCenterPerson] = React.useState<Person | null>(null);
  const [hoveredPerson, setHoveredPerson] = React.useState<Person | null>(null);

  React.useEffect(() => {
    const root = persons.find((person) => !person.relations?.some((relation) => relation.type === 'PARENT')) || persons[0];
    if (root) {
      setCenterPerson(root);
    }
  }, [persons]);

  React.useEffect(() => {
    if (!focusedPersonId) return;
    const focused = persons.find((person) => person.id === focusedPersonId);
    if (focused) {
      setCenterPerson(focused);
    }
  }, [focusedPersonId, persons]);

  const getParents = React.useCallback((personId: string) => {
    const person = persons.find((candidate) => candidate.id === personId);
    if (!person) return [];
    return persons.filter((candidate) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === candidate.id),
    );
  }, [persons]);

  const getChildren = React.useCallback((personId: string) => {
    return persons.filter((person) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === personId),
    );
  }, [persons]);

  const getGrandParents = React.useCallback((personId: string) => {
    const grandParents: Person[] = [];
    getParents(personId).forEach((parent) => {
      grandParents.push(...getParents(parent.id));
    });
    return grandParents;
  }, [getParents]);

  const getGrandChildren = React.useCallback((personId: string) => {
    const grandChildren: Person[] = [];
    getChildren(personId).forEach((child) => {
      grandChildren.push(...getChildren(child.id));
    });
    return grandChildren;
  }, [getChildren]);

  if (!centerPerson) {
    return (
      <div className="tree-empty">
        <div className="font-display text-3xl text-[var(--color-text)]">Aucune personne</div>
        <p className="tree-meta mt-3 max-w-md text-sm leading-7">Ajoutez une fiche pour initialiser la vue circulaire.</p>
      </div>
    );
  }

  const parents = getParents(centerPerson.id);
  const children = getChildren(centerPerson.id);
  const grandParents = getGrandParents(centerPerson.id);
  const grandChildren = getGrandChildren(centerPerson.id);

  const PersonCircle: React.FC<{ person: Person; angle: number; radius: number; size: number }> = ({ person, angle, radius, size }) => {
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <button
        type="button"
        className={`absolute cursor-pointer transition-transform duration-200 hover:scale-110 ${hoveredPerson?.id === person.id ? 'scale-110 z-20' : ''}`}
        style={{
          left: `calc(50% + ${x}px - ${size / 2}px)`,
          top: `calc(50% + ${y}px - ${size / 2}px)`,
          width: `${size}px`,
          height: `${size}px`,
        }}
        onClick={() => {
          setCenterPerson(person);
          onSelectPerson?.(person);
        }}
        onMouseEnter={() => setHoveredPerson(person)}
        onMouseLeave={() => setHoveredPerson(null)}
      >
        <div className={`tree-card tree-avatar h-full w-full rounded-full border-2 p-0 ${getCardTone(person)}`}>
          {person.profilePhotoUrl ? (
            <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span className="font-display text-lg text-[var(--color-accent)]">
              {person.firstName?.[0]}
              {person.lastName?.[0]}
            </span>
          )}
        </div>
        {person.deathDate && <div className="tree-death-mark absolute -right-1 -top-1 h-6 w-6">D</div>}
      </button>
    );
  };

  return (
    <div className="tree-surface">
      <div className="tree-toolbar flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="app-kicker mb-2">Arbre</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue circulaire</h2>
          </div>
          <select
            value={centerPerson.id}
            onChange={(event) => {
              const person = persons.find((candidate) => candidate.id === event.target.value);
              if (person) {
                setCenterPerson(person);
                onSelectPerson?.(person);
              }
            }}
            className="app-select min-w-[240px]"
          >
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="tree-chip">Cliquez sur un portrait pour recentrer la vue</div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <svg className="pointer-events-none absolute inset-0 h-full w-full text-[var(--color-line)]">
          <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50%" cy="50%" r="320" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>

        <div className="tree-chip absolute left-1/2 top-1/2 -translate-x-1/2" style={{ transform: 'translate(-50%, -95px)' }}>
          Parents
        </div>
        <div className="tree-chip absolute left-1/2 top-1/2 -translate-x-1/2" style={{ transform: 'translate(-50%, -176px)' }}>
          Grands-parents
        </div>
        <div className="tree-chip absolute left-1/2 top-1/2 -translate-x-1/2" style={{ transform: 'translate(-50%, 84px)' }}>
          Enfants
        </div>
        <div className="tree-chip absolute left-1/2 top-1/2 -translate-x-1/2" style={{ transform: 'translate(-50%, 165px)' }}>
          Petits-enfants
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <button
            type="button"
            className="cursor-pointer text-center"
            onClick={() => {
              if (onSelectPerson) {
                onSelectPerson(centerPerson);
                return;
              }
              navigate(`/person/${centerPerson.id}`);
            }}
          >
            <div className={`tree-card tree-avatar h-32 w-32 rounded-full border-2 p-0 ring-2 ring-[var(--color-highlight)] ring-offset-4 ring-offset-transparent ${getCardTone(centerPerson)}`}>
              {centerPerson.profilePhotoUrl ? (
                <img src={buildMediaUrl(centerPerson.profilePhotoUrl)} alt={centerPerson.firstName} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="font-display text-3xl text-[var(--color-accent)]">
                  {centerPerson.firstName?.[0]}
                  {centerPerson.lastName?.[0]}
                </span>
              )}
            </div>
            <div className="mt-3">
              <div className="font-semibold text-[var(--color-text)]">{centerPerson.firstName} {centerPerson.lastName}</div>
              <div className="tree-meta text-xs">{getYearRange(centerPerson)}</div>
            </div>
          </button>
        </div>

        {grandParents.map((person, index) => (
          <PersonCircle key={person.id} person={person} angle={(index / grandParents.length) * Math.PI * 2 - Math.PI / 2} radius={240} size={60} />
        ))}

        {parents.map((person, index) => (
          <PersonCircle key={person.id} person={person} angle={(index / parents.length) * Math.PI * 2 - Math.PI / 2} radius={160} size={80} />
        ))}

        {children.map((person, index) => (
          <PersonCircle key={person.id} person={person} angle={(index / children.length) * Math.PI * 2 + Math.PI / 2} radius={160} size={80} />
        ))}

        {grandChildren.map((person, index) => (
          <PersonCircle key={person.id} person={person} angle={(index / grandChildren.length) * Math.PI * 2 + Math.PI / 2} radius={240} size={60} />
        ))}

        {hoveredPerson && (
          <div className="tree-panel absolute bottom-4 left-1/2 z-30 -translate-x-1/2 p-4 text-center">
            <div className="font-semibold text-[var(--color-text)]">
              {hoveredPerson.firstName} {hoveredPerson.lastName}
            </div>
            <div className="tree-meta text-sm">{getYearRange(hoveredPerson)}</div>
            <div className="tree-meta mt-1 text-xs uppercase tracking-[0.14em]">Cliquer pour recentrer</div>
          </div>
        )}
      </div>

      <div className="tree-toolbar border-t border-b-0">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="tree-chip tree-chip-accent">Homme</span>
          <span className="tree-chip tree-chip-highlight">Femme</span>
          <span className="tree-chip">Autre</span>
          <span className="tree-chip tree-chip-danger">Decede</span>
        </div>
      </div>
    </div>
  );
};
