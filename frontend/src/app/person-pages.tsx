// @ts-nocheck
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InlineError, PageError, PageLoader } from '../components/PageState';
import { toast } from '../components/Toast';
import type { PaginatedResponse } from '../types';
import { apiGetData, apiRequestData, apiRequestVoid, buildMediaUrl, jsonBody } from '../services/api';
import { useAuth } from './auth';
import { NavBar } from './shell';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
};

const normalizeGender = (gender?: string | null) => (gender || '').toLowerCase();

const loadPersons = async () => {
  const data = await apiGetData<PaginatedResponse<any>>('/persons');
  return data.persons || [];
};

const loadPerson = (id: string) => apiGetData<any>(`/persons/${id}`);

function CreatePage() {
  const navigate = useNavigate();
  const [persons, setPersons] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState({
    firstName: '',
    lastName: '',
    gender: '',
    birthDate: '',
    birthPlace: '',
    residencePlace: '',
    profession: '',
    biography: '',
    fatherId: '',
    motherId: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<any>({});

  const loadAvailablePersons = React.useCallback(async () => {
    setInitialLoading(true);
    setLoadError(null);

    try {
      setPersons(await loadPersons());
    } catch (requestError) {
      setLoadError(getErrorMessage(requestError));
    } finally {
      setInitialLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAvailablePersons();
  }, [loadAvailablePersons]);

  const validateField = (name: string, value: string) => {
    const nextErrors = { ...errors };
    if (name === 'firstName' && !value) nextErrors.firstName = 'Prénom requis';
    else if (name === 'firstName') delete nextErrors.firstName;
    if (name === 'lastName' && !value) nextErrors.lastName = 'Nom requis';
    else if (name === 'lastName') delete nextErrors.lastName;
    if (name === 'gender' && !value) nextErrors.gender = 'Genre requis';
    else if (name === 'gender') delete nextErrors.gender;
    setErrors(nextErrors);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.gender) {
      setSubmitError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const person = await apiRequestData<any>('/persons', {
        method: 'POST',
        body: jsonBody(formData),
      });

      if (formData.fatherId) {
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId: formData.fatherId,
            childId: person.id,
            relationshipType: 'biological',
            parentRole: 'father',
          }),
        });
      }

      if (formData.motherId) {
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId: formData.motherId,
            childId: person.id,
            relationshipType: 'biological',
            parentRole: 'mother',
          }),
        });
      }

      toast.success('Personne créée avec succès.');
      navigate('/list');
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <PageLoader fullHeight message="Chargement du formulaire..." />;
  }

  if (loadError) {
    return <PageError fullHeight message={loadError} onRetry={loadAvailablePersons} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h1 className="mb-6 text-2xl font-bold dark:text-white">Ajouter une personne</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && <InlineError message={submitError} />}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">Prénom *</label>
                <input name="firstName" type="text" className={`w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white ${errors.firstName ? 'border-red-500' : ''}`} value={formData.firstName} onChange={handleChange} required />
                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">Nom *</label>
                <input name="lastName" type="text" className={`w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white ${errors.lastName ? 'border-red-500' : ''}`} value={formData.lastName} onChange={handleChange} required />
                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Sexe *</label>
              <select className={`w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white ${errors.gender ? 'border-red-500' : ''}`} name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="">Sélectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
              {errors.gender && <p className="mt-1 text-sm text-red-500">{errors.gender}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">👨 Père</label>
                <select name="fatherId" value={formData.fatherId} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white">
                  <option value="">Aucun</option>
                  {persons.filter((person) => normalizeGender(person.gender) === 'male').map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">👩 Mère</label>
                <select name="motherId" value={formData.motherId} onChange={handleChange} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white">
                  <option value="">Aucune</option>
                  {persons.filter((person) => normalizeGender(person.gender) === 'female').map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">Date de naissance</label>
                <input type="date" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" name="birthDate" value={formData.birthDate} onChange={handleChange} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">Lieu de naissance</label>
                <input type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-white">Lieu de résidence</label>
                <input type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" name="residencePlace" value={formData.residencePlace} onChange={handleChange} placeholder="Ville actuelle ou dernière résidence" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Profession</label>
              <input type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" name="profession" value={formData.profession} onChange={handleChange} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Biographie</label>
              <textarea className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" rows={4} name="biography" value={formData.biography} onChange={handleChange} />
            </div>

            <div className="flex justify-end gap-2">
              <Link to="/" className="rounded-lg border px-4 py-2 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700">
                Annuler
              </Link>
              <button type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState<any>({});
  const [persons, setPersons] = React.useState<any[]>([]);
  const [currentParents, setCurrentParents] = React.useState<any>({ father: null, mother: null });
  const [currentChildren, setCurrentChildren] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const loadEditData = React.useCallback(async () => {
    if (!id) {
      setError('Identifiant manquant.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [person, allPersons] = await Promise.all([loadPerson(id), loadPersons()]);
      setFormData(person);
      setPersons(allPersons);

      const relations = person.relations || [];
      const fatherRel = relations.find((relation: any) => relation.type === 'PARENT' && relation.parentRole === 'father');
      const motherRel = relations.find((relation: any) => relation.type === 'PARENT' && relation.parentRole === 'mother');
      setCurrentParents({
        father: fatherRel?.relatedPersonId || '',
        mother: motherRel?.relatedPersonId || '',
      });

      const children = allPersons.filter((personItem: any) =>
        personItem.relations?.some((relation: any) => relation.type === 'PARENT' && relation.relatedPersonId === id)
      );
      setCurrentChildren(children.map((child: any) => child.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadEditData();
  }, [loadEditData]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleParentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentParents({ ...currentParents, [event.target.name]: event.target.value });
  };

  const toggleChild = (childId: string) => {
    if (currentChildren.includes(childId)) {
      setCurrentChildren(currentChildren.filter((child) => child !== childId));
    } else {
      setCurrentChildren([...currentChildren, childId]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    try {
      await apiRequestData(`/persons/${id}`, {
        method: 'PUT',
        body: jsonBody(formData),
      });

      const existingRelations = formData.relations || [];
      for (const relation of existingRelations) {
        if (relation.type === 'PARENT') {
          await apiRequestVoid(`/relationships/${relation.id}`, { method: 'DELETE' });
        }
      }

      if (currentParents.father) {
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId: currentParents.father,
            childId: id,
            relationshipType: 'biological',
            parentRole: 'father',
          }),
        });
      }

      if (currentParents.mother) {
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId: currentParents.mother,
            childId: id,
            relationshipType: 'biological',
            parentRole: 'mother',
          }),
        });
      }

      const oldChildren = persons
        .filter((person) => person.relations?.some((relation: any) => relation.type === 'PARENT' && relation.relatedPersonId === id))
        .map((person: any) => person.id);

      for (const childId of oldChildren) {
        if (!currentChildren.includes(childId)) {
          const relation = persons.find((person: any) => person.id === childId)?.relations?.find((item: any) => item.type === 'PARENT' && item.relatedPersonId === id);
          if (relation?.id) {
            await apiRequestVoid(`/relationships/${relation.id}`, { method: 'DELETE' });
          }
        }
      }

      for (const childId of currentChildren) {
        if (!oldChildren.includes(childId)) {
          await apiRequestData('/relationships', {
            method: 'POST',
            body: jsonBody({
              parentId: id,
              childId,
              relationshipType: 'biological',
              parentRole: normalizeGender(formData.gender) === 'male' ? 'father' : 'mother',
            }),
          });
        }
      }

      toast.success('Personne mise à jour.');
      navigate(`/person/${id}`);
    } catch (requestError) {
      setSubmitError(getErrorMessage(requestError));
    }
  };

  if (loading) {
    return <PageLoader fullHeight message="Chargement de la fiche..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadEditData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <h1 className="mb-6 text-3xl font-bold dark:text-white">
          ✏️ Éditer {formData.firstName} {formData.lastName}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          {submitError && <InlineError message={submitError} />}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Prénom *</label>
              <input name="firstName" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.firstName || ''} onChange={handleChange} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Nom *</label>
              <input name="lastName" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.lastName || ''} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-white">Sexe *</label>
            <select name="gender" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.gender || ''} onChange={handleChange} required>
              <option value="">Sélectionner...</option>
              <option value="male">Homme</option>
              <option value="female">Femme</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-blue-50 p-4 dark:bg-blue-900">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">👨 Père</label>
              <select name="father" value={currentParents.father} onChange={handleParentChange} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white">
                <option value="">Aucun</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'male' && person.id !== id).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">👩 Mère</label>
              <select name="mother" value={currentParents.mother} onChange={handleParentChange} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white">
                <option value="">Aucune</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'female' && person.id !== id).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900">
            <label className="mb-2 block text-sm font-medium dark:text-white">👶 Enfants</label>
            <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
              {persons.filter((person) => person.id !== id).map((person) => (
                <label key={person.id} className="flex cursor-pointer items-center space-x-2">
                  <input type="checkbox" checked={currentChildren.includes(person.id)} onChange={() => toggleChild(person.id)} className="rounded" />
                  <span className="text-sm dark:text-white">
                    {person.firstName} {person.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Date de naissance</label>
              <input name="birthDate" type="date" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.birthDate?.split('T')[0] || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Lieu de naissance</label>
              <input name="birthPlace" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.birthPlace || ''} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Lieu de résidence</label>
              <input name="residencePlace" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.residencePlace || ''} onChange={handleChange} placeholder="Ville actuelle ou dernière résidence" />
            </div>
            <div />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Date de décès</label>
              <input name="deathDate" type="date" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.deathDate?.split('T')[0] || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-white">Lieu de décès</label>
              <input name="deathPlace" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.deathPlace || ''} onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-white">Profession</label>
            <input name="profession" type="text" className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.profession || ''} onChange={handleChange} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-white">Biographie</label>
            <textarea name="biography" rows={4} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" value={formData.biography || ''} onChange={handleChange} />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
              💾 Enregistrer
            </button>
            <button type="button" onClick={() => (id ? navigate(`/person/${id}`) : navigate(-1))} className="rounded-lg bg-gray-200 px-6 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

function EventsSection({ personId }: { personId: string }) {
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
    try {
      await apiRequestData('/events', {
        method: 'POST',
        body: jsonBody({ ...newEvent, personId }),
      });
      setShowAdd(false);
      setNewEvent({ title: '', eventType: 'other', eventDate: '', description: '' });
      toast.success('Événement ajouté.');
      loadEvents();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold dark:text-white">📆 Événements</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
          + Ajouter
        </button>
      </div>

      {error && <InlineError message={error} onRetry={loadEvents} />}

      {showAdd && (
        <div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-700">
          <input type="text" placeholder="Titre" className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={newEvent.title} onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })} />
          <select className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={newEvent.eventType} onChange={(event) => setNewEvent({ ...newEvent, eventType: event.target.value })}>
            <option value="birth">Naissance</option>
            <option value="marriage">Mariage</option>
            <option value="death">Décès</option>
            <option value="education">Éducation</option>
            <option value="career">Carrière</option>
            <option value="other">Autre</option>
          </select>
          <input type="date" className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={newEvent.eventDate} onChange={(event) => setNewEvent({ ...newEvent, eventDate: event.target.value })} />
          <textarea placeholder="Description" className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={newEvent.description} onChange={(event) => setNewEvent({ ...newEvent, description: event.target.value })} />
          <button onClick={handleAdd} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Ajouter
          </button>
        </div>
      )}

      {loading ? (
        <PageLoader message="Chargement des événements..." />
      ) : events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded bg-gray-50 p-3 dark:bg-gray-700">
              <div className="font-medium dark:text-white">{event.title}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(event.eventDate).toLocaleDateString('fr-FR')} • {event.eventType}
              </div>
              {event.description && <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{event.description}</div>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Aucun événement</p>
      )}
    </div>
  );
}

function PersonDetailPage() {
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
      toast.success('Photo uploadée.');
      window.location.reload();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer cette personne ?')) {
      return;
    }

    try {
      await apiRequestVoid(`/persons/${id}`, { method: 'DELETE' });
      toast.success('Personne supprimée.');
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
      toast.success('Parent ajouté.');
      window.location.reload();
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
      toast.success('Union créée.');
      window.location.reload();
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
    return <PageError fullHeight title="Personne non trouvée" message="Cette fiche n'existe pas ou plus." onRetry={loadDetails} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="flex items-start justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {person.firstName} {person.lastName}
            </h1>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/person/${id}/edit`)} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                ✏️ Éditer
              </button>
              <button onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {actionError && <InlineError message={actionError} />}

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-white">Photo de profil</h2>
            <div className="flex items-center gap-6">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                {person.profilePhotoUrl ? (
                  <img src={buildMediaUrl(person.profilePhotoUrl)} alt={person.firstName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">👤</span>
                )}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload" disabled={uploading} />
                <label htmlFor="photo-upload" className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  {uploading ? 'Upload...' : 'Changer la photo'}
                </label>
                <p className="mt-2 text-sm text-gray-500">JPG, PNG ou GIF (max 5MB)</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-white">Informations</h2>
            <div className="grid grid-cols-2 gap-4">
              {person.birthDate && (
                <div>
                  <p className="text-sm text-gray-500">Date de naissance</p>
                  <p className="font-medium dark:text-white">{new Date(person.birthDate).toLocaleDateString('fr-FR')}</p>
                </div>
              )}
              {person.birthPlace && (
                <div>
                  <p className="text-sm text-gray-500">Lieu de naissance</p>
                  <p className="font-medium dark:text-white">{person.birthPlace}</p>
                </div>
              )}
              {person.age !== undefined && (
                <div>
                  <p className="text-sm text-gray-500">Âge</p>
                  <p className="font-medium dark:text-white">{person.age} ans</p>
                </div>
              )}
              {person.profession && (
                <div>
                  <p className="text-sm text-gray-500">Profession</p>
                  <p className="font-medium dark:text-white">{person.profession}</p>
                </div>
              )}
            </div>
            {person.biography && (
              <div className="mt-4">
                <p className="mb-1 text-sm text-gray-500">Biographie</p>
                <p className="text-gray-700 dark:text-gray-300">{person.biography}</p>
              </div>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Parents</h2>
              <button onClick={() => setShowAddParent(!showAddParent)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                + Ajouter
              </button>
            </div>

            {showAddParent && (
              <div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-700">
                <select className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={selectedParent} onChange={(event) => setSelectedParent(event.target.value)}>
                  <option value="">Sélectionner un parent</option>
                  {persons.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.firstName} {parent.lastName}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddParent} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  Confirmer
                </button>
              </div>
            )}

            {person.parents?.length > 0 ? (
              <div className="space-y-2">
                {person.parents.map((parent: any) => (
                  <Link key={parent.id} to={`/person/${parent.id}`} className="block rounded p-2 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700">
                    <span className="font-medium">
                      {parent.firstName} {parent.lastName}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">({parent.relationshipType})</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun parent</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold dark:text-white">Enfants</h2>
            {person.children?.length > 0 ? (
              <div className="space-y-2">
                {person.children.map((child: any) => (
                  <Link key={child.id} to={`/person/${child.id}`} className="block rounded p-2 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-700">
                    <span className="font-medium">
                      {child.firstName} {child.lastName}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucun enfant</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">Unions</h2>
              <button onClick={() => setShowAddUnion(!showAddUnion)} className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                + Ajouter
              </button>
            </div>

            {showAddUnion && (
              <div className="mb-4 rounded bg-gray-50 p-4 dark:bg-gray-700">
                <select className="mb-2 w-full rounded border px-3 py-2 dark:bg-gray-600 dark:text-white" value={selectedPartner} onChange={(event) => setSelectedPartner(event.target.value)}>
                  <option value="">Sélectionner un partenaire</option>
                  {persons.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.firstName} {partner.lastName}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddUnion} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                  Confirmer
                </button>
              </div>
            )}

            {person.unions?.length > 0 ? (
              <div className="space-y-2">
                {person.unions.map((union: any) => (
                  <div key={union.id} className="rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <Link to={`/person/${union.partner.id}`} className="font-medium dark:text-white">
                      {union.partner.firstName} {union.partner.lastName}
                    </Link>
                    <p className="text-sm text-gray-500">
                      {union.unionType} • {union.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Aucune union</p>
            )}
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold dark:text-white">📸 Galerie</h2>
              <Link to={`/person/${id}/gallery`} className="text-blue-600 hover:underline dark:text-blue-400">
                Voir tout →
              </Link>
            </div>
            <p className="text-gray-500 dark:text-gray-400">Gérez les photos dans la galerie.</p>
          </div>

          <EventsSection personId={id!} />
        </div>
      </main>
    </div>
  );
}

function GalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = React.useState<any>(null);
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const loadGallery = React.useCallback(async () => {
    if (!id) {
      setError('Identifiant manquant.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [personData, photosData] = await Promise.all([apiGetData<any>(`/persons/${id}`), apiGetData<any[]>(`/media/person/${id}`)]);
      setPerson(personData);
      setPhotos(photosData || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) {
      return;
    }

    setUploading(true);
    setActionError(null);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('personId', id);
    formData.append('title', 'Photo');

    try {
      await apiRequestData('/media/upload', {
        method: 'POST',
        body: formData,
      });
      toast.success('Photo ajoutée.');
      loadGallery();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setUploading(false);
    }
  };

  const handleSetProfilePhoto = async (photoUrl: string) => {
    try {
      await apiRequestData(`/persons/${id}`, {
        method: 'PUT',
        body: jsonBody({ profilePhotoUrl: photoUrl }),
      });
      toast.success('Photo de profil mise à jour.');
      loadGallery();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await apiRequestVoid(`/media/${photoId}`, { method: 'DELETE' });
      toast.success('Photo supprimée.');
      loadGallery();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  if (loading) {
    return <PageLoader fullHeight message="Chargement de la galerie..." />;
  }

  if (error) {
    return <PageError fullHeight message={error} onRetry={loadGallery} />;
  }

  if (!person) {
    return <PageError fullHeight title="Personne non trouvée" message="Impossible de charger cette galerie." onRetry={loadGallery} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      <main className="w-full px-6 py-8">
        <button onClick={() => navigate(`/person/${id}`)} className="mb-4 rounded px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
          ← Retour au profil
        </button>

        <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold dark:text-white">📸 Galerie de {person.firstName}</h1>
            <div>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="gallery-upload" disabled={uploading} />
              <label htmlFor="gallery-upload" className="inline-block cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                {uploading ? 'Upload...' : '+ Ajouter une photo'}
              </label>
            </div>
          </div>

          {actionError && <InlineError message={actionError} />}

          {photos.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucune photo. Ajoutez-en une !</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <div key={photo.id} className="group relative">
                  <img src={buildMediaUrl(photo.fileUrl)} alt={photo.title} className="h-48 w-full rounded-lg object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-gradient-to-t from-black to-transparent p-2">
                    <p className="truncate text-sm text-white">{photo.title}</p>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => handleSetProfilePhoto(photo.fileUrl)} className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600" title="Définir comme photo de profil">
                      ⭐
                    </button>
                    <button onClick={() => window.confirm('Supprimer cette photo ?') && handleDeletePhoto(photo.id)} className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600" title="Supprimer">
                      ✕
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

function LoginPage() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRegister, setIsRegister] = React.useState(false);
  const [name, setName] = React.useState('');
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    clearError();

    const success = isRegister ? await register(email, password, name) : await login(email, password);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold dark:text-white">🌳 Arbre Généalogique</h1>
        <h2 className="mb-6 text-center text-xl font-semibold dark:text-gray-300">{isRegister ? 'Créer un compte' : 'Connexion'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <InlineError message={error} />}

          {isRegister && (
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300">Nom</label>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" required />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300">Email</label>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300">Mot de passe</label>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border px-3 py-2 dark:bg-gray-700 dark:text-white" required />
          </div>
          <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              clearError();
              setIsRegister(!isRegister);
            }}
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {isRegister ? 'Déjà un compte ? Se connecter' : "Pas de compte ? S'inscrire"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { CreatePage, EditPage, PersonDetailPage, GalleryPage, LoginPage };
