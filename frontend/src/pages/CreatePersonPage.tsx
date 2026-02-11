// SPEC-F-001: Create Person Page

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonForm } from '../components/person/PersonForm';
import { personService } from '../services/api';
import { ArrowLeft } from 'lucide-react';

export const CreatePersonPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      await personService.create(data);
      navigate('/');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter une personne</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          {loading ? (
            <p className="text-center py-4">Enregistrement...</p>
          ) : (
            <PersonForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/')}
            />
          )}
        </div>
      </main>
    </div>
  );
};
