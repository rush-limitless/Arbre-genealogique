import React from 'react';
// @ts-nocheck
import { Link, useNavigate } from 'react-router-dom';
import { Search, SquarePen, Trash2, UserPlus, Users } from 'lucide-react';
import { Avatar } from './Avatar';
import { ListSkeleton } from './Skeleton';
import { toast } from './Toast';
import { Modal } from './Modal';
import { Badge } from './Badge';
import { EmptyState } from './EmptyState';
import { InlineError } from './PageState';
import { apiGetData, apiRequestVoid, buildMediaUrl } from '../services/api';

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
  const [error, setError] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadPersons();
  }, []);

  const loadPersons = () => {
    setLoading(true);
    setError(null);
    apiGetData<any>('/persons')
      .then((data) => {
        setPersons(data.persons);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : 'Impossible de charger la liste.');
        setLoading(false);
      });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
  };

  const filtered = persons.filter(
    (person) =>
      person.firstName.toLowerCase().includes(search.toLowerCase()) ||
      person.lastName.toLowerCase().includes(search.toLowerCase())
  );

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((person) => person.id)));
    }
  };

  const deleteSelected = async () => {
    try {
      await Promise.all(Array.from(selected).map((id) => apiRequestVoid(`/persons/${id}`, { method: 'DELETE' })));
      toast.success(`${selected.size} personne(s) supprimee(s)`);
      setSelected(new Set());
      setSelectMode(false);
      loadPersons();
    } catch (deleteError) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteSelected}
        title="Supprimer des fiches"
        message={`Confirmez la suppression de ${selected.size} fiche(s). Cette action est irreversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        variant="danger"
      />

      <section className="app-panel p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="app-kicker mb-2">Repertoire familial</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Naviguer dans les fiches</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              Recherchez, selectionnez plusieurs personnes et basculez rapidement vers la creation ou l'edition.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setSelectMode(!selectMode);
                setSelected(new Set());
              }}
              className={selectMode ? 'app-button-primary' : 'app-button-ghost'}
            >
              <Users className="mr-2 h-4 w-4" />
              {selectMode ? 'Mode selection actif' : 'Selectionner'}
            </button>
            <Link to="/person/new" className="app-button-primary gap-2">
              <UserPlus className="h-4 w-4" />
              Ajouter une personne
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="app-panel-muted flex items-center gap-3 px-4 py-3">
            <Search className="h-4 w-4 text-[var(--color-accent)]" />
            <input
              type="text"
              placeholder="Rechercher par nom ou prenom..."
              className="w-full bg-transparent text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selectMode && (
            <div className="flex flex-wrap gap-3">
              <button onClick={selectAll} className="app-button-ghost">
                {selected.size === filtered.length ? 'Tout deselectionner' : 'Tout selectionner'}
              </button>
              {selected.size > 0 && (
                <button onClick={() => setShowDeleteModal(true)} className="app-button-danger gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer ({selected.size})
                </button>
              )}
            </div>
          )}
        </div>

        {error && <div className="mt-6"><InlineError message={error} onRetry={loadPersons} /></div>}

        <div className="mt-6">
          {loading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="PF"
              title="Aucune personne trouvee"
              message={search ? `Aucun resultat pour "${search}".` : "Commencez a construire l'arbre en ajoutant votre premiere fiche."}
              action={{
                label: 'Ajouter une personne',
                onClick: () => navigate('/person/new'),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filtered.map((person, idx) => (
                <article
                  key={person.id}
                  className={`app-panel relative p-5 transition-all hover:-translate-y-0.5 ${selected.has(person.id) ? 'ring-2 ring-[var(--color-accent)]' : ''} animate-fade-in`}
                  style={{ animationDelay: `${idx * 0.04}s` }}
                  onClick={() => (selectMode ? toggleSelect(person.id) : navigate(`/person/${person.id}`))}
                >
                  {selectMode && (
                    <div className="absolute right-4 top-4">
                      <input
                        type="checkbox"
                        checked={selected.has(person.id)}
                        onChange={() => toggleSelect(person.id)}
                        className="h-5 w-5 rounded border-[var(--color-line)]"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}

                  {!selectMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/person/${person.id}/edit`);
                      }}
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white/35 text-[var(--color-accent)] transition-all hover:bg-[var(--color-accent-soft)] dark:bg-white/5"
                      title="Editer"
                    >
                      <SquarePen className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex items-start gap-4">
                    <Avatar firstName={person.firstName} lastName={person.lastName} photoUrl={buildMediaUrl(person.profilePhotoUrl)} size="md" />
                    <div className="min-w-0 flex-1 pr-10">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold text-[var(--color-text)]">
                          {person.firstName} {person.lastName}
                        </h3>
                        {person.deathDate ? <Badge variant="error">Decede</Badge> : <Badge variant="success">Vivant</Badge>}
                      </div>
                      {person.birthDate && (
                        <p className="text-sm text-[var(--color-muted)]">
                          {new Date(person.birthDate).toLocaleDateString('fr-FR')}
                          {person.age ? ` · ${person.age} ans` : ''}
                        </p>
                      )}
                      {person.birthPlace && <p className="mt-1 text-sm text-[var(--color-muted)]">{person.birthPlace}</p>}
                      {person.profession && <p className="mt-3 text-sm font-semibold text-[var(--color-accent)]">{person.profession}</p>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
