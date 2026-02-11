// SPEC-F-003: Person Card Component

import { Person } from '../../types';
import { User } from 'lucide-react';

interface PersonCardProps {
  person: Person;
  onClick?: () => void;
}

export const PersonCard = ({ person, onClick }: PersonCardProps) => {
  const getAge = () => {
    if (!person.age) return '';
    return person.isAlive ? `${person.age} ans` : `† ${person.age} ans`;
  };

  return (
    <div
      onClick={onClick}
      className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
    >
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {person.profilePhotoUrl ? (
            <img src={person.profilePhotoUrl} alt={person.firstName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {person.firstName} {person.lastName}
          </h3>
          
          {person.birthDate && (
            <p className="text-sm text-gray-600">
              {new Date(person.birthDate).toLocaleDateString('fr-FR')}
              {getAge() && ` • ${getAge()}`}
            </p>
          )}

          {person.birthPlace && (
            <p className="text-sm text-gray-500">{person.birthPlace}</p>
          )}

          {person.profession && (
            <p className="text-sm text-blue-600 mt-1">{person.profession}</p>
          )}

          {!person.isAlive && (
            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              Décédé(e)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
