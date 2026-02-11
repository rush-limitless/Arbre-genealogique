// Complete App with all features
// @ts-nocheck

import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, type Node, type Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { PersonList } from './components/PersonList';
import { ToastContainer } from './components/Toast';
import { FamilyTree } from './components/FamilyTree';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Auth Context
const AuthContext = React.createContext<any>(null);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:3000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) setUser(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      return true;
    }
    return false;
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setUser(data.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => React.useContext(AuthContext);

// Theme Hook
const useTheme = () => {
  const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
};

// Export utilities
const exportToGEDCOM = (persons: any[]) => {
  let gedcom = '0 HEAD\n1 SOUR Arbre Généalogique\n1 GEDC\n2 VERS 5.5.1\n1 CHAR UTF-8\n';
  persons.forEach((person, index) => {
    const id = `@I${index + 1}@`;
    gedcom += `0 ${id} INDI\n1 NAME ${person.firstName} /${person.lastName}/\n`;
    gedcom += `2 GIVN ${person.firstName}\n2 SURN ${person.lastName}\n`;
    gedcom += `1 SEX ${person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : 'U'}\n`;
    if (person.birthDate) {
      gedcom += `1 BIRT\n2 DATE ${new Date(person.birthDate).toLocaleDateString('en-GB')}\n`;
      if (person.birthPlace) gedcom += `2 PLAC ${person.birthPlace}\n`;
    }
    if (person.profession) gedcom += `1 OCCU ${person.profession}\n`;
  });
  gedcom += '0 TRLR\n';
  return gedcom;
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const exportToCSV = (persons: any[]) => {
  const headers = ['Prénom', 'Nom', 'Sexe', 'Date de naissance', 'Lieu', 'Profession'];
  const rows = persons.map(p => [
    p.firstName, p.lastName, p.gender,
    p.birthDate ? new Date(p.birthDate).toLocaleDateString('fr-FR') : '',
    p.birthPlace || '', p.profession || ''
  ]);
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  downloadFile(csv, `arbre-${Date.now()}.csv`, 'text/csv');
};

// Global Search Modal
function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (query.length > 1) {
      fetch(`http://localhost:3000/api/persons?search=${query}`)
        .then(r => r.json())
        .then(data => setResults(data.data.persons.slice(0, 5)));
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <input
          type="text"
          placeholder="Rechercher une personne... (Ctrl+K)"
          className="w-full px-6 py-4 text-lg border-b focus:outline-none"
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        <div className="max-h-96 overflow-y-auto">
          {results.map(person => (
            <div
              key={person.id}
              className="px-6 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
              onClick={() => {
                navigate(`/person/${person.id}`);
                onClose();
              }}
            >
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {person.profilePhotoUrl ? (
                  <img src={`http://localhost:3000${person.profilePhotoUrl}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <div>
                <div className="font-medium">{person.firstName} {person.lastName}</div>
                <div className="text-sm text-gray-500">{person.birthDate && new Date(person.birthDate).getFullYear()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Navigation Bar
function NavBar() {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = React.useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">🌳 Arbre Généalogique</Link>
              <Link to="/" className={`px-3 py-2 rounded ${location.pathname === '/' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                📊 Dashboard
              </Link>
              <Link to="/list" className={`px-3 py-2 rounded ${location.pathname === '/list' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                📋 Liste
              </Link>
              <Link to="/tree" className={`px-3 py-2 rounded ${location.pathname === '/tree' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                🌳 Arbre
              </Link>
              <Link to="/reports" className={`px-3 py-2 rounded ${location.pathname === '/reports' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                📈 Rapports
              </Link>
              <Link to="/timeline" className={`px-3 py-2 rounded ${location.pathname === '/timeline' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                ⏱️ Timeline
              </Link>
              <Link to="/stats" className={`px-3 py-2 rounded ${location.pathname === '/stats' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                📊 Stats
              </Link>
              <Link to="/map" className={`px-3 py-2 rounded ${location.pathname === '/map' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                🗺️ Carte
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  👤 {user.name} ({user.role})
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                title="Changer le thème"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setSearchOpen(true)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
              >
                🔍 Rechercher <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">Ctrl+K</span>
              </button>
              {user ? (
                <>
                  <Link to="/person/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    + Nouvelle personne
                  </Link>
                  <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

// Breadcrumb
function Breadcrumb({ items }: { items: { label: string; path?: string }[] }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span>/</span>}
          {item.path ? (
            <Link to={item.path} className="hover:text-blue-600">{item.label}</Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Dashboard
function Dashboard() {
  const [stats, setStats] = React.useState<any>(null);
  const [recent, setRecent] = React.useState<any[]>([]);
  const [persons, setPersons] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/persons')
      .then(r => r.json())
      .then(data => {
        const persons = data.data.persons;
        setPersons(persons);
        const generations = new Set(persons.map((p: any) => {
          const year = p.birthDate ? new Date(p.birthDate).getFullYear() : null;
          return year ? Math.floor((2026 - year) / 25) : 0;
        }));
        
        const today = new Date();
        const thisMonth = persons.filter((p: any) => {
          if (!p.birthDate) return false;
          const birth = new Date(p.birthDate);
          return birth.getMonth() === today.getMonth();
        });

        setStats({
          total: persons.length,
          generations: generations.size,
          birthdays: thisMonth.length,
          withPhotos: persons.filter((p: any) => p.profilePhotoUrl).length
        });
        setRecent(persons.slice(0, 5));
      });
  }, []);

  const handleExport = (type: 'gedcom' | 'csv' | 'json') => {
    if (type === 'gedcom') {
      const gedcom = exportToGEDCOM(persons);
      downloadFile(gedcom, `arbre-${Date.now()}.ged`, 'text/plain');
    } else if (type === 'csv') {
      exportToCSV(persons);
    } else {
      const json = JSON.stringify(persons, null, 2);
      downloadFile(json, `arbre-${Date.now()}.json`, 'application/json');
    }
  };

  if (!stats) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard' }]} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-gray-600 dark:text-gray-400">Personnes</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="text-3xl mb-2">🌳</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.generations}</div>
            <div className="text-gray-600 dark:text-gray-400">Générations</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="text-3xl mb-2">🎂</div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats.birthdays}</div>
            <div className="text-gray-600 dark:text-gray-400">Anniversaires ce mois</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <div className="text-3xl mb-2">📸</div>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{stats.withPhotos}</div>
            <div className="text-gray-600 dark:text-gray-400">Avec photos</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-white">🕐 Récemment ajoutés</h2>
            <div className="space-y-3">
              {recent.map(person => (
                <Link
                  key={person.id}
                  to={`/person/${person.id}`}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {person.profilePhotoUrl ? (
                      <img src={`http://localhost:3000${person.profilePhotoUrl}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">👤</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium dark:text-white">{person.firstName} {person.lastName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{person.birthDate && new Date(person.birthDate).toLocaleDateString('fr-FR')}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors">
            <h2 className="text-xl font-bold mb-4 dark:text-white">📥 Export</h2>
            <div className="space-y-3">
              <button onClick={() => handleExport('gedcom')} className="w-full p-4 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-lg text-left transition-colors">
                <div className="font-medium text-blue-700 dark:text-blue-300">📄 Export GEDCOM</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Format standard généalogie</div>
              </button>
              <button onClick={() => handleExport('csv')} className="w-full p-4 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg text-left transition-colors">
                <div className="font-medium text-green-700 dark:text-green-300">📊 Export CSV</div>
                <div className="text-sm text-green-600 dark:text-green-400">Pour Excel/Sheets</div>
              </button>
              <button onClick={() => handleExport('json')} className="w-full p-4 bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-lg text-left transition-colors">
                <div className="font-medium text-purple-700 dark:text-purple-300">💾 Export JSON</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Backup complet</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <div className="font-medium text-blue-900 dark:text-blue-100">Astuce</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Utilisez Ctrl+K pour rechercher rapidement, ou les raccourcis N/T/L pour naviguer. Cliquez sur 🌙/☀️ pour changer le thème.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// TreePage
// TreePage
function TreePage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPersonsWithRelations = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/persons');
        const data = await response.json();
        
        const personsWithRelations = await Promise.all(
          data.data.persons.map(async (p: any) => {
            const detailResponse = await fetch(`http://localhost:3000/api/persons/${p.id}`);
            const detailData = await detailResponse.json();
            return detailData.data;
          })
        );
        
        setPersons(personsWithRelations);
        setLoading(false);
      } catch (error) {
        console.error('Erreur chargement:', error);
        setLoading(false);
      }
    };
    
    loadPersonsWithRelations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Arbre' }]} />
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">🌳 Arbre Généalogique</h1>
          <Link
            to="/person/new"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
          >
            ➕ Ajouter une personne
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">Chargement de l'arbre...</p>
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="text-6xl mb-4">🌳</div>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Aucune personne dans l'arbre</p>
            <Link
              to="/person/new"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Commencer votre arbre généalogique
            </Link>
          </div>
        ) : (
          <FamilyTree persons={persons} />
        )}
      </main>
    </div>
  );
}
function ListPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Liste' }]} />
        <h1 className="text-3xl font-bold mb-6 dark:text-white">👥 Personnes</h1>
        <PersonList />
      </main>
    </div>
  );
}

function ExportPage() {
  const [persons, setPersons] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/persons')
      .then(r => r.json())
      .then(data => setPersons(data.data.persons));
  }, []);

  const handleExport = (type: 'gedcom' | 'csv' | 'json') => {
    if (type === 'gedcom') {
      const gedcom = exportToGEDCOM(persons);
      downloadFile(gedcom, `arbre-${Date.now()}.ged`, 'text/plain');
    } else if (type === 'csv') {
      exportToCSV(persons);
    } else {
      const json = JSON.stringify(persons, null, 2);
      downloadFile(json, `arbre-${Date.now()}.json`, 'application/json');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Export' }]} />
        <h1 className="text-3xl font-bold mb-6 dark:text-white">💾 Export</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button onClick={() => handleExport('gedcom')} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📄</div>
            <div className="font-bold text-lg mb-2 dark:text-white">GEDCOM</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Format standard généalogie</div>
          </button>
          <button onClick={() => handleExport('csv')} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-bold text-lg mb-2 dark:text-white">CSV</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pour Excel/Sheets</div>
          </button>
          <button onClick={() => handleExport('json')} className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">💾</div>
            <div className="font-bold text-lg mb-2 dark:text-white">JSON</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Backup complet</div>
          </button>
        </div>
      </main>
    </div>
  );
}

// CreatePage
function CreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    profession: '',
    biography: ''
  });
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<any>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };
    if (name === 'firstName' && !value) newErrors.firstName = 'Prénom requis';
    else if (name === 'firstName') delete newErrors.firstName;
    if (name === 'lastName' && !value) newErrors.lastName = 'Nom requis';
    else if (name === 'lastName') delete newErrors.lastName;
    if (name === 'gender' && !value) newErrors.gender = 'Genre requis';
    else if (name === 'gender') delete newErrors.gender;
    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.gender) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/persons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Personne créée avec succès !');
        navigate('/');
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      alert('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Liste', path: '/list' }, { label: 'Nouvelle personne' }]} />
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Ajouter une personne</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <input 
                  name="lastName"
                  type="text" 
                  className={`w-full px-3 py-2 border rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sexe *</label>
              <select 
                className={`w-full px-3 py-2 border rounded-lg ${errors.gender ? 'border-red-500' : ''}`}
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date de naissance</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Lieu de naissance</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-lg"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({...formData, birthPlace: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profession</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-lg"
                value={formData.profession}
                onChange={(e) => setFormData({...formData, profession: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Biographie</label>
              <textarea 
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                value={formData.biography}
                onChange={(e) => setFormData({...formData, biography: e.target.value})}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Link to="/" className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Annuler
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// EditPage
function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<any>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/api/persons/${id}`)
        .then(r => r.json())
        .then(data => {
          setFormData(data.data);
          setLoading(false);
        });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:3000/api/persons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      navigate(`/person/${id}`);
    } catch (error) {
      alert('Erreur lors de la modification');
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Liste', path: '/list' },
          { label: `${formData.firstName} ${formData.lastName}`, path: `/person/${id}` },
          { label: 'Éditer' }
        ]} />
        <h1 className="text-3xl font-bold mb-6 dark:text-white">✏️ Éditer {formData.firstName} {formData.lastName}</h1>
        
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Prénom *</label>
              <input
                name="firstName"
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.firstName || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Nom *</label>
              <input
                name="lastName"
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.lastName || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Sexe *</label>
            <select
              name="gender"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.gender || ''}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner...</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Date de naissance</label>
              <input
                name="birthDate"
                type="date"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.birthDate?.split('T')[0] || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Lieu de naissance</label>
              <input
                name="birthPlace"
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.birthPlace || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Date de décès</label>
              <input
                name="deathDate"
                type="date"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.deathDate?.split('T')[0] || ''}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-white">Lieu de décès</label>
              <input
                name="deathPlace"
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
                value={formData.deathPlace || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Profession</label>
            <input
              name="profession"
              type="text"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.profession || ''}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-white">Biographie</label>
            <textarea
              name="biography"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
              value={formData.biography || ''}
              onChange={handleChange}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              💾 Enregistrer
            </button>
            <button
              type="button"
              onClick={() => navigate(`/person/${id}`)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

// PersonDetailPage
function PersonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = React.useState<any>(null);
  const [persons, setPersons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddParent, setShowAddParent] = React.useState(false);
  const [showAddUnion, setShowAddUnion] = React.useState(false);
  const [selectedParent, setSelectedParent] = React.useState('');
  const [selectedPartner, setSelectedPartner] = React.useState('');
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      Promise.all([
        fetch(`http://localhost:3000/api/persons/${id}`).then(r => r.json()),
        fetch('http://localhost:3000/api/persons').then(r => r.json())
      ]).then(([personData, personsData]) => {
        setPerson(personData.data);
        setPersons(personsData.data.persons.filter((p: any) => p.id !== id));
        setLoading(false);
      });
    }
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('personId', id!);
    formData.append('title', 'Photo de profil');

    try {
      await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        body: formData
      });
      alert('Photo uploadée !');
      window.location.reload();
    } catch (error) {
      alert('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) return;
    
    try {
      await fetch(`http://localhost:3000/api/persons/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleAddParent = async () => {
    if (!selectedParent) return;
    
    try {
      await fetch('http://localhost:3000/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: selectedParent,
          childId: id,
          relationshipType: 'biological'
        })
      });
      alert('Parent ajouté !');
      window.location.reload();
    } catch (error) {
      alert('Erreur');
    }
  };

  const handleAddUnion = async () => {
    if (!selectedPartner) return;
    
    try {
      await fetch('http://localhost:3000/api/unions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person1Id: id,
          person2Id: selectedPartner,
          unionType: 'marriage',
          status: 'active'
        })
      });
      alert('Union créée !');
      window.location.reload();
    } catch (error) {
      alert('Erreur');
    }
  };

  if (loading) return <div className="text-center py-12">Chargement...</div>;
  if (!person) return <div className="text-center py-12">Personne non trouvée</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Liste', path: '/list' },
          { label: `${person.firstName} ${person.lastName}` }
        ]} />
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">
              {person.firstName} {person.lastName}
            </h1>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/person/${id}/edit`)} 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                ✏️ Éditer
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
        {/* Photo de profil */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Photo de profil</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {person.profilePhotoUrl ? (
                <img 
                  src={`http://localhost:3000${person.profilePhotoUrl}`} 
                  alt={person.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
              >
                {uploading ? 'Upload...' : 'Changer la photo'}
              </label>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG ou GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Informations</h2>
          <div className="grid grid-cols-2 gap-4">
            {person.birthDate && (
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">{new Date(person.birthDate).toLocaleDateString('fr-FR')}</p>
              </div>
            )}
            {person.birthPlace && (
              <div>
                <p className="text-sm text-gray-500">Lieu de naissance</p>
                <p className="font-medium">{person.birthPlace}</p>
              </div>
            )}
            {person.age !== undefined && (
              <div>
                <p className="text-sm text-gray-500">Âge</p>
                <p className="font-medium">{person.age} ans</p>
              </div>
            )}
            {person.profession && (
              <div>
                <p className="text-sm text-gray-500">Profession</p>
                <p className="font-medium">{person.profession}</p>
              </div>
            )}
          </div>
          {person.biography && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-1">Biographie</p>
              <p className="text-gray-700">{person.biography}</p>
            </div>
          )}
        </div>

        {/* Parents */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Parents</h2>
            <button 
              onClick={() => setShowAddParent(!showAddParent)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              + Ajouter
            </button>
          </div>
          
          {showAddParent && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <select 
                className="w-full px-3 py-2 border rounded mb-2"
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
              >
                <option value="">Sélectionner un parent</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              <button 
                onClick={handleAddParent}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmer
              </button>
            </div>
          )}

          {person.parents?.length > 0 ? (
            <div className="space-y-2">
              {person.parents.map((parent: any) => (
                <Link 
                  key={parent.id} 
                  to={`/person/${parent.id}`}
                  className="block p-2 hover:bg-gray-50 rounded"
                >
                  <span className="font-medium">{parent.firstName} {parent.lastName}</span>
                  <span className="text-sm text-gray-500 ml-2">({parent.relationshipType})</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun parent</p>
          )}
        </div>

        {/* Enfants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Enfants</h2>
          {person.children?.length > 0 ? (
            <div className="space-y-2">
              {person.children.map((child: any) => (
                <Link 
                  key={child.id} 
                  to={`/person/${child.id}`}
                  className="block p-2 hover:bg-gray-50 rounded"
                >
                  <span className="font-medium">{child.firstName} {child.lastName}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucun enfant</p>
          )}
        </div>

        {/* Unions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Unions</h2>
            <button 
              onClick={() => setShowAddUnion(!showAddUnion)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              + Ajouter
            </button>
          </div>

          {showAddUnion && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <select 
                className="w-full px-3 py-2 border rounded mb-2"
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)}
              >
                <option value="">Sélectionner un partenaire</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
              <button 
                onClick={handleAddUnion}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmer
              </button>
            </div>
          )}

          {person.unions?.length > 0 ? (
            <div className="space-y-2">
              {person.unions.map((union: any) => (
                <div key={union.id} className="p-2 hover:bg-gray-50 rounded">
                  <Link to={`/person/${union.partner.id}`} className="font-medium">
                    {union.partner.firstName} {union.partner.lastName}
                  </Link>
                  <p className="text-sm text-gray-500">{union.unionType} • {union.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Aucune union</p>
          )}
        </div>

        {/* Galerie */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">📸 Galerie</h2>
            <Link to={`/person/${id}/gallery`} className="text-blue-600 dark:text-blue-400 hover:underline">
              Voir tout →
            </Link>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Gérez les photos dans la galerie</p>
        </div>

        {/* Événements */}
        <EventsSection personId={id!} />
        </div>
      </main>
    </div>
  );
}

// Reports Page
function ReportsPage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [selectedPerson, setSelectedPerson] = React.useState('');
  const [reportType, setReportType] = React.useState<'descendants' | 'ancestors'>('descendants');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/persons')
      .then(r => r.json())
      .then(data => setPersons(data.data.persons));
  }, []);

  const generateReport = async () => {
    if (!selectedPerson) return;
    
    setLoading(true);
    try {
      const endpoint = reportType === 'descendants' 
        ? `http://localhost:3000/api/persons/${selectedPerson}/descendants`
        : `http://localhost:3000/api/persons/${selectedPerson}/ancestors`;
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Rapports' }]} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">📈 Rapports Généalogiques</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Personne</label>
              <select
                value={selectedPerson}
                onChange={e => setSelectedPerson(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Sélectionner...</option>
                {persons.map(p => (
                  <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Type de rapport</label>
              <select
                value={reportType}
                onChange={e => setReportType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="descendants">👶 Descendants</option>
                <option value="ancestors">👴 Ancêtres (Ascendants)</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={!selectedPerson || loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Chargement...' : 'Générer le rapport'}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="border-t dark:border-gray-700 pt-6">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                {reportType === 'descendants' ? '👶 Descendants' : '👴 Ancêtres (Ascendants)'} ({results.length})
              </h2>
              <div className="space-y-2">
                {results.map((person, idx) => (
                  <Link
                    key={idx}
                    to={`/person/${person.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                    style={{ paddingLeft: `${person.generation * 2 + 1}rem` }}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {person.profilePhotoUrl ? (
                        <img src={`http://localhost:3000${person.profilePhotoUrl}`} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium dark:text-white">{person.firstName} {person.lastName}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Génération {person.generation} • {person.birthDate && new Date(person.birthDate).getFullYear()}
                        {person.age && ` • ${person.age} ans`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Map Page
function MapPage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [locations, setLocations] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/persons')
      .then(r => r.json())
      .then(data => {
        const persons = data.data.persons;
        setPersons(persons);
        
        const locs = persons
          .filter((p: any) => p.birthPlace)
          .reduce((acc: any[], p: any) => {
            const existing = acc.find(l => l.place === p.birthPlace);
            if (existing) {
              existing.persons.push(p);
            } else {
              acc.push({ place: p.birthPlace, persons: [p] });
            }
            return acc;
          }, []);
        setLocations(locs);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Carte' }]} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-white">🗺️ Carte des Lieux de Naissance</h1>
          
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Carte interactive des lieux de naissance
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {locations.length} lieux différents • {persons.filter(p => p.birthPlace).length} personnes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📍</div>
                  <div className="flex-1">
                    <div className="font-medium dark:text-white">{loc.place}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {loc.persons.length} personne{loc.persons.length > 1 ? 's' : ''}
                    </div>
                    <div className="space-y-1">
                      {loc.persons.slice(0, 3).map((p: any) => (
                        <Link
                          key={p.id}
                          to={`/person/${p.id}`}
                          className="block text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {p.firstName} {p.lastName}
                        </Link>
                      ))}
                      {loc.persons.length > 3 && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          +{loc.persons.length - 3} autre{loc.persons.length - 3 > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// Statistics Page
function StatsPage() {
  const [persons, setPersons] = React.useState<any[]>([]);
  const [stats, setStats] = React.useState<any>(null);

  React.useEffect(() => {
    fetch('http://localhost:3000/api/persons')
      .then(r => r.json())
      .then(data => {
        const persons = data.data.persons;
        setPersons(persons);
        
        const ages = persons.filter((p: any) => p.birthDate && !p.deathDate)
          .map((p: any) => new Date().getFullYear() - new Date(p.birthDate).getFullYear());
        const avgAge = ages.length > 0 ? Math.round(ages.reduce((a: number, b: number) => a + b, 0) / ages.length) : 0;
        
        const genders = persons.reduce((acc: any, p: any) => {
          acc[p.gender] = (acc[p.gender] || 0) + 1;
          return acc;
        }, {});
        
        const places = persons.filter((p: any) => p.birthPlace)
          .reduce((acc: any, p: any) => {
            acc[p.birthPlace] = (acc[p.birthPlace] || 0) + 1;
            return acc;
          }, {});
        const topPlaces = Object.entries(places).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);
        
        const professions = persons.filter((p: any) => p.profession)
          .reduce((acc: any, p: any) => {
            acc[p.profession] = (acc[p.profession] || 0) + 1;
            return acc;
          }, {});
        const topProfessions = Object.entries(professions).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);
        
        const decades = persons.filter((p: any) => p.birthDate)
          .reduce((acc: any, p: any) => {
            const decade = Math.floor(new Date(p.birthDate).getFullYear() / 10) * 10;
            acc[decade] = (acc[decade] || 0) + 1;
            return acc;
          }, {});
        
        const decadesData = Object.entries(decades).sort().map(([decade, count]) => ({
          decade: `${decade}s`,
          naissances: count
        }));

        const genderData = [
          { name: 'Hommes', value: genders.male || 0, fill: '#3b82f6' },
          { name: 'Femmes', value: genders.female || 0, fill: '#ec4899' }
        ];
        
        setStats({
          total: persons.length,
          avgAge,
          genders,
          topPlaces,
          topProfessions,
          decadesData,
          genderData
        });
      });
  }, []);

  if (!stats) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Statistiques' }]} />
        <h1 className="text-3xl font-bold mb-8 dark:text-white">📊 Statistiques</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
            <div className="text-gray-600 dark:text-gray-400">Personnes totales</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">📅</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.avgAge}</div>
            <div className="text-gray-600 dark:text-gray-400">Âge moyen</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-2">⚖️</div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.genders.male || 0}M / {stats.genders.female || 0}F
            </div>
            <div className="text-gray-600 dark:text-gray-400">Répartition par genre</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">📈 Naissances par décennie</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.decadesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="decade" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="naissances" fill="#3b82f6" animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">⚖️ Répartition par genre</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                  animationDuration={1000}
                >
                  {stats.genderData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">📍 Lieux de naissance</h2>
            <div className="space-y-3">
              {stats.topPlaces.map(([place, count]: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="dark:text-gray-300">{place}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium dark:text-gray-400">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">💼 Professions</h2>
            <div className="space-y-3">
              {stats.topProfessions.map(([prof, count]: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="dark:text-gray-300">{prof}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium dark:text-gray-400">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Timeline Page
function TimelinePage() {
  const [events, setEvents] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState('all');

  React.useEffect(() => {
    fetch('http://localhost:3000/api/events')
      .then(r => r.json())
      .then(data => setEvents(data.data));
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.eventType === filter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', path: '/' }, { label: 'Timeline' }]} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">⏱️ Timeline Familiale</h1>
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">Tous les événements</option>
              <option value="birth">Naissances</option>
              <option value="marriage">Mariages</option>
              <option value="death">Décès</option>
              <option value="education">Éducation</option>
              <option value="career">Carrière</option>
              <option value="other">Autres</option>
            </select>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200 dark:bg-blue-800"></div>
            <div className="space-y-6">
              {filtered.map((event, idx) => (
                <div key={idx} className="relative pl-16">
                  <div className="absolute left-6 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-800"></div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link to={`/person/${event.person.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                          {event.person.firstName} {event.person.lastName}
                        </Link>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(event.eventDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded">
                        {event.eventType}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">{event.title}</div>
                    {event.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">{event.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Events Section Component
function EventsSection({ personId }: { personId: string }) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);
  const [newEvent, setNewEvent] = React.useState({
    title: '',
    eventType: 'other',
    eventDate: '',
    description: ''
  });

  React.useEffect(() => {
    loadEvents();
  }, [personId]);

  const loadEvents = () => {
    fetch(`http://localhost:3000/api/events/person/${personId}`)
      .then(r => r.json())
      .then(data => setEvents(data.data || []));
  };

  const handleAdd = async () => {
    try {
      await fetch('http://localhost:3000/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newEvent, personId })
      });
      setShowAdd(false);
      setNewEvent({ title: '', eventType: 'other', eventDate: '', description: '' });
      loadEvents();
    } catch (error) {
      alert('Erreur');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold dark:text-white">📅 Événements</h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Ajouter
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded">
          <input
            type="text"
            placeholder="Titre"
            className="w-full px-3 py-2 border rounded mb-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            value={newEvent.title}
            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <select
            className="w-full px-3 py-2 border rounded mb-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            value={newEvent.eventType}
            onChange={e => setNewEvent({ ...newEvent, eventType: e.target.value })}
          >
            <option value="birth">Naissance</option>
            <option value="marriage">Mariage</option>
            <option value="death">Décès</option>
            <option value="education">Éducation</option>
            <option value="career">Carrière</option>
            <option value="other">Autre</option>
          </select>
          <input
            type="date"
            className="w-full px-3 py-2 border rounded mb-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            value={newEvent.eventDate}
            onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })}
          />
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 border rounded mb-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            value={newEvent.description}
            onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Ajouter
          </button>
        </div>
      )}

      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium dark:text-white">{event.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.eventDate).toLocaleDateString('fr-FR')} • {event.eventType}
                  </div>
                  {event.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{event.description}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Aucun événement</p>
      )}
    </div>
  );
}

// Gallery Page
function GalleryPage() {
  const { id } = useParams();
  const [person, setPerson] = React.useState<any>(null);
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetch(`http://localhost:3000/api/persons/${id}`)
        .then(r => r.json())
        .then(data => {
          setPerson(data.data);
          // Simuler plusieurs photos (en production, vient de l'API)
          setPhotos(data.data.profilePhotoUrl ? [
            { id: 1, url: data.data.profilePhotoUrl, title: 'Photo de profil' }
          ] : []);
        });
    }
  }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('personId', id!);
    formData.append('title', 'Photo');

    try {
      await fetch('http://localhost:3000/api/media/upload', {
        method: 'POST',
        body: formData
      });
      window.location.reload();
    } catch (error) {
      alert('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  if (!person) return <div className="text-center py-12">Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <Breadcrumb items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Liste', path: '/list' },
          { label: `${person.firstName} ${person.lastName}`, path: `/person/${id}` },
          { label: 'Galerie' }
        ]} />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">📸 Galerie de {person.firstName}</h1>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                id="gallery-upload"
                disabled={uploading}
              />
              <label
                htmlFor="gallery-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
              >
                {uploading ? 'Upload...' : '+ Ajouter une photo'}
              </label>
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Aucune photo. Ajoutez-en une !
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="relative group">
                  <img
                    src={`http://localhost:3000${photo.url}`}
                    alt={photo.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <button className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-gray-900 rounded-lg">
                      Voir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Login Page
function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRegister, setIsRegister] = React.useState(false);
  const [name, setName] = React.useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = isRegister 
      ? await register(email, password, name)
      : await login(email, password);
    
    if (success) {
      navigate('/');
    } else {
      alert('Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center dark:text-white">
          🌳 Arbre Généalogique
        </h1>
        <h2 className="text-xl font-semibold mb-6 text-center dark:text-gray-300">
          {isRegister ? 'Créer un compte' : 'Connexion'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/list" element={<ListPage />} />
        <Route path="/tree" element={<TreePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/person/new" element={<CreatePage />} />
        <Route path="/person/:id/edit" element={<EditPage />} />
        <Route path="/person/:id" element={<PersonDetailPage />} />
        <Route path="/person/:id/gallery" element={<GalleryPage />} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
