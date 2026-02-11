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

interface InteractiveTreeProps {
  persons: Person[];
}

export const InteractiveTree: React.FC<InteractiveTreeProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [rootPerson, setRootPerson] = React.useState<Person | null>(null);
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Trouver personne racine ou prendre la première
    const root = persons.find(p => !p.relations?.some(r => r.type === 'PARENT')) || persons[0];
    if (root) {
      setRootPerson(root);
      setExpandedNodes(new Set([root.id]));
    }
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

  const getSiblings = (personId: string) => {
    const parents = getParents(personId);
    if (parents.length === 0) return [];
    
    const siblings = new Set<Person>();
    parents.forEach(parent => {
      getChildren(parent.id).forEach(child => {
        if (child.id !== personId) siblings.add(child);
      });
    });
    
    return Array.from(siblings);
  };

  const toggleExpand = (personId: string, type: 'parents' | 'children' | 'siblings') => {
    const key = `${personId}-${type}`;
    const newExpanded = new Set(expandedNodes);
    
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    
    setExpandedNodes(newExpanded);
  };

  const isExpanded = (personId: string, type: string) => {
    return expandedNodes.has(`${personId}-${type}`);
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

  const PersonNode: React.FC<{ person: Person; isRoot?: boolean }> = ({ person, isRoot = false }) => {
    const parents = getParents(person.id);
    const children = getChildren(person.id);
    const siblings = getSiblings(person.id);
    
    const showParents = isExpanded(person.id, 'parents');
    const showChildren = isExpanded(person.id, 'children');
    const showSiblings = isExpanded(person.id, 'siblings');

    return (
      <div className="flex flex-col items-center">
        {/* Parents */}
        {showParents && parents.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              {parents.map(parent => (
                <PersonNode key={parent.id} person={parent} />
              ))}
            </div>
            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600 mx-auto"></div>
          </div>
        )}

        {/* Carte personne */}
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${getBorderColor(person)} p-4 w-64 relative ${isRoot ? 'ring-4 ring-blue-400' : ''}`}>
          <div className="flex items-center gap-3 mb-3">
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
              <div 
                className="font-bold text-sm dark:text-white truncate cursor-pointer hover:text-blue-500"
                onClick={() => navigate(`/person/${person.id}`)}
              >
                {person.firstName} {person.lastName}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {getYearRange(person)}
              </div>
            </div>
          </div>

          {/* Boutons expansion */}
          <div className="space-y-2">
            {parents.length > 0 && (
              <button
                onClick={() => toggleExpand(person.id, 'parents')}
                className={`w-full py-1 text-xs rounded transition-colors ${
                  showParents
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {showParents ? '▲' : '▼'} Parents ({parents.length})
              </button>
            )}
            
            {siblings.length > 0 && (
              <button
                onClick={() => toggleExpand(person.id, 'siblings')}
                className={`w-full py-1 text-xs rounded transition-colors ${
                  showSiblings
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {showSiblings ? '◄►' : '◄►'} Fratrie ({siblings.length})
              </button>
            )}
            
            {children.length > 0 && (
              <button
                onClick={() => toggleExpand(person.id, 'children')}
                className={`w-full py-1 text-xs rounded transition-colors ${
                  showChildren
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {showChildren ? '▼' : '▶'} Enfants ({children.length})
              </button>
            )}
          </div>

          {person.deathDate && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✝</span>
            </div>
          )}
        </div>

        {/* Fratrie */}
        {showSiblings && siblings.length > 0 && (
          <div className="flex gap-4 mt-4">
            {siblings.map(sibling => (
              <PersonNode key={sibling.id} person={sibling} />
            ))}
          </div>
        )}

        {/* Enfants */}
        {showChildren && children.length > 0 && (
          <div className="mt-4">
            <div className="w-0.5 h-4 bg-gray-300 dark:bg-gray-600 mx-auto mb-2"></div>
            <div className="flex gap-4 flex-wrap justify-center">
              {children.map(child => (
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🌳</div>
          <p className="text-gray-600 dark:text-gray-400">Aucune personne</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold dark:text-white">🔄 Arbre Interactif</h2>
            <select
              value={rootPerson.id}
              onChange={(e) => {
                const person = persons.find(p => p.id === e.target.value);
                if (person) {
                  setRootPerson(person);
                  setExpandedNodes(new Set([person.id]));
                }
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandedNodes(new Set([rootPerson.id]))}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              Tout replier
            </button>
            <button
              onClick={() => {
                const allNodes = new Set<string>();
                persons.forEach(p => {
                  allNodes.add(`${p.id}-parents`);
                  allNodes.add(`${p.id}-children`);
                  allNodes.add(`${p.id}-siblings`);
                });
                setExpandedNodes(allNodes);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Tout déplier
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          💡 Cliquez sur les boutons pour déplier parents, fratrie ou enfants
        </div>
      </div>

      {/* Arbre */}
      <div className="flex-1 overflow-auto p-8">
        <div className="flex justify-center">
          <PersonNode person={rootPerson} isRoot={true} />
        </div>
      </div>
    </div>
  );
};
