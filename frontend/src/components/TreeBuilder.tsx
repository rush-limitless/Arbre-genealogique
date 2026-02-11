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

interface TreeBuilderProps {
  persons: Person[];
}

interface TreeNode {
  person: Person;
  x: number;
  y: number;
  generation: number;
}

export const TreeBuilder: React.FC<TreeBuilderProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [treeNodes, setTreeNodes] = React.useState<TreeNode[]>([]);
  const [draggedPerson, setDraggedPerson] = React.useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedNode, setSelectedNode] = React.useState<TreeNode | null>(null);

  // Paliers de générations
  const generations = [
    { level: -3, label: 'Arrière-arrière-grands-parents', color: 'bg-purple-50', yStart: 0 },
    { level: -2, label: 'Arrière-grands-parents', color: 'bg-indigo-50', yStart: 140 },
    { level: -1, label: 'Grands-parents', color: 'bg-blue-50', yStart: 280 },
    { level: 0, label: 'Parents / Vous', color: 'bg-green-50', yStart: 420 },
    { level: 1, label: 'Enfants', color: 'bg-yellow-50', yStart: 560 },
    { level: 2, label: 'Petits-enfants', color: 'bg-orange-50', yStart: 700 },
    { level: 3, label: 'Arrière-petits-enfants', color: 'bg-red-50', yStart: 840 },
  ];

  // Calculer génération basée sur relations
  const calculateGeneration = (person: Person): number => {
    const hasParents = person.relations?.some(r => r.type === 'PARENT');
    const hasChildren = person.relations?.some(r => r.type === 'CHILD');
    
    if (!hasParents && hasChildren) return 0;
    if (hasParents && !hasChildren) return 1;
    return 0;
  };

  // Auto-placement
  const autoPlacePerson = (person: Person) => {
    const generation = calculateGeneration(person);
    const genConfig = generations.find(g => g.level === generation) || generations[3];
    const existingInGen = treeNodes.filter(n => n.generation === generation);
    const xOffset = existingInGen.length * 280 + 50;
    
    return { x: xOffset, y: genConfig.yStart + 50, generation };
  };

  // Charger auto les personnes avec relations
  React.useEffect(() => {
    const withRelations = persons.filter(p => p.relations?.length > 0);
    if (withRelations.length > 0 && treeNodes.length === 0) {
      setTreeNodes(withRelations.map(p => ({ person: p, ...autoPlacePerson(p) })));
    }
  }, [persons]);

  const filteredPersons = persons.filter(p => 
    !treeNodes.find(n => n.person.id === p.id) &&
    (p.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     p.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDragStart = (person: Person) => {
    setDraggedPerson(person);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedPerson) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const generation = Math.floor(y / 140) - 3;

    setTreeNodes([...treeNodes, { person: draggedPerson, x, y, generation }]);
    setDraggedPerson(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFromTree = (personId: string) => {
    setTreeNodes(treeNodes.filter(n => n.person.id !== personId));
  };

  const getYearRange = (person: Person) => {
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
    return death ? `${birth}-${death}` : `★${birth}`;
  };

  const getBorderColor = (person: Person) => {
    if (person.gender === 'male') return 'border-blue-400';
    if (person.gender === 'female') return 'border-pink-400';
    return 'border-gray-400';
  };

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Liste des personnes à droite */}
      <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2 dark:text-white">👥 Personnes ({persons.length})</h2>
          <input
            type="text"
            placeholder="🔍 Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Glissez-déposez dans l'arbre →
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredPersons.map(person => (
            <div
              key={person.id}
              draggable
              onDragStart={() => handleDragStart(person)}
              className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-3 cursor-move hover:bg-gray-100 dark:hover:bg-gray-600 border-2 ${getBorderColor(person)} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {person.profilePhotoUrl ? (
                    <img
                      src={`http://localhost:3000${person.profilePhotoUrl}`}
                      alt={person.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate dark:text-white">
                    {person.firstName} {person.lastName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {getYearRange(person)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredPersons.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery ? 'Aucun résultat' : 'Toutes les personnes sont dans l\'arbre'}
            </div>
          )}
        </div>
      </div>

      {/* Zone de construction de l'arbre */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg relative overflow-auto">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full min-h-full relative"
        >
          {/* Paliers de générations */}
          {generations.map((gen, idx) => (
            <div
              key={gen.level}
              className={`${gen.color} dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 relative`}
              style={{ height: '140px' }}
            >
              {/* Label de génération */}
              <div className="absolute left-4 top-4 px-3 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-300 dark:border-gray-600">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {gen.label}
                </span>
              </div>

              {/* Ligne de séparation avec indicateur */}
              <div className="absolute left-0 bottom-0 w-full h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>
          ))}

          {/* Message si vide */}
          {treeNodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="text-6xl mb-4">🌳</div>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  Glissez-déposez des personnes ici
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                  Construisez votre arbre génération par génération
                </p>
              </div>
            </div>
          )}

          {/* Personnes dans l'arbre */}
          {treeNodes.map((node, index) => (
            <div
              key={node.person.id}
              className={`absolute bg-white rounded-lg shadow-xl border-2 ${getBorderColor(node.person)} p-4 w-64 cursor-move group hover:shadow-2xl transition-shadow`}
              style={{ left: node.x, top: node.y }}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.currentTarget.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
                const rect = e.currentTarget.parentElement!.getBoundingClientRect();
                const newX = e.clientX - rect.left - 128;
                const newY = e.clientY - rect.top - 60;
                const generation = Math.floor(newY / 140) - 3;
                
                const updatedNodes = [...treeNodes];
                updatedNodes[index] = { ...node, x: Math.max(0, newX), y: Math.max(0, newY), generation };
                setTreeNodes(updatedNodes);
              }}
              onClick={() => setSelectedNode(node)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromTree(node.person.id);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600 z-10"
                title="Retirer"
              >
                ✕
              </button>

              {/* Grande photo */}
              <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                {node.person.profilePhotoUrl ? (
                  <img
                    src={`http://localhost:3000${node.person.profilePhotoUrl}`}
                    alt={node.person.firstName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none">
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

              {/* Nom */}
              <div className="text-center mb-3">
                <div className="font-bold text-base">
                  {node.person.firstName} {node.person.lastName}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {getYearRange(node.person)}
                </div>
              </div>

              {/* Bouton créer lien */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
                className="w-full py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                🔗 Créer un lien
              </button>

              {node.person.deathDate && (
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center shadow">
                  <span className="text-white text-xs">✝</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Compteur */}
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2 z-20">
          <span className="text-sm font-medium dark:text-white">
            📊 {treeNodes.length} personne{treeNodes.length > 1 ? 's' : ''} dans l'arbre
          </span>
        </div>
      </div>

      {/* Modal de création de lien */}
      {selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedNode(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-96" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 dark:text-white">
              Créer un lien pour {selectedNode.person.firstName}
            </h3>
            
            <div className="space-y-3">
              <button className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 text-left px-4">
                👨 Ajouter comme parent
              </button>
              <button className="w-full py-3 bg-green-500 text-white rounded hover:bg-green-600 text-left px-4">
                👶 Ajouter comme enfant
              </button>
              <button className="w-full py-3 bg-pink-500 text-white rounded hover:bg-pink-600 text-left px-4">
                💑 Ajouter comme conjoint
              </button>
              <button className="w-full py-3 bg-purple-500 text-white rounded hover:bg-purple-600 text-left px-4">
                👥 Ajouter comme frère/sœur
              </button>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-full mt-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
