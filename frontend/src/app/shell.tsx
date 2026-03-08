import React from 'react';
import {
  Activity,
  BarChart3,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  List,
  LogOut,
  Map,
  MoonStar,
  Network,
  Plus,
  Search,
  SunMedium,
  UserCircle2,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { apiGetData, buildMediaUrl } from '../services/api';
import { useAuth } from './auth';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/list', label: 'Liste', icon: List },
  { path: '/tree', label: 'Arbre', icon: Network },
  { path: '/reports', label: 'Rapports', icon: BarChart3 },
  { path: '/timeline', label: 'Timeline', icon: Clock3 },
  { path: '/stats', label: 'Stats', icon: Activity },
  { path: '/map', label: 'Carte', icon: Map },
];

const getUserLabel = (user: { firstName?: string | null; lastName?: string | null; email: string }) => {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
};

const getPersonInitials = (person: { firstName?: string; lastName?: string }) =>
  [person.firstName, person.lastName]
    .filter(Boolean)
    .map((value) => value![0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'PF';

function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    if (query.length <= 1) {
      setResults([]);
      return;
    }

    let active = true;

    apiGetData<any>(`/persons?search=${encodeURIComponent(query)}`)
      .then((data) => {
        if (active) {
          setResults(data.persons.slice(0, 5));
        }
      })
      .catch(() => {
        if (active) {
          setResults([]);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-stone-950/55 px-4 pt-10 backdrop-blur-md" onClick={onClose}>
      <div className="app-panel w-full max-w-3xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-[var(--color-line)] px-6 py-5 sm:px-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="app-kicker mb-2">Recherche rapide</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Trouver une fiche instantanement</h2>
            </div>
            <button type="button" onClick={onClose} className="app-button-ghost px-4 py-2 text-xs uppercase tracking-[0.2em]">
              Fermer
            </button>
          </div>
          <div className="app-panel-muted flex items-center gap-3 px-4 py-3">
            <Search className="h-5 w-5 text-[var(--color-accent)]" />
            <input
              type="text"
              placeholder="Rechercher une personne, une branche, un lieu..."
              className="w-full bg-transparent text-base text-[var(--color-text)] outline-none placeholder:text-[var(--color-muted)]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
            <span className="rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
              Ctrl K
            </span>
          </div>
        </div>

        <div className="max-h-[24rem] overflow-y-auto px-4 py-4 sm:px-6">
          {query.length <= 1 && (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
              Tapez au moins deux lettres pour afficher des resultats.
            </div>
          )}

          {results.map((person) => (
            <button
              key={person.id}
              type="button"
              className="mb-3 flex w-full items-center gap-4 rounded-[24px] border border-transparent px-4 py-4 text-left transition-all hover:border-[var(--color-line)] hover:bg-white/40 dark:hover:bg-white/5"
              onClick={() => {
                navigate(`/person/${person.id}`);
                onClose();
              }}
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
                <div className="mt-1 text-sm text-[var(--color-muted)]">
                  {person.birthDate ? new Date(person.birthDate).getFullYear() : 'Date inconnue'}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[var(--color-muted)]" />
            </button>
          ))}

          {query.length > 1 && results.length === 0 && (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
              Aucun resultat pour cette recherche.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setSearchOpen(true);
      }

      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActiveLink = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return location.pathname.startsWith(path);
  };

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[rgba(243,235,223,0.72)] backdrop-blur-xl dark:bg-[rgba(19,17,15,0.76)]">
        <div className="app-shell py-4">
          <div className="app-panel px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 xl:flex-row xl:items-center">
                <div className="min-w-0 xl:min-w-[250px]">
                  <Link to="/" className="inline-flex flex-col">
                    <span className="app-kicker mb-1">Archive familiale</span>
                    <span className="font-display text-[1.9rem] leading-none text-[var(--color-text)]">Arbre genealogique</span>
                  </Link>
                </div>

                <div className="flex flex-1 gap-2 overflow-x-auto pb-1 xl:pb-0">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveLink(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                          active
                            ? 'bg-[var(--color-accent)] text-[#fbf3ea] shadow-[0_14px_28px_rgba(30,75,66,0.22)]'
                            : 'border border-transparent text-[var(--color-muted)] hover:border-[var(--color-line)] hover:bg-white/30 hover:text-[var(--color-text)] dark:hover:bg-white/5'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3">
                {user && (
                  <div className="app-panel-muted hidden items-center gap-3 px-3 py-2 sm:flex">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                      <UserCircle2 className="h-5 w-5" />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-semibold text-[var(--color-text)]">{getUserLabel(user)}</div>
                      <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">{user.role}</div>
                    </div>
                  </div>
                )}

                <button type="button" onClick={() => setSearchOpen(true)} className="app-button-ghost gap-2 px-4 py-2.5">
                  <Search className="h-4 w-4" />
                  <span>Recherche</span>
                  <span className="rounded-full border border-[var(--color-line)] px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Ctrl K
                  </span>
                </button>

                <button type="button" onClick={toggleTheme} className="app-button-ghost px-3 py-2.5" title="Changer le theme">
                  {theme === 'light' ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
                </button>

                {user ? (
                  <>
                    <Link to="/person/new" className="app-button-primary gap-2 px-5 py-2.5">
                      <Plus className="h-4 w-4" />
                      <span>Nouvelle fiche</span>
                    </Link>
                    <button type="button" onClick={handleLogout} className="app-button-danger gap-2 px-4 py-2.5">
                      <LogOut className="h-4 w-4" />
                      <span>Deconnexion</span>
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="app-button-primary px-5 py-2.5">
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
      <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="app-panel px-3 py-3">
          <div className="grid grid-cols-5 items-center gap-2">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = isActiveLink(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[0.68rem] font-medium transition-all ${
                    active
                      ? 'bg-[var(--color-accent)] text-[#fbf3ea]'
                      : 'text-[var(--color-muted)] hover:bg-white/30 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center gap-1 rounded-[18px] bg-[var(--color-accent)] px-2 py-2 text-[0.68rem] font-medium text-[#fbf3ea]"
            >
              <Search className="h-4 w-4" />
              <span>Recherche</span>
            </button>
          </div>

          <Link to="/person/new" className="app-button-primary mt-3 w-full gap-2">
            <Plus className="h-4 w-4" />
            <span>Nouvelle fiche</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export function Breadcrumb({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-[var(--color-muted)]">
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          {index > 0 && <ChevronRight className="h-4 w-4 opacity-60" />}
          {item.path ? (
            <Link to={item.path} className="transition-colors hover:text-[var(--color-accent)]">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[var(--color-text)]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
