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
  parents?: any[];
  children?: any[];
  gender?: string;
}

interface FamilyTreeProps {
  persons: Person[];
}

export const FamilyTree: React.FC<FamilyTreeProps> = ({ persons }) => {
  const navigate = useNavigate();

  // Organiser par générations
  const organizeByGenerations = () => {
    const generations: Map<number, Person[]> = new Map();
    const visited = new Set<string>();

    const calculateGeneration = (personId: string, visited: Set<string> = new Set()): number => {
      if (visited.has(personId)) return 0;
      visited.add(personId);
      const person = persons.find(p => p.id === personId);
      if (!person?.parents?.length) return 0;
      return 1 + Math.max(...person.parents.map((p: any) => calculateGeneration(p.id, new Set(visited))));
    };

    persons.forEach(person => {
      const gen = calculateGeneration(person.id);
      if (!generations.has(gen)) generations.set(gen, []);
      generations.get(gen)!.push(person);
    });

    return Array.from(generations.entries()).sort((a, b) => b[0] - a[0]);
  };

  const generations = organizeByGenerations();

  const getYearRange = (person: Person) => {
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
    return death ? `${birth} - ${death}` : `★ ${birth}`;
  };

  const getBorderColor = (person: Person) => {
    if (person.gender === 'male') return 'border-blue-400';
    if (person.gender === 'female') return 'border-pink-400';
    return 'border-gray-400';
  };

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="min-w-max relative">
        {generations.map(([genNumber, people], genIndex) => (
          <div key={genNumber} className="mb-16 relative">
            <div className="flex items-center justify-center gap-8 mb-4">
              {people.map((person, idx) => (
                <div key={person.id} className="relative" style={{ zIndex: 10 }}>
                  {/* Ligne verticale vers le haut (vers les parents) */}
                  {person.parents && person.parents.length > 0 && genIndex > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-16 w-0.5 h-16 bg-gray-400"></div>
                  )}

                  {/* Carte personne */}
                  <div
                    onClick={() => navigate(`/person/${person.id}`)}
                    className={`bg-white rounded-lg shadow-md border-2 ${getBorderColor(person)} p-4 w-64 cursor-pointer hover:shadow-lg transition-shadow relative`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Photo */}
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-300">
                        {person.profilePhotoUrl ? (
                          <img
                            src={`http://localhost:3000${person.profilePhotoUrl}`}
                            alt={person.firstName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base truncate">
                          {person.firstName} {person.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getYearRange(person)}
                        </div>
                      </div>
                    </div>

                    {/* Badge décédé */}
                    {person.deathDate && (
                      <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✝</span>
                      </div>
                    )}
                  </div>

                  {/* Ligne verticale vers le bas (vers les enfants) */}
                  {person.children && person.children.length > 0 && genIndex < generations.length - 1 && (
                    <>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0.5 h-8 bg-gray-400"></div>
                      {/* Bouton + */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-[calc(100%+32px)] z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/person/new');
                          }}
                          className="w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-50 hover:border-blue-400 transition-colors shadow-sm"
                          title="Ajouter un enfant"
                        >
                          <span className="text-gray-600 text-lg">+</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Ligne horizontale reliant les frères et sœurs */}
            {people.length > 1 && genIndex < generations.length - 1 && (
              <div className="absolute left-0 right-0 top-[calc(100%-32px)] flex justify-center" style={{ zIndex: 1 }}>
                <div 
                  className="h-0.5 bg-gray-400" 
                  style={{ 
                    width: `${(people.length - 1) * 288 + 128}px`,
                    marginLeft: 'auto',
                    marginRight: 'auto'
                  }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
