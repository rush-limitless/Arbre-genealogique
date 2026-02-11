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

interface CompactTreeProps {
  persons: Person[];
}

export const CompactTree: React.FC<CompactTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGeneration, setSelectedGeneration] = React.useState<number | null>(null);
  const [selectedBranch, setSelectedBranch] = React.useState<string>('all');
  const [showAliveOnly, setShowAliveOnly] = React.useState(false);
  const [showDeceasedOnly, setShowDeceasedOnly] = React.useState(false);

  // Calculer génération
  const getGeneration = (person: Person): number => {
    const hasParents = person.relations?.some(r => r.type === 'PARENT');
    if (!hasParents) return 0;
    
    const parents = persons.filter(p =>
      person.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === p.id)
    );
    
    if (parents.length === 0) return 0;
    return Math.max(...parents.map(p => getGeneration(p))) + 1;
  };

  // Grouper par génération
  const personsByGeneration = React.useMemo(() => {
    const grouped = new Map<number, Person[]>();
    persons.forEach(person => {
      const gen = getGeneration(person);
      if (!grouped.has(gen)) grouped.set(gen, []);
      grouped.get(gen)!.push(person);
    });
    return grouped;
  }, [persons]);

  // Branches (noms de famille)
  const branches = React.useMemo(() => {
    const names = new Set(persons.map(p => p.lastName));
    return Array.from(names).sort();
  }, [persons]);

  // Filtrer personnes
  const filteredPersons = React.useMemo(() => {
    return persons.filter(person => {
      // Recherche
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
        if (!fullName.includes(query)) return false;
      }

      // Génération
      if (selectedGeneration !== null) {
        if (getGeneration(person) !== selectedGeneration) return false;
      }

      // Branche
      if (selectedBranch !== 'all') {
        if (person.lastName !== selectedBranch) return false;
      }

      // Vivant/Décédé
      if (showAliveOnly && person.deathDate) return false;
      if (showDeceasedOnly && !person.deathDate) return false;

      return true;
    });
  }, [persons, searchQuery, selectedGeneration, selectedBranch, showAliveOnly, showDeceasedOnly]);

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

  const minGen = Math.min(...Array.from(personsByGeneration.keys()));
  const maxGen = Math.max(...Array.from(personsByGeneration.keys()));

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold dark:text-white">🔍 Mode Compact</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredPersons.length} / {persons.length} personnes
          </div>
        </div>

        {/* Recherche */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtres avancés */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Génération */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Génération
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={minGen}
                max={maxGen}
                value={selectedGeneration ?? minGen}
                onChange={(e) => setSelectedGeneration(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm dark:text-white w-8">
                {selectedGeneration ?? 'Toutes'}
              </span>
              {selectedGeneration !== null && (
                <button
                  onClick={() => setSelectedGeneration(null)}
                  className="text-xs text-blue-500 hover:underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Branche */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Branche familiale
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Toutes les branches</option>
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              Statut
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowAliveOnly(!showAliveOnly);
                  setShowDeceasedOnly(false);
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  showAliveOnly
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                }`}
              >
                Vivants
              </button>
              <button
                onClick={() => {
                  setShowDeceasedOnly(!showDeceasedOnly);
                  setShowAliveOnly(false);
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  showDeceasedOnly
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                }`}
              >
                Décédés
              </button>
            </div>
          </div>

          {/* Réinitialiser */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGeneration(null);
                setSelectedBranch('all');
                setShowAliveOnly(false);
                setShowDeceasedOnly(false);
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Réinitialiser tout
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-auto p-4">
        {filteredPersons.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600 dark:text-gray-400">Aucun résultat</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPersons.map(person => (
              <div
                key={person.id}
                onClick={() => navigate(`/person/${person.id}`)}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-4 cursor-pointer hover:shadow-xl transition-shadow relative`}
              >
                <div className="flex items-center gap-3 mb-2">
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
                    <div className="font-bold text-sm dark:text-white truncate">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {getYearRange(person)}
                    </div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    Gen {getGeneration(person)}
                  </span>
                  {person.deathDate && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded">
                      ✝ Décédé
                    </span>
                  )}
                </div>

                {person.deathDate && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✝</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
