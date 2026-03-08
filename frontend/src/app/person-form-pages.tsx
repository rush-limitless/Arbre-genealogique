// @ts-nocheck
import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, HeartHandshake, Save } from 'lucide-react';
import { InlineError, PageError, PageLoader } from '../components/PageState';
import { toast } from '../components/Toast';
import type { PaginatedResponse } from '../types';
import { apiGetData, apiRequestData, apiRequestVoid, jsonBody } from '../services/api';
import { Breadcrumb, NavBar } from './shell';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
};

const normalizeGender = (gender?: string | null) => (gender || '').toLowerCase();

const loadPersons = async () => {
  const data = await apiGetData<PaginatedResponse<any>>('/persons');
  return data.persons || [];
};

const loadPerson = (id: string) => apiGetData<any>(`/persons/${id}`);

const buildPersonPayload = (formData: any) => ({
  firstName: formData.firstName,
  lastName: formData.lastName,
  gender: formData.gender,
  birthDate: formData.birthDate || null,
  birthPlace: formData.birthPlace || null,
  residencePlace: formData.residencePlace || null,
  profession: formData.profession || null,
  biography: formData.biography || null,
  deathDate: formData.deathDate || null,
  deathPlace: formData.deathPlace || null,
});

const getCompletionScore = (formData: any) => {
  const fields = ['firstName', 'lastName', 'gender', 'birthDate', 'birthPlace', 'residencePlace', 'profession', 'biography'];
  const filled = fields.filter((field) => Boolean(formData[field])).length;
  return Math.round((filled / fields.length) * 100);
};

const getLinkContextLabel = (type: string, person: any) => {
  if (!person) {
    return null;
  }

  if (type === 'parent') {
    return `Vous ajoutez un parent pour ${person.firstName} ${person.lastName}.`;
  }

  if (type === 'child') {
    return `Vous ajoutez un enfant a ${person.firstName} ${person.lastName}.`;
  }

  if (type === 'partner') {
    return `Vous ajoutez un partenaire a ${person.firstName} ${person.lastName}.`;
  }

  return null;
};

function SectionCard({
  kicker,
  title,
  description,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="app-panel p-6 sm:p-7">
      <p className="app-kicker mb-2">{kicker}</p>
      <h2 className="font-display text-3xl text-[var(--color-text)]">{title}</h2>
      {description && <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">
        {label}
        {required ? ' *' : ''}
      </div>
      {children}
      {error && <div className="mt-2 text-sm text-[var(--color-danger)]">{error}</div>}
    </label>
  );
}

function ChildToggle({
  person,
  active,
  onToggle,
}: {
  person: any;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-[20px] border px-4 py-3 text-left transition-all ${
        active
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
          : 'border-[var(--color-line)] bg-white/30 text-[var(--color-text)] hover:bg-white/45 dark:bg-white/5 dark:hover:bg-white/8'
      }`}
    >
      <div className="text-sm font-semibold">
        {person.firstName} {person.lastName}
      </div>
    </button>
  );
}

function FormShell({
  mode,
  title,
  description,
  breadcrumbLabel,
  completion,
  submitLabel,
  submitting,
  submitError,
  tips,
  contextualMessage,
  duplicateMatches,
  children,
  onCancel,
}: {
  mode: 'create' | 'edit';
  title: string;
  description: string;
  breadcrumbLabel: string;
  completion: number;
  submitLabel: string;
  submitting: boolean;
  submitError?: string | null;
  tips: string[];
  contextualMessage?: string | null;
  duplicateMatches?: any[];
  children: React.ReactNode;
  onCancel: () => void;
}) {
  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: mode === 'create' ? 'Nouvelle fiche' : 'Edition' },
            { label: breadcrumbLabel },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
          <div className="space-y-6">
            <section className="app-panel-strong p-8 sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="app-kicker mb-3">{mode === 'create' ? 'Nouvelle fiche' : 'Edition en cours'}</p>
                  <h1 className="font-display max-w-3xl text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                    {title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">{description}</p>
                </div>

                <button type="button" onClick={onCancel} className="app-button-ghost gap-2 self-start sm:self-auto">
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </button>
              </div>
            </section>

            {contextualMessage && (
              <div className="app-panel p-5">
                <div className="flex items-start gap-3">
                  <HeartHandshake className="mt-1 h-5 w-5 text-[var(--color-accent)]" />
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-text)]">Contexte relationnel</div>
                    <div className="mt-1 text-sm leading-7 text-[var(--color-muted)]">{contextualMessage}</div>
                  </div>
                </div>
              </div>
            )}

            {submitError && <InlineError message={submitError} />}

            {duplicateMatches && duplicateMatches.length > 0 && (
              <div className="app-panel p-5">
                <div className="text-sm font-semibold text-[var(--color-text)]">Fiches potentiellement proches</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {duplicateMatches.map((person) => (
                    <Link key={person.id} to={`/person/${person.id}`} className="app-chip-neutral">
                      {person.firstName} {person.lastName}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {children}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Completude</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">Progression</h2>
              <div className="mt-6 rounded-full bg-[var(--color-accent-soft)] p-1">
                <div
                  className="h-3 rounded-full bg-[var(--color-accent)] transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-[var(--color-muted)]">{completion}% des champs narratifs sont renseignes.</div>
            </div>

            <div className="app-panel p-6 sm:p-7">
              <p className="app-kicker mb-2">Conseils</p>
              <h2 className="font-display text-3xl text-[var(--color-text)]">UX de saisie</h2>
              <div className="mt-5 space-y-3">
                {tips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3 rounded-[20px] border border-[var(--color-line)] px-4 py-4">
                    <Check className="mt-0.5 h-4 w-4 text-[var(--color-accent)]" />
                    <div className="text-sm leading-7 text-[var(--color-muted)]">{tip}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-panel p-4">
              <div className="flex gap-3">
                <button type="button" onClick={onCancel} className="app-button-ghost flex-1">
                  Annuler
                </button>
                <button type="submit" form="person-form" disabled={submitting} className="app-button-primary flex-1 gap-2">
                  <Save className="h-4 w-4" />
                  <span>{submitting ? 'En cours...' : submitLabel}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export function CreatePersonFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    deathDate: '',
    deathPlace: '',
    fatherId: '',
    motherId: '',
  });
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<any>({});

  const linkType = searchParams.get('link');
  const childId = searchParams.get('childId');
  const parentId = searchParams.get('parentId');
  const partnerId = searchParams.get('partnerId');

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
    if (name === 'firstName' && !value) nextErrors.firstName = 'Prenom requis';
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
      setSubmitError('Veuillez remplir les champs obligatoires.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const person = await apiRequestData<any>('/persons', {
        method: 'POST',
        body: jsonBody(buildPersonPayload(formData)),
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

      if (linkType === 'parent' && childId) {
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId: person.id,
            childId,
            relationshipType: 'biological',
            parentRole: formData.gender === 'male' ? 'father' : formData.gender === 'female' ? 'mother' : undefined,
          }),
        });
      }

      if (linkType === 'child' && parentId) {
        const selectedParent = persons.find((item) => item.id === parentId);
        await apiRequestData('/relationships', {
          method: 'POST',
          body: jsonBody({
            parentId,
            childId: person.id,
            relationshipType: 'biological',
            parentRole:
              normalizeGender(selectedParent?.gender) === 'male'
                ? 'father'
                : normalizeGender(selectedParent?.gender) === 'female'
                  ? 'mother'
                  : undefined,
          }),
        });
      }

      if (linkType === 'partner' && partnerId) {
        await apiRequestData('/unions', {
          method: 'POST',
          body: jsonBody({
            person1Id: partnerId,
            person2Id: person.id,
            unionType: 'marriage',
            status: 'active',
          }),
        });
      }

      toast.success('Personne creee avec succes.');
      navigate(`/person/${person.id}`);
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

  const contextualPerson =
    persons.find((person) => person.id === childId) ||
    persons.find((person) => person.id === parentId) ||
    persons.find((person) => person.id === partnerId);

  const duplicateMatches =
    formData.firstName || formData.lastName
      ? persons
          .filter((person) => {
            const current = `${person.firstName} ${person.lastName}`.toLowerCase();
            const query = `${formData.firstName} ${formData.lastName}`.trim().toLowerCase();
            return query.length > 3 && current.includes(query);
          })
          .slice(0, 4)
      : [];

  return (
    <FormShell
      mode="create"
      title="Composer une nouvelle fiche familiale"
      description="Les sections sont organisees pour guider la saisie, reduire les oublis et permettre une creation rapide depuis l arbre."
      breadcrumbLabel="Nouvelle fiche"
      completion={getCompletionScore(formData)}
      submitLabel="Creer la fiche"
      submitting={loading}
      submitError={submitError}
      contextualMessage={getLinkContextLabel(linkType || '', contextualPerson)}
      duplicateMatches={duplicateMatches}
      tips={[
        'Renseignez d abord les identifiants forts: nom, prenom, genre et naissance.',
        'Ajoutez au moins un lieu ou une profession pour rendre la recherche plus pertinente.',
        'Utilisez les liens familiaux si vous creez la fiche depuis une branche existante.',
      ]}
      onCancel={() => navigate(-1)}
    >
      <form id="person-form" onSubmit={handleSubmit} className="space-y-6">
        <SectionCard kicker="Identite" title="Informations principales" description="Ces donnees servent de base a toutes les vues: liste, arbre, recherche et fiche detail.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prenom" required error={errors.firstName}>
              <input name="firstName" type="text" className="app-input" value={formData.firstName} onChange={handleChange} />
            </Field>
            <Field label="Nom" required error={errors.lastName}>
              <input name="lastName" type="text" className="app-input" value={formData.lastName} onChange={handleChange} />
            </Field>
            <Field label="Genre" required error={errors.gender}>
              <select name="gender" value={formData.gender} onChange={handleChange} className="app-select">
                <option value="">Selectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </Field>
            <Field label="Profession">
              <input name="profession" type="text" className="app-input" value={formData.profession} onChange={handleChange} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard kicker="Filiation" title="Contexte familial" description="Associez tout de suite la fiche a sa branche pour accelerer la construction de l arbre.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pere">
              <select name="fatherId" value={formData.fatherId} onChange={handleChange} className="app-select">
                <option value="">Aucun</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'male').map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mere">
              <select name="motherId" value={formData.motherId} onChange={handleChange} className="app-select">
                <option value="">Aucune</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'female').map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard kicker="Parcours" title="Naissance, residence et repaires" description="Ces champs enrichissent les filtres, la carte et la lecture biographique.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Date de naissance">
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="app-input" />
            </Field>
            <Field label="Lieu de naissance">
              <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="app-input" />
            </Field>
            <Field label="Lieu de residence">
              <input type="text" name="residencePlace" value={formData.residencePlace} onChange={handleChange} className="app-input" />
            </Field>
            <Field label="Date de deces">
              <input type="date" name="deathDate" value={formData.deathDate} onChange={handleChange} className="app-input" />
            </Field>
            <Field label="Lieu de deces">
              <input type="text" name="deathPlace" value={formData.deathPlace} onChange={handleChange} className="app-input" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard kicker="Recit" title="Biographie et notes" description="Un texte court suffit deja a donner du contexte et a rendre la fiche plus vivante.">
          <Field label="Biographie">
            <textarea name="biography" rows={8} className="app-textarea min-h-[200px]" value={formData.biography} onChange={handleChange} />
          </Field>
        </SectionCard>
      </form>
    </FormShell>
  );
}

export function EditPersonFormPage() {
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
      setFormData({
        ...person,
        birthDate: person.birthDate?.split('T')[0] || '',
        deathDate: person.deathDate?.split('T')[0] || '',
      });
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
        body: jsonBody(buildPersonPayload(formData)),
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

      toast.success('Personne mise a jour.');
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
    <FormShell
      mode="edit"
      title={`Affiner la fiche de ${formData.firstName || ''} ${formData.lastName || ''}`.trim()}
      description="L edition est decoupee en sections pour faciliter la maintenance des liens familiaux et la qualite des donnees."
      breadcrumbLabel={`${formData.firstName || ''} ${formData.lastName || ''}`.trim() || 'Edition'}
      completion={getCompletionScore(formData)}
      submitLabel="Enregistrer"
      submitting={false}
      submitError={submitError}
      tips={[
        'Conservez une structure stable: nom, dates, lieux, puis contexte familial.',
        'Les enfants se gerent ici pour eviter les relations partielles ou contradictoires.',
        'Ajoutez une courte biographie meme provisoire pour enrichir la lecture de l arbre.',
      ]}
      onCancel={() => (id ? navigate(`/person/${id}`) : navigate(-1))}
    >
      <form id="person-form" onSubmit={handleSubmit} className="space-y-6">
        <SectionCard kicker="Identite" title="Informations principales" description="Les informations structurantes apparaissent d abord, les details narratifs ensuite.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Prenom" required>
              <input name="firstName" type="text" className="app-input" value={formData.firstName || ''} onChange={handleChange} required />
            </Field>
            <Field label="Nom" required>
              <input name="lastName" type="text" className="app-input" value={formData.lastName || ''} onChange={handleChange} required />
            </Field>
            <Field label="Genre" required>
              <select name="gender" className="app-select" value={formData.gender || ''} onChange={handleChange} required>
                <option value="">Selectionner</option>
                <option value="male">Homme</option>
                <option value="female">Femme</option>
                <option value="other">Autre</option>
              </select>
            </Field>
            <Field label="Profession">
              <input name="profession" type="text" className="app-input" value={formData.profession || ''} onChange={handleChange} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard kicker="Relations" title="Parents et enfants" description="Liez la fiche a son environnement familial sans sortir du formulaire.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Pere">
              <select name="father" value={currentParents.father} onChange={handleParentChange} className="app-select">
                <option value="">Aucun</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'male' && person.id !== id).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Mere">
              <select name="mother" value={currentParents.mother} onChange={handleParentChange} className="app-select">
                <option value="">Aucune</option>
                {persons.filter((person) => normalizeGender(person.gender) === 'female' && person.id !== id).map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-6">
            <div className="mb-3 text-sm font-semibold text-[var(--color-text)]">Enfants lies</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {persons.filter((person) => person.id !== id).map((person) => (
                <ChildToggle key={person.id} person={person} active={currentChildren.includes(person.id)} onToggle={() => toggleChild(person.id)} />
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard kicker="Parcours" title="Temporalite et lieux" description="Dates et lieux renforcent la lecture chronologique et la qualite des exports.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Date de naissance">
              <input name="birthDate" type="date" className="app-input" value={formData.birthDate || ''} onChange={handleChange} />
            </Field>
            <Field label="Lieu de naissance">
              <input name="birthPlace" type="text" className="app-input" value={formData.birthPlace || ''} onChange={handleChange} />
            </Field>
            <Field label="Lieu de residence">
              <input name="residencePlace" type="text" className="app-input" value={formData.residencePlace || ''} onChange={handleChange} />
            </Field>
            <Field label="Date de deces">
              <input name="deathDate" type="date" className="app-input" value={formData.deathDate || ''} onChange={handleChange} />
            </Field>
            <Field label="Lieu de deces">
              <input name="deathPlace" type="text" className="app-input" value={formData.deathPlace || ''} onChange={handleChange} />
            </Field>
          </div>
        </SectionCard>

        <SectionCard kicker="Recit" title="Biographie" description="Quelques lignes suffisent pour contextualiser une vie, une migration, un metier ou une branche.">
          <Field label="Biographie">
            <textarea name="biography" rows={8} className="app-textarea min-h-[220px]" value={formData.biography || ''} onChange={handleChange} />
          </Field>
        </SectionCard>
      </form>
    </FormShell>
  );
}
