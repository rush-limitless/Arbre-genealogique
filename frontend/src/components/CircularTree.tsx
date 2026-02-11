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

interface CircularTreeProps {
  persons: Person[];
}

export const CircularTree: React.FC<CircularTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [centerPerson, setCenterPerson] = React.useState<Person | null>(null);
  const [hoveredPerson, setHoveredPerson] = React.useState<Person | null>(null);

  React.useEffect(() => {
    const root = persons.find(p => !p.relations?.some(r => r.type === 'PARENT')) || persons[0];
    if (root) setCenterPerson(root);
  }, [persons]);

  const getParents = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (!person) return [];
    return persons.filter(p =>
      person.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === p.id)
    );
  };

  const getChildren = (personId: string) => {
    return persons.filter(p =>
      p.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === personId)
    );
  };

  const getGrandParents = (personId: string) => {
    const parents = getParents(personId);
    const grandParents: Person[] = [];
    parents.forEach(parent => {
      grandParents.push(...getParents(parent.id));
    });
    return grandParents;
  };

  const getGrandChildren = (personId: string) => {
    const children = getChildren(personId);
    const grandChildren: Person[] = [];
    children.forEach(child => {
      grandChildren.push(...getChildren(child.id));
    });
    return grandChildren;
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

  if (!centerPerson) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <p className="text-gray-600 dark:text-gray-400">Aucune personne</p>
        </div>
      </div>
    );
  }

  const parents = getParents(centerPerson.id);
  const children = getChildren(centerPerson.id);
  const grandParents = getGrandParents(centerPerson.id);
  const grandChildren = getGrandChildren(centerPerson.id);

  const PersonCircle: React.FC<{ 
    person: Person; 
    angle: number; 
    radius: number; 
    size: number;
  }> = ({ person, angle, radius, size }) => {
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    return (
      <div
        className={`absolute cursor-pointer transition-all hover:scale-110 ${
          hoveredPerson?.id === person.id ? 'scale-125 z-20' : ''
        }`}
        style={{
          left: `calc(50% + ${x}px - ${size / 2}px)`,
          top: `calc(50% + ${y}px - ${size / 2}px)`,
          width: `${size}px`,
          height: `${size}px`,
        }}
        onClick={() => setCenterPerson(person)}
        onMouseEnter={() => setHoveredPerson(person)}
        onMouseLeave={() => setHoveredPerson(null)}
      >
        <div className={`w-full h-full rounded-full bg-white dark:bg-gray-800 border-4 ${getBorderColor(person)} shadow-lg flex items-center justify-center overflow-hidden`}>
          {person.profilePhotoUrl ? (
            <img
              src={`http://localhost:3000${person.profilePhotoUrl}`}
              alt={person.firstName}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-2/3 h-2/3" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#3B82F6" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
            </svg>
          )}
        </div>
        {person.deathDate && (
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✝</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white">⭕ Vue Circulaire</h2>
            <select
              value={centerPerson.id}
              onChange={(e) => {
                const person = persons.find(p => p.id === e.target.value);
                if (person) setCenterPerson(person);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {persons.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 Cliquez sur une personne pour la centrer
          </div>
        </div>
      </div>

      {/* Vue circulaire */}
      <div className="flex-1 relative overflow-hidden">
        {/* Cercles de fond */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <circle cx="50%" cy="50%" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
          <circle cx="50%" cy="50%" r="160" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
          <circle cx="50%" cy="50%" r="240" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
          <circle cx="50%" cy="50%" r="320" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-200 dark:text-gray-700" />
        </svg>

        {/* Labels cercles */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400" style={{ transform: 'translate(-50%, -90px)' }}>
          Parents
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400" style={{ transform: 'translate(-50%, -170px)' }}>
          Grands-parents
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400" style={{ transform: 'translate(-50%, 80px)' }}>
          Enfants
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400" style={{ transform: 'translate(-50%, 160px)' }}>
          Petits-enfants
        </div>

        {/* Personne centrale */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div
            className="cursor-pointer"
            onClick={() => navigate(`/person/${centerPerson.id}`)}
          >
            <div className={`w-32 h-32 rounded-full bg-white dark:bg-gray-800 border-4 ${getBorderColor(centerPerson)} shadow-2xl flex flex-col items-center justify-center overflow-hidden ring-4 ring-blue-400`}>
              {centerPerson.profilePhotoUrl ? (
                <img
                  src={`http://localhost:3000${centerPerson.profilePhotoUrl}`}
                  alt={centerPerson.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-20 h-20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                  <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
                </svg>
              )}
            </div>
            <div className="text-center mt-2">
              <div className="font-bold dark:text-white">{centerPerson.firstName}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{getYearRange(centerPerson)}</div>
            </div>
          </div>
        </div>

        {/* Grands-parents (cercle 2) */}
        {grandParents.map((person, idx) => {
          const angle = (idx / grandParents.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <PersonCircle
              key={person.id}
              person={person}
              angle={angle}
              radius={240}
              size={60}
            />
          );
        })}

        {/* Parents (cercle 1) */}
        {parents.map((person, idx) => {
          const angle = (idx / parents.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <PersonCircle
              key={person.id}
              person={person}
              angle={angle}
              radius={160}
              size={80}
            />
          );
        })}

        {/* Enfants (cercle 1 bas) */}
        {children.map((person, idx) => {
          const angle = (idx / children.length) * Math.PI * 2 + Math.PI / 2;
          return (
            <PersonCircle
              key={person.id}
              person={person}
              angle={angle}
              radius={160}
              size={80}
            />
          );
        })}

        {/* Petits-enfants (cercle 2 bas) */}
        {grandChildren.map((person, idx) => {
          const angle = (idx / grandChildren.length) * Math.PI * 2 + Math.PI / 2;
          return (
            <PersonCircle
              key={person.id}
              person={person}
              angle={angle}
              radius={240}
              size={60}
            />
          );
        })}

        {/* Info hover */}
        {hoveredPerson && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-30 border-2 border-gray-200 dark:border-gray-700">
            <div className="font-bold dark:text-white">
              {hoveredPerson.firstName} {hoveredPerson.lastName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {getYearRange(hoveredPerson)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Cliquez pour centrer
            </div>
          </div>
        )}
      </div>

      {/* Légende */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="dark:text-white">Homme</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-pink-500"></div>
            <span className="dark:text-white">Femme</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400"></div>
            <span className="dark:text-white">Autre</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="dark:text-white">✝</span>
            <span className="dark:text-white">Décédé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
