// @ts-nocheck
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Star, Trash2 } from 'lucide-react';
import { InlineError, PageError, PageLoader } from '../components/PageState';
import { toast } from '../components/Toast';
import { apiGetData, apiRequestData, apiRequestVoid, buildMediaUrl, jsonBody } from '../services/api';
import { useAuth } from './auth';
import { Breadcrumb, NavBar } from './shell';

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Une erreur inattendue est survenue.';
};

export function GalleryPage() {
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
      toast.success('Photo ajoutee.');
      loadGallery();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleSetProfilePhoto = async (photoUrl: string) => {
    try {
      await apiRequestData(`/persons/${id}`, {
        method: 'PUT',
        body: jsonBody({ profilePhotoUrl: photoUrl }),
      });
      toast.success('Photo de profil mise a jour.');
      loadGallery();
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await apiRequestVoid(`/media/${photoId}`, { method: 'DELETE' });
      toast.success('Photo supprimee.');
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
    return <PageError fullHeight title="Personne non trouvee" message="Impossible de charger cette galerie." onRetry={loadGallery} />;
  }

  return (
    <div className="app-page">
      <NavBar />
      <main className="app-shell py-8 lg:py-10">
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/' },
            { label: `${person.firstName} ${person.lastName}`, path: `/person/${id}` },
            { label: 'Galerie' },
          ]}
        />

        <section className="app-panel-strong p-8 sm:p-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="app-kicker mb-3">Media</p>
              <h1 className="font-display text-4xl leading-tight text-[var(--color-text)] sm:text-5xl">
                Galerie de {person.firstName}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                Centralisez les portraits et documents visuels relies a cette fiche. Vous pouvez definir l'image principale a tout moment.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => navigate(`/person/${id}`)} className="app-button-ghost gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour au profil
              </button>
              <label htmlFor="gallery-upload" className="app-button-primary cursor-pointer gap-2">
                <ImagePlus className="h-4 w-4" />
                {uploading ? 'Import...' : 'Ajouter une photo'}
              </label>
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="gallery-upload" disabled={uploading} />
            </div>
          </div>
        </section>

        {actionError && <div className="mt-6"><InlineError message={actionError} /></div>}

        <section className="mt-6 app-panel p-6 sm:p-7">
          {photos.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] px-6 py-14 text-center">
              <div className="font-display text-3xl text-[var(--color-text)]">Aucune photo pour le moment</div>
              <div className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                Importez des portraits, scenes de famille ou documents historiques pour enrichir cette fiche.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((photo) => (
                <article key={photo.id} className="group app-panel-muted overflow-hidden">
                  <div className="relative">
                    <img src={buildMediaUrl(photo.fileUrl)} alt={photo.title} className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent px-4 pb-4 pt-10 text-stone-50">
                      <div className="truncate text-base font-semibold">{photo.title}</div>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4">
                    <button type="button" onClick={() => handleSetProfilePhoto(photo.fileUrl)} className="app-button-secondary flex-1 gap-2">
                      <Star className="h-4 w-4" />
                      Photo principale
                    </button>
                    <button
                      type="button"
                      onClick={() => window.confirm('Supprimer cette photo ?') && handleDeletePhoto(photo.id)}
                      className="app-button-danger gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export function LoginPage() {
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
    <div className="app-page flex items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="app-panel-strong hidden p-10 xl:block">
          <p className="app-kicker mb-3">Connexion</p>
          <h1 className="font-display max-w-2xl text-5xl leading-tight text-[var(--color-text)]">Une archive familiale elegante, claire et collaborative.</h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            Accedez a votre arbre, enrichissez les fiches, partagez les portraits et conservez la memoire familiale dans une interface unifiee.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="app-panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Recherche</div>
              <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">Instantanee</div>
            </div>
            <div className="app-panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Relations</div>
              <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">Contextuelles</div>
            </div>
            <div className="app-panel-muted p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">Photos</div>
              <div className="mt-2 text-lg font-semibold text-[var(--color-text)]">Mises en scene</div>
            </div>
          </div>
        </section>

        <section className="app-panel p-8 sm:p-10">
          <div className="mb-8">
            <p className="app-kicker mb-3">Espace personnel</p>
            <h2 className="font-display text-4xl text-[var(--color-text)]">{isRegister ? 'Creer un compte' : 'Connexion'}</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
              {isRegister
                ? 'Ouvrez un espace pour administrer votre archive familiale.'
                : 'Connectez-vous pour retrouver vos fiches, arbres et medias.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <InlineError message={error} />}

            {isRegister && (
              <label className="block">
                <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Nom complet</div>
                <input type="text" value={name} onChange={(event) => setName(event.target.value)} className="app-input" required />
              </label>
            )}

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Email</div>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="app-input" required />
            </label>

            <label className="block">
              <div className="mb-2 text-sm font-semibold text-[var(--color-text)]">Mot de passe</div>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="app-input" required />
            </label>

            <button type="submit" className="app-button-primary mt-4 w-full">
              {isRegister ? 'Creer le compte' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-muted)]">
            <button
              onClick={() => {
                clearError();
                setIsRegister(!isRegister);
              }}
              className="font-semibold text-[var(--color-accent)]"
            >
              {isRegister ? 'Deja un compte ? Se connecter' : "Pas encore de compte ? S'inscrire"}
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-[var(--color-muted)]">
            <Link to="/" className="font-semibold text-[var(--color-accent)]">
              Revenir au tableau de bord
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
