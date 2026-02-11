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

interface ChronologicalTreeProps {
  persons: Person[];
}

export const ChronologicalTree: React.FC<ChronologicalTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [selectedDecade, setSelectedDecade] = React.useState<number | null>(null);

  // Grouper par décennie de naissance
  const personsByDecade = React.useMemo(() => {
    const grouped = new Map<number, Person[]>();
    
    persons.forEach(person => {
      if (!person.birthDate) return;
      
      const year = new Date(person.birthDate).getFullYear();
      const decade = Math.floor(year / 10) * 10;
      
      if (!grouped.has(decade)) grouped.set(decade, []);
      grouped.get(decade)!.push(person);
    });

    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
  }, [persons]);

  const decades = Array.from(personsByDecade.keys());
  const minDecade = Math.min(...decades);
  const maxDecade = Math.max(...decades);

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

  const getAge = (person: Person) => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate).getFullYear();
    const end = person.deathDate ? new Date(person.deathDate).getFullYear() : new Date().getFullYear();
    return end - birth;
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">📅 Timeline Chronologique</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {minDecade}s - {maxDecade}s ({decades.length} décennies)
          </div>
        </div>

        {/* Timeline horizontale */}
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {decades.map(decade => {
              const count = personsByDecade.get(decade)?.length || 0;
              const isSelected = selectedDecade === decade;
              
              return (
                <button
                  key={decade}
                  onClick={() => setSelectedDecade(isSelected ? null : decade)}
                  className={`flex-shrink-0 px-4 py-3 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-lg scale-110'
                      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="font-bold">{decade}s</div>
                  <div className="text-xs mt-1">{count} pers.</div>
                </button>
              );
            })}
          </div>
          
          {selectedDecade && (
            <button
              onClick={() => setSelectedDecade(null)}
              className="absolute top-0 right-0 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm hover:bg-gray-300"
            >
              Voir tout
            </button>
          )}
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-auto p-6">
        {selectedDecade ? (
          // Vue détaillée d'une décennie
          <div>
            <h3 className="text-2xl font-bold mb-6 dark:text-white">
              Années {selectedDecade}s
            </h3>
            
            <div className="space-y-8">
              {Array.from({ length: 10 }, (_, i) => selectedDecade + i).map(year => {
                const personsInYear = personsByDecade.get(selectedDecade)?.filter(p => {
                  const birthYear = new Date(p.birthDate!).getFullYear();
                  return birthYear === year;
                }) || [];

                if (personsInYear.length === 0) return null;

                return (
                  <div key={year} className="relative">
                    {/* Ligne verticale */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-300 dark:bg-blue-700"></div>
                    
                    <div className="flex gap-4">
                      {/* Année */}
                      <div className="flex-shrink-0 w-16 text-right">
                        <div className="inline-block px-3 py-1 bg-blue-500 text-white rounded-full font-bold text-sm">
                          {year}
                        </div>
                      </div>

                      {/* Personnes */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personsInYear.map(person => (
                          <div
                            key={person.id}
                            onClick={() => navigate(`/person/${person.id}`)}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-4 cursor-pointer hover:shadow-xl transition-shadow relative`}
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
                                <div className="font-bold text-sm dark:text-white truncate">
                                  {person.firstName} {person.lastName}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {getYearRange(person)}
                                </div>
                                {getAge(person) && (
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {getAge(person)} ans
                                  </div>
                                )}
                              </div>
                            </div>

                            {person.deathDate && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✝</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // Vue globale par décennie
          <div className="space-y-6">
            {decades.map(decade => {
              const personsInDecade = personsByDecade.get(decade) || [];
              
              return (
                <div
                  key={decade}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">
                      📅 Années {decade}s
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {personsInDecade.length} personnes
                      </span>
                      <button
                        onClick={() => setSelectedDecade(decade)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Voir détails →
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {personsInDecade.slice(0, 12).map(person => (
                      <div
                        key={person.id}
                        onClick={() => navigate(`/person/${person.id}`)}
                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow border-2 ${getBorderColor(person)} relative`}
                      >
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
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
                        <div className="text-xs font-semibold text-center dark:text-white truncate">
                          {person.firstName}
                        </div>
                        <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                          {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'}
                        </div>

                        {person.deathDate && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✝</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {personsInDecade.length > 12 && (
                      <div
                        onClick={() => setSelectedDecade(decade)}
                        className="bg-gray-100 dark:bg-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 flex items-center justify-center"
                      >
                        <div className="text-center">
                          <div className="text-2xl font-bold dark:text-white">
                            +{personsInDecade.length - 12}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Voir tout
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
