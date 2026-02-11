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

interface HierarchicalTreeProps {
  persons: Person[];
}

export const HierarchicalTree: React.FC<HierarchicalTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = React.useState<Person | null>(null);
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    // Trouver une personne racine (sans parents)
    const root = persons.find(p => 
      !p.relations?.some(r => r.type === 'PARENT')
    );
    if (root) setRootPerson(root);
  }, [persons]);

  const getChildren = (personId: string) => {
    return persons.filter(p =>
      p.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === personId)
    );
  };

  const getSpouses = (personId: string) => {
    const person = persons.find(p => p.id === personId);
    if (!person) return [];
    
    return persons.filter(p =>
      person.relations?.some(r => r.type === 'SPOUSE' && r.relatedPersonId === p.id)
    );
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

  const PersonCard: React.FC<{ person: Person; level: number }> = ({ person, level }) => {
    const children = getChildren(person.id);
    const spouses = getSpouses(person.id);
    const [expanded, setExpanded] = React.useState(level < 2);

    return (
      <div className="flex flex-col items-center">
        {/* Carte personne */}
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-4 w-64 cursor-pointer hover:shadow-xl transition-shadow relative`}
          onClick={() => navigate(`/person/${person.id}`)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
              {person.profilePhotoUrl ? (
                <img
                  src={`http://localhost:3000${person.profilePhotoUrl}`}
                  alt={person.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                  <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm dark:text-white">
                {person.firstName} {person.lastName}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {getYearRange(person)}
              </div>
            </div>
          </div>

          {/* Conjoints */}
          {spouses.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              💑 {spouses.length} conjoint{spouses.length > 1 ? 's' : ''}
            </div>
          )}

          {/* Bouton expansion */}
          {children.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="w-full py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              {expanded ? '▼' : '▶'} {children.length} enfant{children.length > 1 ? 's' : ''}
            </button>
          )}

          {person.deathDate && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✝</span>
            </div>
          )}
        </div>

        {/* Ligne verticale */}
        {expanded && children.length > 0 && (
          <div className="w-0.5 h-8 bg-gray-300 dark:bg-gray-600"></div>
        )}

        {/* Enfants */}
        {expanded && children.length > 0 && (
          <div className="relative">
            {/* Ligne horizontale */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-600" style={{ top: '-1px' }}></div>
            
            <div className="flex gap-8 pt-8">
              {children.map((child, idx) => (
                <div key={child.id} className="relative">
                  {/* Ligne verticale vers enfant */}
                  <div className="absolute bottom-full left-1/2 w-0.5 h-8 bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>
                  <PersonCard person={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!rootPerson) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🌳</div>
        <p className="text-gray-600 dark:text-gray-400">Aucune personne racine trouvée</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 overflow-auto">
      {/* Contrôles */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold dark:text-white">🌳 Arbre Hiérarchique</h2>
          <select
            value={rootPerson.id}
            onChange={(e) => {
              const person = persons.find(p => p.id === e.target.value);
              if (person) setRootPerson(person);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          >
            {persons.filter(p => !p.relations?.some(r => r.type === 'PARENT')).map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
          >
            −
          </button>
          <span className="text-sm dark:text-white">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.min(2, scale + 0.1))}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300"
          >
            +
          </button>
          <button
            onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
            className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Arbre */}
      <div 
        className="p-8 flex justify-center"
        style={{ 
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          minHeight: '100vh'
        }}
      >
        <PersonCard person={rootPerson} level={0} />
      </div>
    </div>
  );
};
