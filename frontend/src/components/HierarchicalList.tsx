// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequestData, buildMediaUrl, jsonBody } from '../services/api';
import { toast } from './Toast';

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

interface HierarchicalListProps {
  persons: Person[];
  onSelectPerson?: (person: Person) => void;
}

const getYearRange = (person: Person) => {
  const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
  const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
  return death ? `${birth} - ${death}` : `${birth}`;
};

export const HierarchicalList: React.FC<HierarchicalListProps> = ({ persons, onSelectPerson }) => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = React.useState<'name' | 'birth' | 'death'>('name');
  const [editingPerson, setEditingPerson] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<any>({});
  const [localPersons, setLocalPersons] = React.useState<Person[]>(persons);

  React.useEffect(() => {
    setLocalPersons(persons);
  }, [persons]);

  const getChildren = React.useCallback((personId: string) => {
    return localPersons.filter((person) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === personId),
    );
  }, [localPersons]);

  const getRoots = React.useCallback(() => {
    return localPersons.filter((person) => !person.relations?.some((relation) => relation.type === 'PARENT'));
  }, [localPersons]);

  const toggleExpand = (personId: string) => {
    setExpandedNodes((current) => {
      const next = new Set(current);
      if (next.has(personId)) {
        next.delete(personId);
      } else {
        next.add(personId);
      }
      return next;
    });
  };

  const sortPersons = React.useCallback((items: Person[]) => {
    return [...items].sort((left, right) => {
      if (sortBy === 'name') {
        return `${left.firstName} ${left.lastName}`.localeCompare(`${right.firstName} ${right.lastName}`);
      }

      if (sortBy === 'birth') {
        const leftDate = left.birthDate ? new Date(left.birthDate).getTime() : 0;
        const rightDate = right.birthDate ? new Date(right.birthDate).getTime() : 0;
        return leftDate - rightDate;
      }

      const leftDate = left.deathDate ? new Date(left.deathDate).getTime() : Number.POSITIVE_INFINITY;
      const rightDate = right.deathDate ? new Date(right.deathDate).getTime() : Number.POSITIVE_INFINITY;
      return leftDate - rightDate;
    });
  }, [sortBy]);

  const startEdit = (person: Person) => {
    setEditingPerson(person.id);
    setEditData({
      firstName: person.firstName,
      lastName: person.lastName,
      birthDate: person.birthDate?.split('T')[0] || '',
      deathDate: person.deathDate?.split('T')[0] || '',
      gender: person.gender || 'OTHER',
    });
  };

  const saveEdit = async (personId: string) => {
    try {
      const payload = {
        ...editData,
        birthDate: editData.birthDate || null,
        deathDate: editData.deathDate || null,
      };

      const updatedPerson = await apiRequestData(`/persons/${personId}`, {
        method: 'PUT',
        body: jsonBody(payload),
      });

      setLocalPersons((current) => current.map((person) => (person.id === personId ? { ...person, ...updatedPerson } : person)));
      setEditingPerson(null);
      setEditData({});
      toast.success('Fiche mise a jour.');
    } catch (error) {
      toast.error('Impossible de sauvegarder cette fiche.');
    }
  };

  const cancelEdit = () => {
    setEditingPerson(null);
    setEditData({});
  };

  const PersonRow: React.FC<{ person: Person; level: number }> = ({ person, level }) => {
    const children = sortPersons(getChildren(person.id));
    const isExpanded = expandedNodes.has(person.id);
    const hasChildren = children.length > 0;
    const isEditing = editingPerson === person.id;

    return (
      <>
        <div
          className={`grid items-center gap-3 border-b border-[var(--color-line)] px-3 py-3 sm:grid-cols-[32px_minmax(0,1.5fr)_120px_110px_110px_90px] ${level > 0 ? 'bg-white/18 dark:bg-white/[0.02]' : ''} ${isEditing ? 'bg-[var(--color-accent-soft)]' : ''}`}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpand(person.id);
                }}
                className="app-button-ghost h-8 w-8 px-0 text-xs"
              >
                {isExpanded ? '-' : '+'}
              </button>
            ) : (
              <div className="h-8 w-8"></div>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="tree-avatar h-9 w-9 shrink-0">
              {person.profilePhotoUrl ? (
                <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
              ) : (
                <span className="font-display text-sm text-[var(--color-accent)]">
                  {person.firstName?.[0]}
                  {person.lastName?.[0]}
                </span>
              )}
            </div>

            {isEditing ? (
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  value={editData.firstName}
                  onChange={(event) => setEditData({ ...editData, firstName: event.target.value })}
                  className="app-input py-2 text-sm"
                  placeholder="Prenom"
                />
                <input
                  type="text"
                  value={editData.lastName}
                  onChange={(event) => setEditData({ ...editData, lastName: event.target.value })}
                  className="app-input py-2 text-sm"
                  placeholder="Nom"
                />
              </div>
            ) : (
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  if (onSelectPerson) {
                    onSelectPerson(person);
                    return;
                  }
                  navigate(`/person/${person.id}`);
                }}
              >
                <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {person.firstName} {person.lastName}
                </div>
                <div className="tree-meta text-xs">
                  Niveau {level} {hasChildren ? `• ${children.length} enfant${children.length > 1 ? 's' : ''}` : ''}
                </div>
              </button>
            )}
          </div>

          {isEditing ? (
            <input
              type="date"
              value={editData.birthDate}
              onChange={(event) => setEditData({ ...editData, birthDate: event.target.value })}
              className="app-input py-2 text-sm"
            />
          ) : (
            <div className="tree-meta text-sm">{getYearRange(person)}</div>
          )}

          {isEditing ? (
            <input
              type="date"
              value={editData.deathDate}
              onChange={(event) => setEditData({ ...editData, deathDate: event.target.value })}
              className="app-input py-2 text-sm"
            />
          ) : (
            <div>{person.gender === 'MALE' ? <span className="tree-chip tree-chip-accent">Homme</span> : person.gender === 'FEMALE' ? <span className="tree-chip tree-chip-highlight">Femme</span> : <span className="tree-chip">Autre</span>}</div>
          )}

          {isEditing ? (
            <select value={editData.gender} onChange={(event) => setEditData({ ...editData, gender: event.target.value })} className="app-select py-2 text-sm">
              <option value="MALE">Homme</option>
              <option value="FEMALE">Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          ) : (
            <div>{person.deathDate ? <span className="tree-chip tree-chip-danger">Decede</span> : <span className="tree-chip">Vivant</span>}</div>
          )}

          <div className="flex items-center justify-end gap-2">
            {isEditing ? (
              <>
                <button type="button" onClick={() => saveEdit(person.id)} className="app-button-secondary px-4 py-2 text-xs uppercase tracking-[0.16em]">
                  Sauver
                </button>
                <button type="button" onClick={cancelEdit} className="app-button-ghost px-4 py-2 text-xs uppercase tracking-[0.16em]">
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => startEdit(person)} className="app-button-ghost px-4 py-2 text-xs uppercase tracking-[0.16em]">
                  Editer
                </button>
              </>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && children.map((child) => <PersonRow key={child.id} person={child} level={level + 1} />)}
      </>
    );
  };

  const roots = sortPersons(getRoots());

  return (
    <div className="tree-surface">
      <div className="tree-toolbar space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="app-kicker mb-2">Arbre</div>
            <h2 className="font-display text-2xl text-[var(--color-text)]">Liste hierarchique</h2>
          </div>
          <div className="tree-chip">{localPersons.length} personnes</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'name' | 'birth' | 'death')} className="app-select max-w-[240px]">
            <option value="name">Tri par nom</option>
            <option value="birth">Tri par naissance</option>
            <option value="death">Tri par deces</option>
          </select>

          <button
            type="button"
            onClick={() => setExpandedNodes(new Set(localPersons.map((person) => person.id)))}
            className="app-button-secondary"
          >
            Tout deplier
          </button>
          <button type="button" onClick={() => setExpandedNodes(new Set())} className="app-button-ghost">
            Tout replier
          </button>
        </div>
      </div>

      <div className="border-b border-[var(--color-line)] bg-white/20 px-3 py-3 text-xs font-semibold uppercase tracking-[0.2em] tree-meta sm:grid sm:grid-cols-[32px_minmax(0,1.5fr)_120px_110px_110px_90px] sm:gap-3">
        <div></div>
        <div>Personne</div>
        <div>Dates</div>
        <div>Genre</div>
        <div>Statut</div>
        <div className="text-right">Action</div>
      </div>

      <div className="flex-1 overflow-auto">
        {roots.length === 0 ? (
          <div className="tree-empty m-4">
            <div className="font-display text-3xl text-[var(--color-text)]">Aucune personne</div>
            <p className="tree-meta mt-3 max-w-md text-sm leading-7">La liste hierarchique apparaitra des que des fiches seront disponibles.</p>
          </div>
        ) : (
          roots.map((person) => <PersonRow key={person.id} person={person} level={0} />)
        )}
      </div>

      <div className="tree-toolbar border-t border-b-0">
        <div className="flex flex-wrap justify-between gap-3 text-sm tree-meta">
          <div>{roots.length} racine{roots.length > 1 ? 's' : ''}</div>
          <div>{localPersons.filter((person) => !person.deathDate).length} vivant{localPersons.filter((person) => !person.deathDate).length > 1 ? 's' : ''}</div>
          <div>{localPersons.filter((person) => person.deathDate).length} decede{localPersons.filter((person) => person.deathDate).length > 1 ? 's' : ''}</div>
        </div>
      </div>
    </div>
  );
};
