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

interface HierarchicalListProps {
  persons: Person[];
}

export const HierarchicalList: React.FC<HierarchicalListProps> = ({ persons }) => {
  const navigate = useNavigate();
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = React.useState<'name' | 'birth' | 'death'>('name');
  const [editingPerson, setEditingPerson] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<any>({});

  const getChildren = (personId: string) => {
    return persons.filter(p =>
      p.relations?.some(r => r.type === 'PARENT' && r.relatedPersonId === personId)
    );
  };

  const getRoots = () => {
    return persons.filter(p => !p.relations?.some(r => r.type === 'PARENT'));
  };

  const toggleExpand = (personId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(personId)) {
      newExpanded.delete(personId);
    } else {
      newExpanded.add(personId);
    }
    setExpandedNodes(newExpanded);
  };

  const sortPersons = (personsList: Person[]) => {
    return [...personsList].sort((a, b) => {
      if (sortBy === 'name') {
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortBy === 'birth') {
        const aDate = a.birthDate ? new Date(a.birthDate).getTime() : 0;
        const bDate = b.birthDate ? new Date(b.birthDate).getTime() : 0;
        return aDate - bDate;
      } else {
        const aDate = a.deathDate ? new Date(a.deathDate).getTime() : Infinity;
        const bDate = b.deathDate ? new Date(b.deathDate).getTime() : Infinity;
        return aDate - bDate;
      }
    });
  };

  const getYearRange = (person: Person) => {
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : '?';
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : '';
    return death ? `${birth} - ${death}` : `${birth}`;
  };

  const startEdit = (person: Person) => {
    setEditingPerson(person.id);
    setEditData({
      firstName: person.firstName,
      lastName: person.lastName,
      birthDate: person.birthDate?.split('T')[0] || '',
      deathDate: person.deathDate?.split('T')[0] || '',
      gender: person.gender,
    });
  };

  const saveEdit = async (personId: string) => {
    try {
      await fetch(`http://localhost:3000/api/persons/${personId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      setEditingPerson(null);
      window.location.reload();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const cancelEdit = () => {
    setEditingPerson(null);
    setEditData({});
  };

  const PersonRow: React.FC<{ person: Person; level: number }> = ({ person, level }) => {
    const children = getChildren(person.id);
    const isExpanded = expandedNodes.has(person.id);
    const hasChildren = children.length > 0;
    const isEditing = editingPerson === person.id;

    return (
      <>
        <div
          className={`flex items-center gap-2 py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-800 ${
            level > 0 ? 'bg-gray-50 dark:bg-gray-800' : ''
          } ${isEditing ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
          style={{ paddingLeft: `${level * 32 + 12}px` }}
        >
          {/* Icône expansion */}
          <div className="w-6 flex-shrink-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(person.id);
                }}
                className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
          </div>

          {/* Photo */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {person.profilePhotoUrl ? (
              <img
                src={`http://localhost:3000${person.profilePhotoUrl}`}
                alt={person.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#3B82F6" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="#8B5CF6" />
              </svg>
            )}
          </div>

          {/* Nom */}
          {isEditing ? (
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Prénom"
              />
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="flex-1 px-2 py-1 border rounded dark:bg-gray-700 dark:text-white text-sm"
                placeholder="Nom"
              />
            </div>
          ) : (
            <div
              className="flex-1 font-medium dark:text-white cursor-pointer"
              onClick={() => navigate(`/person/${person.id}`)}
            >
              {person.firstName} {person.lastName}
            </div>
          )}

          {/* Dates */}
          {isEditing ? (
            <div className="w-32 flex gap-1">
              <input
                type="date"
                value={editData.birthDate}
                onChange={(e) => setEditData({ ...editData, birthDate: e.target.value })}
                className="w-full px-1 py-1 border rounded dark:bg-gray-700 dark:text-white text-xs"
              />
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400 w-32">
              {getYearRange(person)}
            </div>
          )}

          {/* Genre */}
          {isEditing ? (
            <select
              value={editData.gender}
              onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
              className="text-sm w-20 px-1 py-1 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="MALE">♂ Homme</option>
              <option value="FEMALE">♀ Femme</option>
              <option value="OTHER">Autre</option>
            </select>
          ) : (
            <div className="text-sm w-20">
              {person.gender === 'MALE' && <span className="text-blue-500">♂ Homme</span>}
              {person.gender === 'FEMALE' && <span className="text-pink-500">♀ Femme</span>}
            </div>
          )}

          {/* Enfants */}
          {hasChildren && !isEditing && (
            <div className="text-xs text-gray-500 dark:text-gray-400 w-24">
              {children.length} enfant{children.length > 1 ? 's' : ''}
            </div>
          )}
          {!hasChildren && !isEditing && <div className="w-24"></div>}
          {isEditing && <div className="w-24"></div>}

          {/* Actions */}
          <div className="w-24 flex gap-1 justify-end">
            {isEditing ? (
              <>
                <button
                  onClick={() => saveEdit(person.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => startEdit(person)}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  ✏️
                </button>
                {person.deathDate && (
                  <span className="text-gray-500 text-sm">✝</span>
                )}
              </>
            )}
          </div>
        </div>

        {/* Enfants */}
        {isExpanded && hasChildren && (
          <>
            {sortPersons(children).map(child => (
              <PersonRow key={child.id} person={child} level={level + 1} />
            ))}
          </>
        )}
      </>
    );
  };

  const roots = sortPersons(getRoots());

  return (
    <div className="w-full h-full bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">📋 Liste Hiérarchique</h2>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {persons.length} personnes
          </div>
        </div>

        {/* Contrôles */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium dark:text-white">Trier par :</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="name">Nom</option>
              <option value="birth">Date de naissance</option>
              <option value="death">Date de décès</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const allIds = new Set(persons.map(p => p.id));
                setExpandedNodes(allIds);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Tout déplier
            </button>
            <button
              onClick={() => setExpandedNodes(new Set())}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 text-sm dark:text-white"
            >
              Tout replier
            </button>
          </div>
        </div>
      </div>

      {/* En-têtes colonnes */}
      <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <div className="w-6"></div>
        <div className="w-8"></div>
        <div className="flex-1">Nom</div>
        <div className="w-32">Dates</div>
        <div className="w-20">Genre</div>
        <div className="w-24">Enfants</div>
        <div className="w-24 text-right">Actions</div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-auto">
        {roots.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-600 dark:text-gray-400">Aucune personne</p>
          </div>
        ) : (
          <>
            {roots.map(person => (
              <PersonRow key={person.id} person={person} level={0} />
            ))}
          </>
        )}
      </div>

      {/* Footer stats */}
      <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <div>
            {roots.length} racine{roots.length > 1 ? 's' : ''}
          </div>
          <div>
            {persons.filter(p => !p.deathDate).length} vivant{persons.filter(p => !p.deathDate).length > 1 ? 's' : ''}
          </div>
          <div>
            {persons.filter(p => p.deathDate).length} décédé{persons.filter(p => p.deathDate).length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};
