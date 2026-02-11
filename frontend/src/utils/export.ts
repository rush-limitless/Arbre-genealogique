// Export utilities

export const exportToGEDCOM = (persons: any[]) => {
  let gedcom = '0 HEAD\n1 SOUR Arbre Généalogique\n1 GEDC\n2 VERS 5.5.1\n1 CHAR UTF-8\n';
  
  persons.forEach((person, index) => {
    const id = `@I${index + 1}@`;
    gedcom += `0 ${id} INDI\n`;
    gedcom += `1 NAME ${person.firstName} /${person.lastName}/\n`;
    gedcom += `2 GIVN ${person.firstName}\n`;
    gedcom += `2 SURN ${person.lastName}\n`;
    gedcom += `1 SEX ${person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : 'U'}\n`;
    
    if (person.birthDate) {
      gedcom += `1 BIRT\n`;
      gedcom += `2 DATE ${new Date(person.birthDate).toLocaleDateString('en-GB')}\n`;
      if (person.birthPlace) gedcom += `2 PLAC ${person.birthPlace}\n`;
    }
    
    if (person.deathDate) {
      gedcom += `1 DEAT\n`;
      gedcom += `2 DATE ${new Date(person.deathDate).toLocaleDateString('en-GB')}\n`;
    }
    
    if (person.profession) {
      gedcom += `1 OCCU ${person.profession}\n`;
    }
    
    if (person.biography) {
      gedcom += `1 NOTE ${person.biography}\n`;
    }
  });
  
  gedcom += '0 TRLR\n';
  return gedcom;
};

export const downloadGEDCOM = (persons: any[]) => {
  const gedcom = exportToGEDCOM(persons);
  const blob = new Blob([gedcom], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arbre-genealogique-${Date.now()}.ged`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToJSON = (persons: any[]) => {
  const json = JSON.stringify(persons, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arbre-genealogique-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = (persons: any[]) => {
  const headers = ['Prénom', 'Nom', 'Sexe', 'Date de naissance', 'Lieu de naissance', 'Profession', 'Biographie'];
  const rows = persons.map(p => [
    p.firstName,
    p.lastName,
    p.gender,
    p.birthDate ? new Date(p.birthDate).toLocaleDateString('fr-FR') : '',
    p.birthPlace || '',
    p.profession || '',
    p.biography || ''
  ]);
  
  const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `arbre-genealogique-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
