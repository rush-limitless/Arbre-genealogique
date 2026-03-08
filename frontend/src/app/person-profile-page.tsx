// @ts-nocheck
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InlineError, PageError, PageLoader } from '../components/PageState';
import { toast } from '../components/Toast';
import type { PaginatedResponse } from '../types';
import { apiGetData, apiRequestData, apiRequestVoid, buildMediaUrl, jsonBody } from '../services/api';
import { Breadcrumb, NavBar } from './shell';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
};

const loadPersons = async () => {
  const data = await apiGetData<PaginatedResponse<any>>('/persons');
  return data.persons || [];
};

const loadPerson = (id: string) => apiGetData<any>(`/persons/${id}`);

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return 'Date inconnue';
  }

  return new Date(value).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getPersonInitials = (person?: { firstName?: string; lastName?: string }) =>
  [person?.firstName, person?.lastName]
    .filter(Boolean)
    .map((value) => value![0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'PF';

function EventsPanel({ personId }: { personId: string }) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [newEvent, setNewEvent] = React.useState({
    title: '',
    eventType: 'other',
    eventDate: '',
    description: '',
  });

  const loadEvents = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextEvents = await apiGetData<any[]>(`/events/person/${personId}`);
      setEvents(nextEvents || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [personId]);

  React.useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAdd = async () => {
    if (!newEvent.title || !newEvent.eventDate) {
      setError('Le titre et la date de l evenement sont requis.');
      return;
    }

    try {
      await apiRequestData('/events', {
        method: 'POST',
        body: jsonBody({ ...newEvent, personId }),
      });
      setShowAdd(false);
      setNewEvent({ title: '', eventType: 'other', eventDate: '', description: '' });
      toast.success('Evenement ajoute.');
      loadEvents();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="app-panel p-6 sm:p-7">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="app-kicker mb-2">Chronologie</p>
          <h2 className="font-display text-3xl text-[var(--color-text)]">Evenements</h2>
        </div>
        <button type="button" onClick={() => setShowAdd((previous) => !previous)} className="app-button-secondary">
          {showAdd ? 'Fermer' : 'Ajouter'}
        </button>
      </div>

      {error && <InlineError message={error} onRetry={loadEvents} />}

      {showAdd && (
        <div className="app-panel-muted mb-5 grid gap-3 p-4">
          <input
            type="text"
            placeholder="Titre"
            className="app-input"
            value={newEvent.title}
            onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })}
          />
          <select
            className="app-select"
            value={newEvent.eventType}
            onChange={(event) => setNewEvent({ ...newEvent, eventType: event.target.value })}
          >
            <option value="birth">Naissance</option>
            <option value="marriage">Mariage</option>
            <option value="death">Deces</option>
            <option value="education">Education</option>
            <option value="career">Carriere</option>
            <option value="other">Autre</option>
          </select>
          <input
            type="date"
            className="app-input"
            value={newEvent.eventDate}
            onChange={(event) => setNewEvent({ ...newEvent, eventDate: event.target.value })}
          />
          <textarea
            placeholder="Description"
            className="app-textarea min-h-[120px]"
            value={newEvent.description}
            onChange={(event) => setNewEvent({ ...newEvent, description: event.target.value })}
          />
          <button type="button" onClick={handleAdd} className="app-button-primary w-fit">
            Enregistrer l'evenement
          </button>
        </div>
      )}

      {loading ? (
        <PageLoader message="Chargement des evenements..." />
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="app-panel-muted p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-[var(--color-text)]">{event.title}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">{event.description || 'Aucune note associee.'}</div>
                </div>
                <div className="app-chip-neutral w-fit">
                  {formatDisplayDate(event.eventDate)} · {event.eventType}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-muted)]">
          Aucun evenement enregistre pour cette fiche.
        </div>
      )}
    </div>
  );
}

export function PersonProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = React.useState<any>(null);
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [showAddParent, setShowAddParent] = React.useState(false);
  const [showAddUnion, setShowAddUnion] = React.useState(false);
  const [selectedParent, setSelectedParent] = React.useState('');
  const [selectedPartner, setSelectedPartner] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  const loadDetails = React.useCallback(async () => {
    if (!id) {
      setError('Identifiant manquant.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [personData, personsData] = await Promise.all([loadPerson(id), loadPersons()]);
      setPerson(personData);
      setPersons(personsData.filter((personItem: any) => personItem.id !== id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) {
      return;
    }

    setUploading(true);
    setActionError(null);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('personId', id);
    formData.append('title', 'Photo de profil');

    try {
      await apiRequestData('/media/upload', {
        method: 'POST',
        body: formData,
      });
      toast.success('Photo mise a jour.');
      loadDetails();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Etes-vous sur de vouloir supprimer cette personne ?')) {
      return;
    }

    try {
      await apiRequestVoid(`/persons/${id}`, { method: 'DELETE' });
      toast.success('Personne supprimee.');
      navigate('/');
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const handleAddParent = async () => {
    if (!selectedParent || !id) {
      return;
    }

    try {
      await apiRequestData('/relationships', {
        method: 'POST',
        body: jsonBody({
          parentId: selectedParent,
          childId: id,
          relationshipType: 'biological',
        }),
      });
      setSelectedParent('');
      setShowAddParent(false);
      toast.success('Parent ajoute.');
      loadDetails();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const handleAddUnion = async () => {
    if (!selectedPartner || !id) {
      return;
    }

    try {
      await apiRequestData('/unions', {
        method: 'POST',
        body: jsonBody({
          person1Id: id,
          person2Id: selectedPartner,
          unionType: 'marriage',
          status: 'active',
        }),
      });
      setSelectedPartner('');
      setShowAddUnion(false);
      toast.success('Union creee.');
      loadDetails();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  if (loading) {
    return <PageLoader fullHeight message="Chargement du profil..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadDetails} />;
  }

  if (!person) {
    return <PageError fullHeight title="Personne non trouvee" message="Cette fiche n'existe pas ou plus." onRetry={loadDetails} />;
  }

  const overviewChips = [
    person.gender === 'male' ? 'Homme' : person.gender === 'female' ? 'Femme' : person.gender || null,
    person.age !== undefined ? `${person.age} ans` : null,
    person.birthPlace || null,
    person.profession || null,
    person.residencePlace ? `Residence: ${person.residencePlace}` : null,
  ].filter(Boolean);

  const infoItems = [
    { label: 'Date de naissance', value: formatDisplayDate(person.birthDate) },
    { label: 'Lieu de naissance', value: person.birthPlace || 'Non renseigne' },
    { label: 'Lieu de residence', value: person.residencePlace || 'Non renseigne' },
    { label: 'Profession', value: person.profession || 'Non renseignee' },
  ];

  const familyStats = [
    { label: 'Parents', value: person.parents?.length || 0 },
    { label: 'Enfants', value: person.children?.length || 0 },
    { label: 'Unions', value: person.unions?.length || 0 },
  ];

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: 'Liste', path: '/list' },
            { label: `${person.firstName} ${person.lastName}` },
          ]}
        />

        {actionError && <InlineError message={actionError} />}

        <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="app-panel-strong p-8 sm:p-10">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="flex flex-col items-start gap-5">
                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-[36px] border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-4xl font-semibold text-[var(--color-accent)] shadow-[var(--shadow-card)]">
                  {person.profilePhotoUrl ? (
                    <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
                  ) : (
                    getPersonInitials(person)
                  )}
                </div>
                <div className="grid w-full grid-cols-3 gap-3">
                  {familyStats.map((item) => (
                    <div key={item.label} className="app-panel-muted px-4 py-4 text-center">
                      <div className="text-2xl font-semibold text-[var(--color-text)]">{item.value}</div>
                      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="app-kicker mb-3">Fiche familiale</p>
                <h1 className="font-display text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                  {person.firstName} {person.lastName}
                </h1>
                <p className="mt-3 text-base text-[var(--color-muted)]">{formatDisplayDate(person.birthDate)}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {overviewChips.map((chip) => (
                    <span key={chip} className="app-chip-neutral">
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {infoItems.map((item) => (
                    <div key={item.label} className="app-panel-muted p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">{item.label}</div>
                      <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Biographie</div>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                    {person.biography || 'Aucun recit biographique n est encore renseigne pour cette fiche.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Actions</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Edition rapide</h2>
              <div className="mt-6 flex flex-col gap-3">
                <Link to={`/person/${id}/edit`} className="app-button-primary">
                  Modifier la fiche
                </Link>
                <Link to={`/person/${id}/gallery`} className="app-button-secondary">
                  Ouvrir la galerie
                </Link>
                <button type="button" onClick={handleDelete} className="app-button-danger">
                  Supprimer la fiche
                </button>
              </div>
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Portrait</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Media principal</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Ajoutez une image pour rendre la fiche plus identifiable dans l arbre et la recherche.
              </p>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="person-photo-upload" disabled={uploading} />
              <label htmlFor="person-photo-upload" className="app-button-secondary mt-6 cursor-pointer">
                {uploading ? 'Import en cours...' : 'Changer la photo'}
              </label>
              <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">JPG, PNG ou GIF · max 5 MB</p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.95fr_0.95fr]">
          <div className="space-y-6">
            <EventsPanel personId={id!} />
          </div>

          <div className="space-y-6">
            <div className="app-panel p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="app-kicker mb-2">Ascendance</p>
                  <h2 className="font-display text-3xl text-[var(--color-text)]">Parents</h2>
                </div>
                <button type="button" onClick={() => setShowAddParent((previous) => !previous)} className="app-button-secondary">
                  {showAddParent ? 'Fermer' : 'Ajouter'}
                </button>
              </div>

              {showAddParent && (
                <div className="app-panel-muted mb-4 space-y-3 p-4">
                  <select className="app-select" value={selectedParent} onChange={(event) => setSelectedParent(event.target.value)}>
                    <option value="">Selectionner un parent</option>
                    {persons.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.firstName} {parent.lastName}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddParent} className="app-button-primary w-fit">
                    Confirmer le lien
                  </button>
                </div>
              )}

              {person.parents?.length > 0 ? (
                <div className="space-y-3">
                  {person.parents.map((parent: any) => (
                    <Link key={parent.id} to={`/person/${parent.id}`} className="app-panel-muted block p-4 transition-transform hover:-translate-y-0.5">
                      <div className="text-lg font-semibold text-[var(--color-text)]">
                        {parent.firstName} {parent.lastName}
                      </div>
                      <div className="mt-1 text-sm text-[var(--color-muted)]">{parent.relationshipType || 'Lien familial'}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-muted)]">
                  Aucun parent renseigne.
                </div>
              )}
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Descendance</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Enfants</h2>

              {person.children?.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {person.children.map((child: any) => (
                    <Link key={child.id} to={`/person/${child.id}`} className="app-panel-muted block p-4 transition-transform hover:-translate-y-0.5">
                      <div className="text-lg font-semibold text-[var(--color-text)]">
                        {child.firstName} {child.lastName}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-muted)]">
                  Aucun enfant relie a cette fiche.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="app-panel p-6 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="app-kicker mb-2">Alliance</p>
                  <h2 className="font-display text-3xl text-[var(--color-text)]">Unions</h2>
                </div>
                <button type="button" onClick={() => setShowAddUnion((previous) => !previous)} className="app-button-secondary">
                  {showAddUnion ? 'Fermer' : 'Ajouter'}
                </button>
              </div>

              {showAddUnion && (
                <div className="app-panel-muted mb-4 space-y-3 p-4">
                  <select className="app-select" value={selectedPartner} onChange={(event) => setSelectedPartner(event.target.value)}>
                    <option value="">Selectionner un partenaire</option>
                    {persons.map((partner) => (
                      <option key={partner.id} value={partner.id}>
                        {partner.firstName} {partner.lastName}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={handleAddUnion} className="app-button-primary w-fit">
                    Creer l'union
                  </button>
                </div>
              )}

              {person.unions?.length > 0 ? (
                <div className="space-y-3">
                  {person.unions.map((union: any) => (
                    <div key={union.id} className="app-panel-muted p-4">
                      <Link to={`/person/${union.partner.id}`} className="text-lg font-semibold text-[var(--color-text)]">
                        {union.partner.firstName} {union.partner.lastName}
                      </Link>
                      <div className="mt-1 text-sm text-[var(--color-muted)]">
                        {union.unionType || 'union'} · {union.status || 'active'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-muted)]">
                  Aucune union renseignee.
                </div>
              )}
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Galerie</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Documents visuels</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Centralisez les portraits, souvenirs et pieces iconographiques relies a cette personne.
              </p>
              <Link to={`/person/${id}/gallery`} className="app-button-secondary mt-6">
                Voir la galerie complete
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
