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

interface TreeViewProps {
  persons: Person[];
  focusedPersonId?: string;
  onSelectPerson?: (person: Person) => void;
}

type ViewMode = 'global' | 'branch' | 'person';

interface Cluster {
  id: string;
  name: string;
  count: number;
  persons: Person[];
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

const PersonCard: React.FC<{ person: Person; onClick: () => void }> = ({ person, onClick }) => (
  <button type="button" onClick={onClick} className={`tree-card relative w-full text-left ${getCardTone(person)}`}>
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
      </div>
    </div>

    {person.deathDate && <div className="tree-death-mark absolute -right-2 -top-2 h-7 w-7">D</div>}
  </button>
);

const RelationSection: React.FC<{ title: string; persons: Person[]; onSelect: (person: Person) => void }> = ({ title, persons, onSelect }) => (
  <section className="mb-6">
    <div className="mb-3 flex items-center justify-between">
      <h3 className="font-display text-2xl text-[var(--color-text)]">{title}</h3>
      <span className="tree-chip">{persons.length}</span>
    </div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {persons.map((person) => (
        <PersonCard key={person.id} person={person} onClick={() => onSelect(person)} />
      ))}
    </div>
  </section>
);

export const TreeView: React.FC<TreeViewProps> = ({ persons, focusedPersonId, onSelectPerson }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<ViewMode>('global');
  const [selectedCluster, setSelectedCluster] = React.useState<Cluster | null>(null);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const clusters = React.useMemo(() => {
    const grouped = persons.reduce<Record<string, Person[]>>((accumulator, person) => {
      const key = person.lastName || 'Sans nom';
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(person);
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .map(([name, clusterPersons]) => ({
        id: name,
        name,
        count: clusterPersons.length,
        persons: clusterPersons,
      }))
      .sort((left, right) => right.count - left.count);
  }, [persons]);

  const filteredPersons = React.useMemo(() => {
    if (!searchQuery) return persons;
    const query = searchQuery.toLowerCase();
    return persons.filter((person) => `${person.firstName} ${person.lastName}`.toLowerCase().includes(query));
  }, [persons, searchQuery]);

  React.useEffect(() => {
    if (!focusedPersonId) return;
    const focused = persons.find((person) => person.id === focusedPersonId);
    if (!focused) return;

    const cluster = clusters.find((candidate) => candidate.persons.some((person) => person.id === focusedPersonId));
    if (cluster) {
      setSelectedCluster(cluster);
    }
    setSelectedPerson(focused);
    setViewMode('person');
  }, [clusters, focusedPersonId, persons]);

  const openPerson = (person: Person) => {
    if (onSelectPerson) {
      onSelectPerson(person);
      return;
    }
    navigate(`/person/${person.id}`);
  };

  const renderGlobalView = () => (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="app-kicker mb-2">Clusters</div>
          <h2 className="font-display text-2xl text-[var(--color-text)]">Vue globale des familles</h2>
          <p className="tree-meta mt-2 text-sm">Explorez les branches par nom de famille, puis descendez jusqu&apos;aux fiches.</p>
        </div>
        <div className="tree-chip">{clusters.length} familles • {persons.length} personnes</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clusters.map((cluster, index) => (
          <button
            key={cluster.id}
            type="button"
            onClick={() => {
              setSelectedCluster(cluster);
              setViewMode('branch');
            }}
            className="tree-panel p-6 text-left transition-transform duration-200 hover:-translate-y-1"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="tree-chip tree-chip-accent">{String(index + 1).padStart(2, '0')}</div>
                <h3 className="mt-4 font-display text-3xl text-[var(--color-text)]">{cluster.name}</h3>
              </div>
              <div className="tree-chip tree-chip-highlight">{cluster.count}</div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {cluster.persons.slice(0, 4).map((person) => (
                <div key={person.id} className={`tree-avatar aspect-square w-full rounded-[20px] ${getCardTone(person)}`}>
                  {person.profilePhotoUrl ? (
                    <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full rounded-[20px] object-cover" />
                  ) : (
                    <span className="font-display text-base text-[var(--color-accent)]">
                      {person.firstName?.[0]}
                      {person.lastName?.[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBranchView = () => {
    if (!selectedCluster) return null;

    const withParents = selectedCluster.persons.filter((person) => person.relations?.some((relation) => relation.type === 'PARENT'));
    const withoutParents = selectedCluster.persons.filter((person) => !person.relations?.some((relation) => relation.type === 'PARENT'));

    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button type="button" onClick={() => setViewMode('global')} className="app-button-ghost mb-4">
              Retour aux familles
            </button>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Famille {selectedCluster.name}</h2>
            <p className="tree-meta mt-2 text-sm">{selectedCluster.count} personnes regroupees dans cette branche.</p>
          </div>
          <div className="tree-chip">{withoutParents.length} racines • {withParents.length} descendants</div>
        </div>

        <div className="space-y-6">
          <section className="tree-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl text-[var(--color-text)]">Ancetres racines</h3>
              <span className="tree-chip">{withoutParents.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {withoutParents.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={() => {
                    setSelectedPerson(person);
                    setViewMode('person');
                    onSelectPerson?.(person);
                  }}
                />
              ))}
            </div>
          </section>

          <section className="tree-panel p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl text-[var(--color-text)]">Descendants</h3>
              <span className="tree-chip">{withParents.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {withParents.map((person) => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={() => {
                    setSelectedPerson(person);
                    setViewMode('person');
                    onSelectPerson?.(person);
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderPersonView = () => {
    if (!selectedPerson) return null;

    const parents = persons.filter((person) =>
      selectedPerson.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === person.id),
    );
    const children = persons.filter((person) =>
      person.relations?.some((relation) => relation.type === 'PARENT' && relation.relatedPersonId === selectedPerson.id),
    );
    const spouses = persons.filter((person) =>
      selectedPerson.relations?.some((relation) => relation.type === 'SPOUSE' && relation.relatedPersonId === person.id),
    );

    return (
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <button type="button" onClick={() => setViewMode('branch')} className="app-button-ghost mb-6">
          Retour a la branche
        </button>

        <section className="app-panel-strong mb-8 p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="tree-avatar h-32 w-32 shrink-0 rounded-[34px]">
              {selectedPerson.profilePhotoUrl ? (
                <img src={buildMediaUrl(selectedPerson.profilePhotoUrl)} alt={selectedPerson.firstName} className="h-full w-full rounded-[34px] object-cover" />
              ) : (
                <span className="font-display text-4xl text-[var(--color-accent)]">
                  {selectedPerson.firstName?.[0]}
                  {selectedPerson.lastName?.[0]}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="app-kicker mb-3">Portrait</div>
              <h1 className="font-display text-4xl text-[var(--color-text)]">
                {selectedPerson.firstName} {selectedPerson.lastName}
              </h1>
              <p className="tree-meta mt-3 text-sm leading-7">{getYearRange(selectedPerson)}</p>
              <button type="button" onClick={() => openPerson(selectedPerson)} className="app-button-primary mt-5">
                Ouvrir la fiche
              </button>
            </div>
          </div>
        </section>

        {parents.length > 0 && <RelationSection title="Parents" persons={parents} onSelect={setSelectedPerson} />}
        {spouses.length > 0 && <RelationSection title="Conjoints" persons={spouses} onSelect={setSelectedPerson} />}
        {children.length > 0 && <RelationSection title="Enfants" persons={children} onSelect={setSelectedPerson} />}
      </div>
    );
  };

  return (
    <div className="tree-surface">
      <div className="tree-toolbar">
        <div className="tree-panel p-2">
          <input
            type="text"
            placeholder="Rechercher une personne"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="app-input border-0 bg-transparent shadow-none"
          />
        </div>

        {searchQuery && (
          <div className="tree-panel mt-3 max-h-56 overflow-auto p-2">
            {filteredPersons.slice(0, 10).map((person) => (
              <button
                key={person.id}
                type="button"
                className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left transition-colors hover:bg-white/35 dark:hover:bg-white/5"
                onClick={() => {
                  setSelectedPerson(person);
                  setViewMode('person');
                  setSearchQuery('');
                  onSelectPerson?.(person);
                }}
              >
                <span className="font-semibold text-[var(--color-text)]">
                  {person.firstName} {person.lastName}
                </span>
                <span className="tree-meta text-xs">{getYearRange(person)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {viewMode === 'global' && renderGlobalView()}
      {viewMode === 'branch' && renderBranchView()}
      {viewMode === 'person' && renderPersonView()}
    </div>
  );
};
