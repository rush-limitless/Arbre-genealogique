// @ts-nocheck
import React from 'react';
import { HeartHandshake, Search, Sparkles, UserRound, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PersonList } from '../components/PersonList';
import { TreeView } from '../components/TreeView';
import { HierarchicalTree } from '../components/HierarchicalTree';
import { CompactTree } from '../components/CompactTree';
import { ChronologicalTree } from '../components/ChronologicalTree';
import { InteractiveTree } from '../components/InteractiveTree';
import { CircularTree } from '../components/CircularTree';
import { HierarchicalList } from '../components/HierarchicalList';
import { MultiSpouseTree } from '../components/MultiSpouseTree';
import { PageError, PageLoader } from '../components/PageState';
import type { PaginatedResponse } from '../types';
import { apiGetData, buildMediaUrl } from '../services/api';
import { downloadGEDCOM, exportToCSV, exportToJSON } from '../utils/export';
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

function FamilyPhotosMarquee({ persons }: { persons: any[] }) {
  const portraits = persons.filter((person) => person.profilePhotoUrl).slice(0, 12);

  if (portraits.length === 0) {
    return (
      <section className="mt-6 app-panel p-6 sm:p-7">
        <p className="app-kicker mb-2">Galerie familiale</p>
        <h2 className="font-display text-3xl text-[var(--color-text)]">Photos en mouvement</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          Ajoutez des portraits aux fiches pour faire vivre cette bande photo sur le dashboard.
        </p>
      </section>
    );
  }

  const scrollingPortraits = portraits.length > 1 ? [...portraits, ...portraits] : portraits;

  return (
    <section className="mt-6 app-panel overflow-hidden">
      <div className="border-b border-[var(--color-line)] px-6 py-6 sm:px-7">
        <p className="app-kicker mb-2">Galerie familiale</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Photos de famille qui defilent</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
              Une bande vivante des portraits disponibles. Survolez pour ralentir la lecture et ouvrir une fiche.
            </p>
          </div>
          <div className="app-chip-neutral w-fit">{portraits.length} portraits actifs</div>
        </div>
      </div>

      <div className="family-marquee px-4 py-5 sm:px-5 sm:py-6">
        <div className="family-marquee-track">
          {scrollingPortraits.map((person, index) => (
            <Link
              key={`${person.id}-${index}`}
              to={`/person/${person.id}`}
              className="family-marquee-card group"
              aria-label={`Ouvrir la fiche de ${person.firstName} ${person.lastName}`}
            >
              <img src={buildMediaUrl(person.profilePhotoUrl)} alt={`${person.firstName} ${person.lastName}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 via-stone-950/30 to-transparent px-4 pb-4 pt-10 text-stone-50">
                <div className="truncate text-base font-semibold">
                  {person.firstName} {person.lastName}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-200/85">
                  {person.birthDate ? new Date(person.birthDate).getFullYear() : 'Date inconnue'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [recent, setRecent] = React.useState<any[]>([]);
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPersons = await loadPersons();
      setPersons(nextPersons);

      const currentYear = new Date().getFullYear();
      const generations = new Set(
        nextPersons.map((person: any) => {
          const year = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
          return year ? Math.floor((currentYear - year) / 25) : 0;
        })
      );

      const today = new Date();
      const birthdays = nextPersons.filter((person: any) => {
        if (!person.birthDate) {
          return false;
        }

        const birthDate = new Date(person.birthDate);
        return birthDate.getMonth() === today.getMonth();
      });

      setStats({
        total: nextPersons.length,
        generations: generations.size,
        birthdays: birthdays.length,
        withPhotos: nextPersons.filter((person: any) => person.profilePhotoUrl).length,
      });
      setRecent(nextPersons.slice(0, 5));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleExport = (type: 'gedcom' | 'csv' | 'json') => {
    if (type === 'gedcom') {
      downloadGEDCOM(persons);
      return;
    }

    if (type === 'csv') {
      exportToCSV(persons);
      return;
    }

    exportToJSON(persons);
  };

  if (loading) {
    return <PageLoader fullHeight message="Chargement du dashboard..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadDashboard} />;
  }

  const featuredPerson = recent[0] || persons[0] || null;
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date());
  const biographies = persons.filter((person: any) => person.biography).length;
  const photoCoverage = stats.total ? Math.round((stats.withPhotos / stats.total) * 100) : 0;
  const biographyCoverage = stats.total ? Math.round((biographies / stats.total) * 100) : 0;
  const statCards = [
    {
      label: 'Personnes',
      value: stats.total,
      note: `${biographies} fiches enrichies`,
    },
    {
      label: 'Generations',
      value: stats.generations,
      note: 'lecture transgenerationnelle',
    },
    {
      label: `Anniversaires en ${monthLabel}`,
      value: stats.birthdays,
      note: 'personnes a celebrer ce mois-ci',
    },
    {
      label: 'Portraits',
      value: `${photoCoverage}%`,
      note: `${stats.withPhotos} profils avec photo`,
    },
  ];

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />

        <section className="grid gap-6 xl:grid-cols-[1.75fr_1fr]">
          <div className="app-panel-strong p-8 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-end">
              <div>
                <p className="app-kicker mb-3">Vue d'ensemble</p>
                <h1 className="font-display max-w-3xl text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                  Une archive familiale qui se lit comme un album vivant.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                  Le tableau de bord met en avant les profils les plus recents, la densite documentaire et les actions
                  qui comptent pour enrichir votre arbre sans surcharge visuelle.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/tree" className="app-button-primary">
                    Explorer l'arbre
                  </Link>
                  <Link to="/person/new" className="app-button-secondary">
                    Ajouter une nouvelle fiche
                  </Link>
                </div>
              </div>

              <div className="app-panel-muted p-5 sm:p-6">
                <p className="app-kicker mb-2">Portrait a la une</p>
                {featuredPerson ? (
                  <Link to={`/person/${featuredPerson.id}`} className="block">
                    <div className="mb-5 flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-lg font-semibold text-[var(--color-accent)]">
                        {featuredPerson.profilePhotoUrl ? (
                          <img src={buildMediaUrl(featuredPerson.profilePhotoUrl)} alt="" className="h-full w-full object-cover" />
                        ) : (
                          getPersonInitials(featuredPerson)
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-display text-3xl text-[var(--color-text)]">
                          {featuredPerson.firstName} {featuredPerson.lastName}
                        </div>
                        <div className="mt-1 text-sm text-[var(--color-muted)]">{formatDisplayDate(featuredPerson.birthDate)}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-[var(--color-muted)]">
                      <div>{featuredPerson.birthPlace || 'Lieu de naissance non renseigne'}</div>
                      <div>{featuredPerson.profession || 'Profession non renseignee'}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-4 py-8 text-sm text-[var(--color-muted)]">
                    Ajoutez une premiere personne pour commencer la collection familiale.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-3">Rythme du mois</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Focus {monthLabel}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {stats.birthdays > 0
                ? `${stats.birthdays} anniversaire${stats.birthdays > 1 ? 's' : ''} a preparer et ${photoCoverage}% des profils disposent deja d'un portrait.`
                : `Aucun anniversaire ce mois-ci. Le bon levier est d'augmenter la couverture photo, actuellement a ${photoCoverage}%.`}
            </p>
            <div className="mt-6 space-y-4">
              <div className="app-panel-muted p-4">
                <div className="text-sm font-semibold text-[var(--color-text)]">Couverture visuelle</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-accent)]">{photoCoverage}%</div>
              </div>
              <div className="app-panel-muted p-4">
                <div className="text-sm font-semibold text-[var(--color-text)]">Recit biographique</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-accent)]">{biographyCoverage}%</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="app-panel p-5 sm:p-6">
              <div className="app-kicker mb-3">{card.label}</div>
              <div className="text-4xl font-semibold text-[var(--color-text)]">{card.value}</div>
              <div className="mt-3 text-sm text-[var(--color-muted)]">{card.note}</div>
            </div>
          ))}
        </section>

        <FamilyPhotosMarquee persons={persons} />

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.95fr]">
          <div className="app-panel p-6 sm:p-7">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="app-kicker mb-2">Dernieres fiches</p>
                <h2 className="font-display text-3xl text-[var(--color-text)]">Ajouts recents</h2>
              </div>
              <Link to="/list" className="text-sm font-semibold text-[var(--color-accent)]">
                Voir toute la liste
              </Link>
            </div>

            <div className="space-y-3">
              {recent.map((person) => (
                <Link
                  key={person.id}
                  to={`/person/${person.id}`}
                  className="flex items-center gap-4 rounded-[24px] border border-transparent px-3 py-3 transition-all hover:border-[var(--color-line)] hover:bg-white/35 dark:hover:bg-white/5"
                >
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)]">
                    {person.profilePhotoUrl ? (
                      <img src={buildMediaUrl(person.profilePhotoUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      getPersonInitials(person)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-[var(--color-text)]">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted)]">{formatDisplayDate(person.birthDate)}</div>
                  </div>
                  <div className="hidden text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] sm:block">
                    {person.birthPlace || 'Sans lieu'}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Archive</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Exports propres</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Sortez vos donnees dans le bon format sans quitter l'interface principale.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={() => handleExport('gedcom')}
                  className="w-full rounded-[24px] border border-[var(--color-line)] px-5 py-4 text-left transition-all hover:bg-white/35 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-highlight)]">GEDCOM</div>
                  <div className="mt-2 text-base font-semibold text-[var(--color-text)]">Standard genealogique</div>
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full rounded-[24px] border border-[var(--color-line)] px-5 py-4 text-left transition-all hover:bg-white/35 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-highlight)]">CSV</div>
                  <div className="mt-2 text-base font-semibold text-[var(--color-text)]">Analyse dans Excel ou Sheets</div>
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="w-full rounded-[24px] border border-[var(--color-line)] px-5 py-4 text-left transition-all hover:bg-white/35 dark:hover:bg-white/5"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-highlight)]">JSON</div>
                  <div className="mt-2 text-base font-semibold text-[var(--color-text)]">Sauvegarde complete</div>
                </button>
              </div>
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Qualite editoriale</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Prochaine etape</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Priorite conseillee: completer les biographies manquantes et ajouter des portraits aux fiches clefs pour
                rendre la lecture de l'arbre plus humaine.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TreePage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [viewMode, setViewMode] = React.useState<string>(() => {
    return localStorage.getItem('treeViewMode') || 'hierarchical';
  });

  const loadTree = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPersons = await loadPersons();
      const personsWithRelations = await Promise.all(nextPersons.map((person: any) => loadPerson(person.id)));
      setPersons(personsWithRelations);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTree();
  }, [loadTree]);

  React.useEffect(() => {
    if (!persons.length) {
      return;
    }

    if (!selectedPersonId || !persons.some((person) => person.id === selectedPersonId)) {
      const rootPerson = persons.find((person) => !person.relations?.some((relation: any) => relation.type === 'PARENT'));
      setSelectedPersonId((rootPerson || persons[0]).id);
    }
  }, [persons, selectedPersonId]);

  const handleViewChange = (nextView: string) => {
    setViewMode(nextView);
    localStorage.setItem('treeViewMode', nextView);
  };

  const views = [
    { id: 'hierarchical', name: 'Hierarchique', icon: '01', component: HierarchicalTree },
    { id: 'compact', name: 'Compact', icon: '02', component: CompactTree },
    { id: 'chronological', name: 'Timeline', icon: '03', component: ChronologicalTree },
    { id: 'interactive', name: 'Interactif', icon: '04', component: InteractiveTree },
    { id: 'circular', name: 'Circulaire', icon: '05', component: CircularTree },
    { id: 'list', name: 'Liste', icon: '06', component: HierarchicalList },
    { id: 'multispouse', name: 'Multi-unions', icon: '07', component: MultiSpouseTree },
    { id: 'clusters', name: 'Clusters', icon: '08', component: TreeView },
  ];

  const currentView = views.find((view) => view.id === viewMode) || views[0];
  const ViewComponent = currentView.component;
  const selectedPerson = persons.find((person) => person.id === selectedPersonId) || null;
  const filteredPersons = searchQuery
    ? persons.filter((person) => `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
    : persons.slice(0, 8);
  const rootCount = persons.filter((person) => !person.relations?.some((relation: any) => relation.type === 'PARENT')).length;
  const descendantsCount = selectedPerson
    ? persons.filter((person) => person.relations?.some((relation: any) => relation.type === 'PARENT' && relation.relatedPersonId === selectedPerson.id)).length
    : 0;

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8">
        <section className="app-panel-strong p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
            <div>
              <p className="app-kicker mb-3">Workspace genealogique</p>
              <h1 className="font-display max-w-3xl text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                Explorer, focaliser, puis enrichir une branche sans quitter l'arbre.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                Le panneau lateral suit la personne active, propose les actions rapides et permet de lancer des
                creations contextuelles directement depuis la vue arbre.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="app-panel-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Fiches</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{persons.length}</div>
              </div>
              <div className="app-panel-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Racines</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{rootCount}</div>
              </div>
              <div className="app-panel-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Vue active</div>
                <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">{currentView.name}</div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <section className="app-panel overflow-hidden">
            <div className="border-b border-[var(--color-line)] px-6 py-5">
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="app-kicker mb-2">Visualisation</p>
                  <h2 className="font-display text-4xl text-[var(--color-text)]">Arbre genealogique</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="app-panel-muted flex items-center gap-3 px-4 py-3">
                    <Search className="h-4 w-4 text-[var(--color-accent)]" />
                    <input
                      type="text"
                      placeholder="Chercher une personne..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="w-full min-w-[180px] bg-transparent text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
                    />
                  </div>
                  <Link to="/person/new" className="app-button-primary">
                    Ajouter une fiche
                  </Link>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => handleViewChange(view.id)}
                    className={`inline-flex items-center gap-3 rounded-full px-4 py-2.5 whitespace-nowrap transition-all ${
                      viewMode === view.id
                        ? 'bg-[var(--color-accent)] text-[#fbf3ea] shadow-[0_14px_28px_rgba(30,75,66,0.22)]'
                        : 'border border-transparent text-[var(--color-muted)] hover:border-[var(--color-line)] hover:bg-white/35 hover:text-[var(--color-text)] dark:hover:bg-white/5'
                    }`}
                  >
                    <span className="rounded-full border border-current/15 px-2 py-1 text-[0.65rem] uppercase tracking-[0.2em]">
                      {view.icon}
                    </span>
                    <span className="text-sm font-medium">{view.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[70vh] min-h-[620px] overflow-hidden">
              {loading ? (
                <PageLoader message="Chargement de l'arbre..." />
              ) : error ? (
                <PageError message={error} onRetry={loadTree} />
              ) : persons.length === 0 ? (
                <div className="flex h-full items-center justify-center px-6">
                  <div className="app-panel-muted max-w-md px-8 py-10 text-center">
                    <p className="app-kicker mb-2">Demarrage</p>
                    <p className="font-display text-3xl text-[var(--color-text)]">Aucune personne</p>
                    <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                      Creez votre premiere fiche pour generer les branches et visualisations.
                    </p>
                    <Link to="/person/new" className="app-button-primary mt-6">
                      Commencer
                    </Link>
                  </div>
                </div>
              ) : (
                <ViewComponent
                  persons={persons}
                  focusedPersonId={selectedPersonId}
                  onSelectPerson={(person: any) => setSelectedPersonId(person.id)}
                />
              )}
            </div>
          </section>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Focus</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Panneau contextuel</h2>

              {selectedPerson ? (
                <div className="mt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-lg font-semibold text-[var(--color-accent)]">
                      {getPersonInitials(selectedPerson)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xl font-semibold text-[var(--color-text)]">
                        {selectedPerson.firstName} {selectedPerson.lastName}
                      </div>
                      <div className="mt-1 text-sm text-[var(--color-muted)]">{formatDisplayDate(selectedPerson.birthDate)}</div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="app-panel-muted p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Descendance</div>
                      <div className="mt-2 text-2xl font-semibold text-[var(--color-text)]">{descendantsCount}</div>
                    </div>
                    <div className="app-panel-muted p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Genre</div>
                      <div className="mt-2 text-base font-semibold text-[var(--color-text)]">
                        {selectedPerson.gender || 'Non renseigne'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 text-sm text-[var(--color-muted)]">
                    <div>{selectedPerson.birthPlace || 'Lieu de naissance non renseigne'}</div>
                    <div>{selectedPerson.profession || 'Profession non renseignee'}</div>
                    <div>{selectedPerson.residencePlace || 'Residence non renseignee'}</div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <Link to={`/person/${selectedPerson.id}`} className="app-button-primary gap-2">
                      <UserRound className="h-4 w-4" />
                      Voir la fiche
                    </Link>
                    <Link to={`/person/${selectedPerson.id}/edit`} className="app-button-secondary gap-2">
                      <Sparkles className="h-4 w-4" />
                      Modifier
                    </Link>
                    <Link to={`/person/new?link=parent&childId=${selectedPerson.id}`} className="app-button-ghost gap-2">
                      <Users className="h-4 w-4" />
                      Ajouter un parent
                    </Link>
                    <Link to={`/person/new?link=child&parentId=${selectedPerson.id}`} className="app-button-ghost gap-2">
                      <UserRound className="h-4 w-4" />
                      Ajouter un enfant
                    </Link>
                    <Link to={`/person/new?link=partner&partnerId=${selectedPerson.id}`} className="app-button-ghost gap-2">
                      <HeartHandshake className="h-4 w-4" />
                      Ajouter une union
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-dashed border-[var(--color-line)] px-5 py-8 text-sm text-[var(--color-muted)]">
                  Selectionnez une personne dans l'arbre ou la recherche.
                </div>
              )}
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Recherche rapide</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Changer de focus</h2>
              <div className="mt-5 space-y-3">
                {filteredPersons.slice(0, 8).map((person) => (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => setSelectedPersonId(person.id)}
                    className={`flex w-full items-center gap-3 rounded-[22px] border px-4 py-3 text-left transition-all ${
                      selectedPersonId === person.id
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)]'
                        : 'border-[var(--color-line)] hover:bg-white/35 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)]">
                      {getPersonInitials(person)}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                        {person.firstName} {person.lastName}
                      </div>
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                        {person.birthDate ? new Date(person.birthDate).getFullYear() : 'Date inconnue'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {selectedPerson && (
          <div className="fixed bottom-4 left-4 right-4 z-30 xl:hidden">
            <div className="app-panel flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[var(--color-text)]">
                  {selectedPerson.firstName} {selectedPerson.lastName}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">Actions rapides</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/person/${selectedPerson.id}`} className="app-button-secondary px-4 py-2">
                  Voir
                </Link>
                <Link to={`/person/new?link=child&parentId=${selectedPerson.id}`} className="app-button-primary px-4 py-2">
                  Enfant
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ListPage() {
  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Liste des personnes' }]} />
        <div className="mb-6">
          <p className="app-kicker mb-2">Repertoire</p>
          <h1 className="font-display text-4xl text-[var(--color-text)]">Personnes</h1>
        </div>
        <PersonList />
      </main>
    </div>
  );
}

function ExportPage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadExportData = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setPersons(await loadPersons());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadExportData();
  }, [loadExportData]);

  const handleExport = (type: 'gedcom' | 'csv' | 'json') => {
    if (type === 'gedcom') {
      downloadGEDCOM(persons);
      return;
    }

    if (type === 'csv') {
      exportToCSV(persons);
      return;
    }

    exportToJSON(persons);
  };

  if (loading) {
    return <PageLoader fullHeight message="Preparation des exports..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadExportData} />;
  }

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Exports' }]} />
        <div className="mb-6">
          <p className="app-kicker mb-2">Transmission</p>
          <h1 className="font-display text-4xl text-[var(--color-text)]">Exporter les donnees</h1>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <button
            onClick={() => handleExport('gedcom')}
            className="app-panel p-6 text-left transition-transform hover:-translate-y-1"
          >
            <div className="app-kicker mb-3">GEDCOM</div>
            <div className="mb-2 text-2xl font-semibold text-[var(--color-text)]">Standard genealogique</div>
            <div className="text-sm text-[var(--color-muted)]">Compatible avec les outils metier.</div>
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="app-panel p-6 text-left transition-transform hover:-translate-y-1"
          >
            <div className="app-kicker mb-3">CSV</div>
            <div className="mb-2 text-2xl font-semibold text-[var(--color-text)]">Lecture tableur</div>
            <div className="text-sm text-[var(--color-muted)]">Pratique pour tri, audit et partage.</div>
          </button>
          <button
            onClick={() => handleExport('json')}
            className="app-panel p-6 text-left transition-transform hover:-translate-y-1"
          >
            <div className="app-kicker mb-3">JSON</div>
            <div className="mb-2 text-2xl font-semibold text-[var(--color-text)]">Sauvegarde complete</div>
            <div className="text-sm text-[var(--color-muted)]">Ideal pour backup ou migration technique.</div>
          </button>
        </div>
      </main>
    </div>
  );
}

export { Dashboard, TreePage, ListPage, ExportPage };
