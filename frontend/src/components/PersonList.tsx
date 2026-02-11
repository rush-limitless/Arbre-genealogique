import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { ListSkeleton } from './Skeleton';
import { toast } from './Toast';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  birthPlace?: string;
  profession?: string;
  age?: number;
  profilePhotoUrl?: string;
  deathDate?: string;
}

export function PersonList() {
  const [persons, setPersons] = React.useState<Person[]>([]);
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = () => {
    fetch('http://localhost:3000/api/persons')
      .then(res => res.json())
      .then(data => {
        setPersons(data.data.persons);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(
        Array.from(selected).map(id =>
          fetch(`http://localhost:3000/api/persons/${id}`, { method: 'DELETE' })
        )
      );
      toast.success(`${selected.size} personne(s) supprimée(s)`);
      setSelected(new Set());
      setSelectMode(false);
      loadPersons();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filtered = persons.filter(p => 
    p.firstName.toLowerCase().includes(search.toLowerCase()) ||
    p.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteSelected}
        title="Supprimer des personnes"
        message={`Êtes-vous sûr de vouloir supprimer ${selected.size} personne(s) ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectMode(!selectMode);
              setSelected(new Set());
            }}
            className={`px-4 py-2 rounded-lg ${selectMode ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            {selectMode ? '✓ Mode sélection' : 'Sélectionner'}
          </button>
          {selectMode && (
            <>
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                {selected.size === filtered.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              {selected.size > 0 && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  🗑️ Supprimer ({selected.size})
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom..."
          className="w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Aucune personne trouvée"
          message={search ? `Aucun résultat pour "${search}"` : "Commencez à construire votre arbre généalogique en ajoutant votre première personne."}
          action={{
            label: "➕ Ajouter une personne",
            onClick: () => navigate('/person/new')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((person, idx) => (
            <div
              key={person.id}
              className={`border rounded-lg p-4 bg-white dark:bg-gray-800 hover:shadow-lg cursor-pointer relative transition-all animate-fade-in ${
                selected.has(person.id) ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => selectMode ? toggleSelect(person.id) : navigate(`/person/${person.id}`)}
            >
              {selectMode && (
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selected.has(person.id)}
                    onChange={() => toggleSelect(person.id)}
                    className="w-5 h-5"
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
              {!selectMode && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/person/${person.id}/edit`);
                    }}
                    className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                    title="Éditer"
                  >
                    ✏️
                  </button>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Avatar
                  firstName={person.firstName}
                  lastName={person.lastName}
                  photoUrl={person.profilePhotoUrl ? `http://localhost:3000${person.profilePhotoUrl}` : undefined}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg dark:text-white">{person.firstName} {person.lastName}</h3>
                    {person.deathDate ? (
                      <Badge variant="error">Décédé</Badge>
                    ) : (
                      <Badge variant="success">Vivant</Badge>
                    )}
                  </div>
                  {person.birthDate && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(person.birthDate).toLocaleDateString('fr-FR')}
                      {person.age && ` • ${person.age} ans`}
                    </p>
                  )}
                  {person.birthPlace && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">{person.birthPlace}</p>
                  )}
                  {person.profession && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{person.profession}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => navigate('/person/new')}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-2xl z-50"
        title="Ajouter une personne (N)"
      >
        +
      </button>
    </>
  );
}
