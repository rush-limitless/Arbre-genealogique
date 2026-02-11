// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';

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
}

type ViewMode = 'global' | 'branch' | 'person';

interface Cluster {
  id: string;
  name: string;
  count: number;
  persons: Person[];
  x: number;
  y: number;
}

export const TreeView: React.FC<TreeViewProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = React.useState<ViewMode>('global');
  const [selectedCluster, setSelectedCluster] = React.useState<Cluster | null>(null);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Grouper par nom de famille (clusters)
  const clusters = React.useMemo(() => {
    const grouped = persons.reduce((acc, person) => {
      const key = person.lastName || 'Sans nom';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(person);
      return acc;
    }, {} as Record<string, Person[]>);

    return Object.entries(grouped).map(([name, persons], idx) => ({
      id: name,
      name,
      count: persons.length,
      persons,
      x: (idx % 5) * 250 + 100,
      y: Math.floor(idx / 5) * 200 + 100,
    }));
  }, [persons]);

  const filteredPersons = React.useMemo(() => {
    if (!searchQuery) return persons;
    const q = searchQuery.toLowerCase();
    return persons.filter(p => 
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q)
    );
  }, [persons, searchQuery]);

  const getClusterColor = (count: number) => {
    if (count > 50) return 'bg-red-500';
    if (count > 20) return 'bg-orange-500';
    if (count > 10) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getClusterSize = (count: number) => {
    const size = Math.min(Math.max(count * 2, 60), 150);
    return { width: size, height: size };
  };

  const getBorderColor = (person: Person) => {
    if (person.gender === 'MALE') return 'border-blue-500';
    if (person.gender === 'FEMALE') return 'border-pink-500';
    return 'border-gray-400';
  };

  const getYearRange = (person: Person) => {
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
    return death ? `${birth} - ${death}` : `${birth}`;
  };

  // Vue globale : clusters
  const renderGlobalView = () => (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10">
        <h2 className="text-xl font-bold mb-2 dark:text-white">🌍 Vue Globale</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {clusters.length} familles • {persons.length} personnes
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Cliquez sur une bulle pour explorer
        </p>
      </div>

      <div className="relative" style={{ width: '2000px', height: '1500px' }}>
        {clusters.map((cluster) => {
          const size = getClusterSize(cluster.count);
          return (
            <div
              key={cluster.id}
              className={`absolute ${getClusterColor(cluster.count)} rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl`}
              style={{
                left: cluster.x,
                top: cluster.y,
                ...size,
              }}
              onClick={() => {
                setSelectedCluster(cluster);
                setViewMode('branch');
              }}
              title={`${cluster.name} - ${cluster.count} personnes`}
            >
              <div className="text-center text-white">
                <div className="font-bold text-lg">{cluster.name}</div>
                <div className="text-sm">{cluster.count}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Vue branche : liste hiérarchique
  const renderBranchView = () => {
    if (!selectedCluster) return null;

    // Organiser par génération
    const withParents = selectedCluster.persons.filter(p => 
      p.relations?.some(r => r.type === 'PARENT')
    );
    const withoutParents = selectedCluster.persons.filter(p => 
      !p.relations?.some(r => r.type === 'PARENT')
    );

    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <button
            onClick={() => setViewMode('global')}
            className="mb-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Retour à la vue globale
          </button>
          <h2 className="text-2xl font-bold dark:text-white">
            Famille {selectedCluster.name}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedCluster.count} personnes
          </p>
        </div>

        <div className="p-6">
          {/* Racines (sans parents) */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">
              👑 Ancêtres racines ({withoutParents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {withoutParents.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={() => {
                    setSelectedPerson(person);
                    setViewMode('person');
                  }}
                />
              ))}
            </div>
          </div>

          {/* Descendants */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-700 dark:text-gray-300">
              👨‍👩‍👧‍👦 Descendants ({withParents.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {withParents.map(person => (
                <PersonCard
                  key={person.id}
                  person={person}
                  onClick={() => {
                    setSelectedPerson(person);
                    setViewMode('person');
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Vue personne : détails + relations
  const renderPersonView = () => {
    if (!selectedPerson) return null;

    const parents = persons.filter(p =>
      selectedPerson.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === p.id)
    );
    const children = persons.filter(p =>
      p.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === selectedPerson.id)
    );
    const spouses = persons.filter(p =>
      selectedPerson.relations?.some(r => r.type === 'SPOUSE' && r.relatedPersonId === p.id)
    );

    return (
      <div className="w-full h-full bg-white dark:bg-gray-900 overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <button
            onClick={() => setViewMode('branch')}
            className="mb-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
          >
            ← Retour à la famille
          </button>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Carte principale */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-2xl p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {selectedPerson.profilePhotoUrl ? (
                  <img
                    src={`http://localhost:3000${selectedPerson.profilePhotoUrl}`}
                    alt={selectedPerson.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" fill="url(#grad1)" />
                    <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="url(#grad2)" />
                    <defs>
                      <linearGradient id="grad1" x1="8" y1="4" x2="16" y2="12">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <linearGradient id="grad2" x1="4" y1="13" x2="20" y2="20">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-white">
                  {selectedPerson.firstName} {selectedPerson.lastName}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                  {getYearRange(selectedPerson)}
                </p>
                <button
                  onClick={() => navigate(`/person/${selectedPerson.id}`)}
                  className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          </div>

          {/* Relations */}
          {parents.length > 0 && (
            <RelationSection title="👨‍👩 Parents" persons={parents} onSelect={setSelectedPerson} />
          )}
          {spouses.length > 0 && (
            <RelationSection title="💑 Conjoints" persons={spouses} onSelect={setSelectedPerson} />
          )}
          {children.length > 0 && (
            <RelationSection title="👶 Enfants" persons={children} onSelect={setSelectedPerson} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Barre de recherche */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <input
          type="text"
          placeholder="🔍 Rechercher une personne..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        {searchQuery && (
          <div className="mt-2 max-h-40 overflow-auto bg-gray-50 dark:bg-gray-700 rounded">
            {filteredPersons.slice(0, 10).map(p => (
              <div
                key={p.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                onClick={() => {
                  setSelectedPerson(p);
                  setViewMode('person');
                  setSearchQuery('');
                }}
              >
                {p.firstName} {p.lastName} ({getYearRange(p)})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'global' && renderGlobalView()}
        {viewMode === 'branch' && renderBranchView()}
        {viewMode === 'person' && renderPersonView()}
      </div>
    </div>
  );
};

// Composant carte personne
const PersonCard: React.FC<{ person: Person; onClick: () => void }> = ({ person, onClick }) => {
  const getBorderColor = (person: Person) => {
    if (person.gender === 'MALE') return 'border-blue-500';
    if (person.gender === 'FEMALE') return 'border-pink-500';
    return 'border-gray-400';
  };

  const getYearRange = (person: Person) => {
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
    return death ? `${birth} - ${death}` : `${birth}`;
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-4 cursor-pointer hover:shadow-xl transition-shadow`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {person.profilePhotoUrl ? (
            <img
              src={`http://localhost:3000${person.profilePhotoUrl}`}
              alt={person.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#3B82F6" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate dark:text-white">
            {person.firstName} {person.lastName}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {getYearRange(person)}
          </div>
        </div>
      </div>
      {person.deathDate && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✝</span>
        </div>
      )}
    </div>
  );
};

// Section de relations
const RelationSection: React.FC<{
  title: string;
  persons: Person[];
  onSelect: (p: Person) => void;
}> = ({ title, persons, onSelect }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold mb-3 dark:text-white">{title} ({persons.length})</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {persons.map(p => (
        <PersonCard key={p.id} person={p} onClick={() => onSelect(p)} />
      ))}
    </div>
  </div>
);
