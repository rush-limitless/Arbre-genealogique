// SPEC-F-001: Home Page - Liste des Personnes

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { personService } from '../services/api';
import { PersonCard } from '../components/person/PersonCard';
import { Person } from '../types';
import { Plus, Search } from 'lucide-react';

export const HomePage = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPersons();
  }, [search]);

  const loadPersons = async () => {
    try {
      setLoading(true);
      const data = await personService.getAll(1, 50, search);
      setPersons(data.persons);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Arbre Généalogique</h1>
            <button
              onClick={() => navigate('/person/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Ajouter une personne
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher une personne..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : persons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune personne trouvée</p>
            <button
              onClick={() => navigate('/person/new')}
              className="mt-4 text-blue-600 hover:underline"
            >
              Ajouter la première personne
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {persons.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onClick={() => navigate(`/person/${person.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
