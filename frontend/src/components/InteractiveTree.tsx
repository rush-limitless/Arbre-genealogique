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

interface InteractiveTreeProps {
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

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ persons, focusedPersonId, onSelectPerson }) => {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = React.useState<Person | null>(null);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const root = persons.find((person) => !person.relations?.some((relation) => relation.type === 'PARENT')) || persons[0];
    if (root) {
      setRootPerson(root);
      setExpandedNodes(new Set([`${root.id}-children`]));
    }
  }, [persons]);

  React.useEffect(() => {
    if (!focusedPersonId) return;
    const focused = persons.find((person) => person.id === focusedPersonId);
    if (focused) {
      setRootPerson(focused);
      setExpandedNodes(new Set([`${focused.id}-children`]));
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

  const getSiblings = React.useCallback((personId: string) => {
    const parents = getParents(personId);
    if (parents.length === 0) return [];

    const siblings = new Map<string, Person>();
    parents.forEach((parent) => {
      getChildren(parent.id).forEach((child) => {
        if (child.id !== personId) {
          siblings.set(child.id, child);
        }
      });
    });

    return Array.from(siblings.values());
  }, [getChildren, getParents]);

  const toggleExpand = (personId: string, type: 'parents' | 'children' | 'siblings') => {
    const key = `${personId}-${type}`;
    setExpandedNodes((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const isExpanded = (personId: string, type: 'parents' | 'children' | 'siblings') => {
    return expandedNodes.has(`${personId}-${type}`);
  };

  const PersonNode: React.FC<{ person: Person; isRoot?: boolean }> = ({ person, isRoot = false }) => {
    const parents = getParents(person.id);
    const children = getChildren(person.id);
    const siblings = getSiblings(person.id);
    const showParents = isExpanded(person.id, 'parents');
    const showChildren = isExpanded(person.id, 'children');
    const showSiblings = isExpanded(person.id, 'siblings');

    return (
      <div className="flex flex-col items-center">
        {showParents && parents.length > 0 && (
          <div className="mb-4">
            <div className="mb-2 flex gap-4">
              {parents.map((parent) => (
                <PersonNode key={parent.id} person={parent} />
              ))}
            </div>
            <div className="tree-line mx-auto h-4 w-px"></div>
          </div>
        )}

        <div className={`tree-card relative w-64 ${getCardTone(person)} ${isRoot ? 'ring-2 ring-[var(--color-highlight)] ring-offset-4 ring-offset-transparent' : ''}`}>
          <div className="mb-3 flex items-center gap-3">
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
              <button
                type="button"
                className="block truncate text-left text-sm font-semibold text-[var(--color-text)] transition-colors hover:text-[var(--color-accent)]"
                onClick={() => {
                  if (onSelectPerson) {
                    onSelectPerson(person);
                    return;
                  }
                  navigate(`/person/${person.id}`);
                }}
              >
                {person.firstName} {person.lastName}
              </button>
              <div className="tree-meta text-xs">{getYearRange(person)}</div>
            </div>
          </div>

          <div className="space-y-2">
            {parents.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(person.id, 'parents')}
                className={showParents ? 'app-button-secondary w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]' : 'app-button-ghost w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]'}
              >
                {showParents ? 'Masquer les parents' : `Parents ${parents.length}`}
              </button>
            )}

            {siblings.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(person.id, 'siblings')}
                className={showSiblings ? 'app-button-secondary w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]' : 'app-button-ghost w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]'}
              >
                {showSiblings ? 'Masquer la fratrie' : `Fratrie ${siblings.length}`}
              </button>
            )}

            {children.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(person.id, 'children')}
                className={showChildren ? 'app-button-primary w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]' : 'app-button-ghost w-full justify-center px-4 py-2 text-xs uppercase tracking-[0.16em]'}
              >
                {showChildren ? 'Masquer les enfants' : `Enfants ${children.length}`}
              </button>
            )}
          </div>

          {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
        </div>

        {showSiblings && siblings.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {siblings.map((sibling) => (
              <PersonNode key={sibling.id} person={sibling} />
            ))}
          </div>
        )}

        {showChildren && children.length > 0 && (
          <div className="mt-4">
            <div className="tree-line mx-auto mb-2 h-4 w-px"></div>
            <div className="flex flex-wrap justify-center gap-4">
              {children.map((child) => (
                <PersonNode key={child.id} person={child} />
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
        <div className="font-display text-3xl text-[var(--color-text)]">Aucune personne disponible</div>
        <p className="tree-meta mt-3 max-w-md text-sm leading-7">Ajoutez une fiche pour naviguer dans les relations familiales.</p>
      </div>
    );
  }

  return (
    <div className="tree-surface">
      <div className="tree-toolbar flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div>
            <div className="app-kicker mb-2">Arbre</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Vue interactive</h2>
          </div>
          <select
            value={rootPerson.id}
            onChange={(event) => {
              const person = persons.find((candidate) => candidate.id === event.target.value);
              if (person) {
                setRootPerson(person);
                setExpandedNodes(new Set([`${person.id}-children`]));
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

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setExpandedNodes(new Set([`${rootPerson.id}-children`]))} className="app-button-ghost">
            Replier
          </button>
          <button
            type="button"
            onClick={() => {
              const allNodes = new Set<string>();
              persons.forEach((person) => {
                allNodes.add(`${person.id}-parents`);
                allNodes.add(`${person.id}-children`);
                allNodes.add(`${person.id}-siblings`);
              });
              setExpandedNodes(allNodes);
            }}
            className="app-button-primary"
          >
            Tout deplier
          </button>
        </div>
      </div>

      <div className="border-b border-[var(--color-line)] px-4 py-3 text-sm tree-meta sm:px-6">
        Activez parents, fratrie ou enfants pour explorer une branche sans quitter la vue.
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <PersonNode person={rootPerson} isRoot />
        </div>
      </div>
    </div>
  );
};
