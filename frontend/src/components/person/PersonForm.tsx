// SPEC-F-001: Person Form Component

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Person } from '../../types';

const personSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères').max(100),
  lastName: z.string().min(2, 'Minimum 2 caractères').max(100),
  gender: z.enum(['male', 'female', 'other']),
  birthDate: z.string().optional(),
  birthPlace: z.string().optional(),
  deathDate: z.string().optional(),
  deathPlace: z.string().optional(),
  biography: z.string().optional(),
  profession: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
});

type PersonFormData = z.infer<typeof personSchema>;

interface PersonFormProps {
  person?: Person;
  onSubmit: (data: PersonFormData) => void;
  onCancel?: () => void;
}

export const PersonForm = ({ person, onSubmit, onCancel }: PersonFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: person,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Prénom *</label>
          <input
            {...register('firstName')}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Prénom"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nom *</label>
          <input
            {...register('lastName')}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Nom"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Sexe *</label>
        <select {...register('gender')} className="w-full px-3 py-2 border rounded-lg">
          <option value="">Sélectionner</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
          <option value="other">Autre</option>
        </select>
        {errors.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date de naissance</label>
          <input
            type="date"
            {...register('birthDate')}
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Lieu de naissance</label>
          <input
            {...register('birthPlace')}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ville, Pays"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Profession</label>
        <input
          {...register('profession')}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="Profession"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Biographie</label>
        <textarea
          {...register('biography')}
          className="w-full px-3 py-2 border rounded-lg"
          rows={4}
          placeholder="Racontez l'histoire de cette personne..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {person ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};
