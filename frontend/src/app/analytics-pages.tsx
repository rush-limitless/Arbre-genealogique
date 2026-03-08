// @ts-nocheck
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InlineError, PageError, PageLoader } from '../components/PageState';
import type { PaginatedResponse } from '../types';
import { apiGetData, buildMediaUrl } from '../services/api';
import { Breadcrumb, NavBar } from './shell';

const CHART_COLORS = {
  accent: '#1e4b42',
  highlight: '#b68455',
  soft: '#d8c2a7',
  stone: '#6e6257',
  rose: '#a05b73',
};

const chartTooltipStyle = {
  backgroundColor: 'rgba(25, 21, 18, 0.92)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '18px',
  color: '#f5ede3',
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
};

const loadPersons = async () => {
  const data = await apiGetData<PaginatedResponse<any>>('/persons');
  return data.persons || [];
};

function PageIntro({ kicker, title, description }: { kicker: string; title: string; description: string }) {
  return (
    <section className="app-panel-strong p-8 sm:p-10">
      <p className="app-kicker mb-3">{kicker}</p>
      <h1 className="font-display max-w-3xl text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">{description}</p>
    </section>
  );
}

function ReportsPage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState('');
  const [reportType, setReportType] = React.useState<'descendants' | 'ancestors'>('descendants');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reportError, setReportError] = React.useState<string | null>(null);

  const loadReportInputs = React.useCallback(async () => {
    setInitialLoading(true);
    setError(null);

    try {
      setPersons(await loadPersons());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReportInputs();
  }, [loadReportInputs]);

  const generateReport = async () => {
    if (!selectedPerson) {
      return;
    }

    setLoading(true);
    setReportError(null);

    try {
      const endpoint = reportType === 'descendants' ? `/persons/${selectedPerson}/descendants` : `/persons/${selectedPerson}/ancestors`;
      const data = await apiGetData<any[]>(endpoint);
      setResults(data || []);
    } catch (requestError) {
      setReportError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader fullHeight message="Chargement des rapports..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadReportInputs} />;
  }

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Rapports genealogiques' }]} />
        <PageIntro
          kicker="Analyse"
          title="Rapports genealogiques"
          description="Construisez une lecture claire des ascendances ou descendances a partir d'une personne de reference, sans quitter l'interface principale."
        />

        <section className="mt-6 app-panel p-6 sm:p-7">
          {reportError && <InlineError message={reportError} />}

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Personne de reference</div>
              <select value={selectedPerson} onChange={(event) => setSelectedPerson(event.target.value)} className="app-select">
                <option value="">Selectionner</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Type de rapport</div>
              <select value={reportType} onChange={(event) => setReportType(event.target.value as 'descendants' | 'ancestors')} className="app-select">
                <option value="descendants">Descendants</option>
                <option value="ancestors">Ancetres</option>
              </select>
            </label>

            <div className="flex items-end">
              <button onClick={generateReport} disabled={!selectedPerson || loading} className="app-button-primary min-w-[220px] disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? 'Generation...' : 'Generer le rapport'}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 app-panel p-6 sm:p-7">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="app-kicker mb-2">Resultat</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">
                {reportType === 'descendants' ? 'Lignee descendante' : 'Lignee ascendante'}
              </h2>
            </div>
            <div className="app-chip-neutral">{results.length} fiche{results.length > 1 ? 's' : ''}</div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
              Choisissez une personne puis generez un rapport.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((person, index) => (
                <Link
                  key={`${person.id}-${index}`}
                  to={`/person/${person.id}`}
                  className="flex items-center gap-4 rounded-[24px] border border-transparent px-4 py-4 transition-all hover:border-[var(--color-line)] hover:bg-white/35 dark:hover:bg-white/5"
                  style={{ marginLeft: `${person.generation * 12}px` }}
                >
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[var(--color-line)] bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-accent)]">
                    {person.profilePhotoUrl ? (
                      <img src={buildMediaUrl(person.profilePhotoUrl)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-[var(--color-text)]">
                      {person.firstName} {person.lastName}
                    </div>
                    <div className="mt-1 text-sm text-[var(--color-muted)]">
                      Generation {person.generation} · {person.birthDate ? new Date(person.birthDate).getFullYear() : 'Date inconnue'}
                      {person.age ? ` · ${person.age} ans` : ''}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function MapPage() {
  const [locations, setLocations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadMap = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const persons = await loadPersons();
      const nextLocations = persons
        .filter((person: any) => person.residencePlace)
        .reduce((accumulator: any[], person: any) => {
          const existing = accumulator.find((entry) => entry.place === person.residencePlace);
          if (existing) {
            existing.persons.push(person);
          } else {
            accumulator.push({ place: person.residencePlace, persons: [person] });
          }
          return accumulator;
        }, []);
      setLocations(nextLocations);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMap();
  }, [loadMap]);

  if (loading) {
    return <PageLoader fullHeight message="Chargement de la carte..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadMap} />;
  }

  const totalPersons = locations.reduce((sum, location) => sum + location.persons.length, 0);

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Carte familiale' }]} />
        <PageIntro
          kicker="Territoire"
          title="Carte des lieux de vie"
          description="Visualisez la dispersion geographique des familles et les points de concentration de votre archive."
        />

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.3fr]">
          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-2">Synthese</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Repere global</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="app-panel-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Lieux distincts</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{locations.length}</div>
              </div>
              <div className="app-panel-muted p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Personnes geolocalisees</div>
                <div className="mt-2 text-3xl font-semibold text-[var(--color-text)]">{totalPersons}</div>
              </div>
            </div>
          </div>

          <div className="app-panel p-6 sm:p-7">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {locations.map((location, index) => (
                <div key={`${location.place}-${index}`} className="app-panel-muted p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-highlight)]">Lieu</div>
                  <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">{location.place}</div>
                  <div className="mt-1 text-sm text-[var(--color-muted)]">
                    {location.persons.length} personne{location.persons.length > 1 ? 's' : ''}
                  </div>
                  <div className="mt-4 space-y-2">
                    {location.persons.slice(0, 4).map((person: any) => (
                      <Link key={person.id} to={`/person/${person.id}`} className="block text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-strong)]">
                        {person.firstName} {person.lastName}
                      </Link>
                    ))}
                    {location.persons.length > 4 && (
                      <div className="text-sm text-[var(--color-muted)]">+{location.persons.length - 4} autre{location.persons.length - 4 > 1 ? 's' : ''}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatsPage() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadStats = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const persons = await loadPersons();
      const ages = persons
        .filter((person: any) => person.birthDate && !person.deathDate)
        .map((person: any) => new Date().getFullYear() - new Date(person.birthDate).getFullYear());
      const avgAge = ages.length > 0 ? Math.round(ages.reduce((left: number, right: number) => left + right, 0) / ages.length) : 0;

      const genders = persons.reduce((accumulator: any, person: any) => {
        accumulator[person.gender] = (accumulator[person.gender] || 0) + 1;
        return accumulator;
      }, {});

      const places = persons
        .filter((person: any) => person.birthPlace)
        .reduce((accumulator: any, person: any) => {
          accumulator[person.birthPlace] = (accumulator[person.birthPlace] || 0) + 1;
          return accumulator;
        }, {});
      const topPlaces = Object.entries(places).sort((left: any, right: any) => right[1] - left[1]).slice(0, 5);

      const professions = persons
        .filter((person: any) => person.profession)
        .reduce((accumulator: any, person: any) => {
          accumulator[person.profession] = (accumulator[person.profession] || 0) + 1;
          return accumulator;
        }, {});
      const topProfessions = Object.entries(professions).sort((left: any, right: any) => right[1] - left[1]).slice(0, 5);

      const decades = persons
        .filter((person: any) => person.birthDate)
        .reduce((accumulator: any, person: any) => {
          const decade = Math.floor(new Date(person.birthDate).getFullYear() / 10) * 10;
          accumulator[decade] = (accumulator[decade] || 0) + 1;
          return accumulator;
        }, {});

      const decadesData = Object.entries(decades)
        .sort()
        .map(([decade, count]) => ({
          decade: `${decade}s`,
          naissances: count,
        }));

      const genderData = [
        { name: 'Hommes', value: genders.male || 0, fill: CHART_COLORS.accent },
        { name: 'Femmes', value: genders.female || 0, fill: CHART_COLORS.rose },
      ];

      setStats({
        total: persons.length,
        avgAge,
        genders,
        topPlaces,
        topProfessions,
        decadesData,
        genderData,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return <PageLoader fullHeight message="Calcul des statistiques..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadStats} />;
  }

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Statistiques' }]} />
        <PageIntro
          kicker="Mesure"
          title="Statistiques de l'archive"
          description="Observez la structure globale de votre base familiale, ses concentrations, ses rythmes et ses zones de richesse documentaire."
        />

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="app-panel p-6 sm:p-7">
            <div className="app-kicker mb-2">Personnes</div>
            <div className="text-4xl font-semibold text-[var(--color-text)]">{stats.total}</div>
            <div className="mt-2 text-sm text-[var(--color-muted)]">fiches totales</div>
          </div>
          <div className="app-panel p-6 sm:p-7">
            <div className="app-kicker mb-2">Age moyen</div>
            <div className="text-4xl font-semibold text-[var(--color-text)]">{stats.avgAge}</div>
            <div className="mt-2 text-sm text-[var(--color-muted)]">personnes vivantes</div>
          </div>
          <div className="app-panel p-6 sm:p-7">
            <div className="app-kicker mb-2">Repartition</div>
            <div className="text-2xl font-semibold text-[var(--color-text)]">
              {stats.genders.male || 0} M · {stats.genders.female || 0} F
            </div>
            <div className="mt-2 text-sm text-[var(--color-muted)]">genre renseigne</div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-2">Chronologie</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Naissances par decennie</h2>
            <div className="mt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.decadesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(110,98,87,0.22)" />
                  <XAxis dataKey="decade" stroke={CHART_COLORS.stone} />
                  <YAxis stroke={CHART_COLORS.stone} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="naissances" fill={CHART_COLORS.accent} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-2">Equilibre</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Repartition par genre</h2>
            <div className="mt-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.genderData} cx="50%" cy="50%" outerRadius={104} innerRadius={56} dataKey="value">
                    {stats.genderData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-2">Topographie</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Lieux de naissance</h2>
            <div className="mt-6 space-y-4">
              {stats.topPlaces.map(([place, count]: any, index: number) => (
                <div key={`${place}-${index}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{place}</span>
                    <span className="text-sm text-[var(--color-muted)]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-accent-soft)]">
                    <div className="h-2 rounded-full bg-[var(--color-accent)]" style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="app-panel p-6 sm:p-7">
            <p className="app-kicker mb-2">Activite</p>
            <h2 className="font-display text-3xl text-[var(--color-text)]">Professions les plus presentes</h2>
            <div className="mt-6 space-y-4">
              {stats.topProfessions.map(([profession, count]: any, index: number) => (
                <div key={`${profession}-${index}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{profession}</span>
                    <span className="text-sm text-[var(--color-muted)]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-accent-soft)]">
                    <div className="h-2 rounded-full bg-[var(--color-highlight)]" style={{ width: `${(count / stats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TimelinePage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadTimeline = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextEvents = await apiGetData<any[]>('/events');
      setEvents(nextEvents || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  const filtered = filter === 'all' ? events : events.filter((event) => event.eventType === filter);

  if (loading) {
    return <PageLoader fullHeight message="Chargement de la timeline..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadTimeline} />;
  }

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb items={[{ label: 'Timeline' }]} />
        <PageIntro
          kicker="Chronologie"
          title="Timeline familiale"
          description="Suivez les evenements majeurs, filtrez les periodes importantes et lisez l'histoire familiale comme une suite de jalons."
        />

        <section className="mt-6 app-panel p-6 sm:p-7">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="app-kicker mb-2">Filtre</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Evenements</h2>
            </div>
            <select value={filter} onChange={(event) => setFilter(event.target.value)} className="app-select max-w-[280px]">
              <option value="all">Tous les evenements</option>
              <option value="birth">Naissances</option>
              <option value="marriage">Mariages</option>
              <option value="death">Deces</option>
              <option value="education">Education</option>
              <option value="career">Carriere</option>
              <option value="other">Autres</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute bottom-0 left-5 top-0 w-px bg-[var(--color-line)]" />
            <div className="space-y-6">
              {filtered.map((event, index) => (
                <div key={`${event.id || event.title}-${index}`} className="relative pl-14">
                  <div className="absolute left-0 top-2 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-[var(--color-surface-strong)]">
                    <div className="h-3 w-3 rounded-full bg-[var(--color-accent)]" />
                  </div>
                  <div className="app-panel-muted p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link to={`/person/${event.person.id}`} className="text-base font-semibold text-[var(--color-accent)]">
                          {event.person.firstName} {event.person.lastName}
                        </Link>
                        <div className="mt-1 text-sm text-[var(--color-muted)]">{new Date(event.eventDate).toLocaleDateString('fr-FR')}</div>
                      </div>
                      <span className="app-chip-neutral w-fit">{event.eventType}</span>
                    </div>
                    <div className="mt-4 text-base font-semibold text-[var(--color-text)]">{event.title}</div>
                    {event.description && <div className="mt-2 text-sm leading-7 text-[var(--color-muted)]">{event.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export { ReportsPage, MapPage, StatsPage, TimelinePage };
