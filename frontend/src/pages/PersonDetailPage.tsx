// SPEC-F-007: Person Detail Page

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { personService } from '../services/api';
import { PersonDetail } from '../types';
import { ArrowLeft, Edit, Trash2, User } from 'lucide-react';

export const PersonDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) loadPerson(id);
  }, [id]);

  const loadPerson = async (personId: string) => {
    try {
      const data = await personService.getById(personId);
      setPerson(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) return;
    
    try {
      await personService.delete(id);
      navigate('/');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  if (!person) {
    return <div className="text-center py-12">Personne non trouvée</div>;
  }

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
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">
              {person.firstName} {person.lastName}
            </h1>
            <div className="flex gap-2">
              <button className="p-2 border rounded-lg hover:bg-gray-50">
                <Edit className="w-5 h-5" />
              </button>
              <button onClick={handleDelete} className="p-2 border rounded-lg hover:bg-red-50 text-red-600">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-6">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
              {person.profilePhotoUrl ? (
                <img src={person.profilePhotoUrl} alt={person.firstName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-gray-400" />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Informations</h2>
              
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
          </div>
        </div>

        {person.parents.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Parents</h2>
            <div className="space-y-2">
              {person.parents.map((parent) => (
                <div key={parent.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <span className="font-medium">{parent.firstName} {parent.lastName}</span>
                  <span className="text-sm text-gray-500">({parent.relationshipType})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {person.children.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Enfants</h2>
            <div className="space-y-2">
              {person.children.map((child) => (
                <div key={child.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                  <span className="font-medium">{child.firstName} {child.lastName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {person.unions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Unions</h2>
            <div className="space-y-2">
              {person.unions.map((union) => (
                <div key={union.id} className="p-2 hover:bg-gray-50 rounded">
                  <p className="font-medium">{union.partner?.firstName} {union.partner?.lastName}</p>
                  <p className="text-sm text-gray-500">{union.unionType} • {union.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
