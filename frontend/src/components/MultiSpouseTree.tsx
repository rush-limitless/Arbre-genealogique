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
}

export const MultiSpouseTree: React.FC<MultiSpouseTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [unions, setUnions] = React.useState<Union[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState<Person | null>(null);

  React.useEffect(() => {
    // Charger les unions
    fetch('http://localhost:3000/api/unions')
      .then(r => r.json())
      .then(data => setUnions(data.data || []));

    // Sélectionner une personne avec plusieurs conjoints
    const personWithMultipleSpouses = persons.find(p => {
      const spouseCount = persons.filter(sp =>
        p.relations?.some(r => r.type === 'SPOUSE' && r.relatedPersonId === sp.id)
      ).length;
      return spouseCount > 1;
    });

    setSelectedPerson(personWithMultipleSpouses || persons[0]);
  }, [persons]);

  const getSpouses = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (!person) return [];
    
    return persons.filter(p =>
      person.relations?.some(r => r.type === 'SPOUSE' && r.relatedPersonId === p.id)
    );
  };

  const getUnionBetween = (person1Id: string, person2Id: string) => {
    return unions.find(u =>
      (u.person1Id === person1Id && u.person2Id === person2Id) ||
      (u.person1Id === person2Id && u.person2Id === person1Id)
    );
  };

  const getChildrenOfUnion = (person1Id: string, person2Id: string) => {
    // Enfants qui ont les deux comme parents
    return persons.filter(child => {
      const parents = persons.filter(p =>
        child.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === p.id)
      );
      return parents.some(p => p.id === person1Id) && parents.some(p => p.id === person2Id);
    });
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

  const PersonCard: React.FC<{ person: Person; size?: 'small' | 'large' }> = ({ person, size = 'small' }) => {
    const isLarge = size === 'large';
    
    return (
      <div
        onClick={() => navigate(`/person/${person.id}`)}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-3 cursor-pointer hover:shadow-xl transition-shadow relative ${
          isLarge ? 'w-64' : 'w-48'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`${isLarge ? 'w-16 h-16' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0`}>
            {person.profilePhotoUrl ? (
              <img
                src={`http://localhost:3000${person.profilePhotoUrl}`}
                alt={person.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className={isLarge ? 'w-10 h-10' : 'w-8 h-8'} viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`font-bold ${isLarge ? 'text-base' : 'text-sm'} dark:text-white truncate`}>
              {person.firstName} {person.lastName}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {getYearRange(person)}
            </div>
          </div>
        </div>

        {person.deathDate && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✝</span>
          </div>
        )}
      </div>
    );
  };

  if (!selectedPerson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">💑</div>
          <p className="text-gray-600 dark:text-gray-400">Aucune personne</p>
        </div>
      </div>
    );
  }

  const spouses = getSpouses(selectedPerson.id);

  return (
    <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white">💑 Vue Multi-Épouses</h2>
            <select
              value={selectedPerson.id}
              onChange={(e) => {
                const person = persons.find(p => p.id === e.target.value);
                if (person) setSelectedPerson(person);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} ({getSpouses(p.id).length} conjoint{getSpouses(p.id).length > 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {spouses.length} union{spouses.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-8">
        {spouses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💔</div>
            <p className="text-gray-600 dark:text-gray-400">Aucune union trouvée</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Personne principale */}
            <div className="flex justify-center">
              <PersonCard person={selectedPerson} size="large" />
            </div>

            {/* Ligne de séparation */}
            <div className="flex items-center justify-center">
              <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
              <div className="px-4 text-sm text-gray-500 dark:text-gray-400">Unions</div>
              <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
            </div>

            {/* Unions */}
            <div className="space-y-12">
              {spouses.map((spouse, idx) => {
                const union = getUnionBetween(selectedPerson.id, spouse.id);
                const children = getChildrenOfUnion(selectedPerson.id, spouse.id);

                return (
                  <div key={spouse.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
                    {/* En-tête union */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-lg dark:text-white">
                            Union #{idx + 1}
                          </div>
                          {union?.startDate && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Marié le {new Date(union.startDate).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                          {union?.location && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              📍 {union.location}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          union?.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {union?.status === 'active' ? 'Active' : 'Terminée'}
                        </span>
                      </div>
                    </div>

                    {/* Conjoint */}
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Conjoint :
                      </div>
                      <PersonCard person={spouse} />
                    </div>

                    {/* Enfants */}
                    {children.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Enfants de cette union ({children.length}) :
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {children.map(child => (
                            <PersonCard key={child.id} person={child} />
                          ))}
                        </div>
                      </div>
                    )}

                    {children.length === 0 && (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        Aucun enfant de cette union
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Statistiques */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {spouses.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Union{spouses.length > 1 ? 's' : ''}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {spouses.reduce((sum, spouse) => 
                      sum + getChildrenOfUnion(selectedPerson.id, spouse.id).length, 0
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Enfants total
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                    {unions.filter(u => u.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Unions actives
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
