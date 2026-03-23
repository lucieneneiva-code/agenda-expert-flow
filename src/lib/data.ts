import { Area, PEC, School, Fortnight, FortnightDay, PecSchoolAccess } from './types';

export const AREAS: Area[] = [
  { id: 'qualidade', name: 'PEC Qualidade da Aula', icon: '📚', default_meta: 8, color: 'from-blue-500 to-blue-600' },
  { id: 'curricular', name: 'PEC Desenvolvimento Curricular', icon: '📋', default_meta: null, color: 'from-emerald-500 to-emerald-600' },
  { id: 'conviva', name: 'PEC Conviva', icon: '🤝', default_meta: 8, color: 'from-amber-500 to-amber-600' },
  { id: 'especial', name: 'PEC Educação Especial', icon: '♿', default_meta: 4, color: 'from-purple-500 to-purple-600' },
  { id: 'recomposicao', name: 'PEC Recomposição', icon: '🔄', default_meta: 4, color: 'from-rose-500 to-rose-600' },
  { id: 'multiplica', name: 'PEC Multiplica', icon: '✖️', default_meta: null, color: 'from-teal-500 to-teal-600' },
];

// Schools
const schoolNames = [
  'AURELIO CAMPOS', 'ELOELY NAMBU', 'JAYR DE ANDRADE', 'JERONYMO MONTEIRO',
  'JORGE SARAIVA', 'MADRE DOMINEUC', 'NEIVA DE LOURDES', 'VICENTE DE PAULO',
  'ADA PELLEGRINI', 'ANTONIO CANDIDO', 'HOMERO VAZ', 'JOSE XAVIER',
  'LEONEL BRIZOLA', 'GAIVOTAS II', 'OTONIEL ASSIS', 'SAVERIO',
  'ERNESTO NAZARETH', 'AFRANIO', 'ALBERTO SALOTTI', 'ARGEO PINTO',
  'ERODICE', 'JUVENTINA', 'ROBERTO MANGE', 'SERGIO RADUAN', 'WASHINGTON NATEL',
  'ADELAIDE ROSA', 'VALDIR CONCEIÇÃO', 'EMILIO WARWICK', 'EURIPEDES',
  'FRANCISCO ROSWELL', 'HEITOR VILLA', 'IRMA CHARLITA', 'JARDIM NORONHA', 'MARLENE ADUA',
  'BEATRIZ LOPES', 'CALHIM ABUD', 'FRANCISCO JOAO', 'JOSE DUARTE',
  'JOSE GERALDO', 'LAERTE RAMOS', 'TANCREDO',
  'ANA LUIZA', 'CARLOS CATTONY', 'DAVID ZEIGER', 'JESUS ATTAB',
  'LUCAS RASQUINHO', 'MARIA SINISGALLI', 'MARISTELA', 'PRISCILIANA',
  'BENEDITO CELIO', 'BENEDITO FERREIRA', 'CLAUDIRENE', 'DUARTE LEOPOLDO',
  'GIULIO LEONE', 'HERBERT BALDUS', 'HERMINIO', 'MARIAZINHA',
  'ADOLFO CASAIS', 'CALLIA', 'CONDOMINIO VARGEM', 'LEDA GUIMARAES',
  'PAULINO', 'PERILLIER', 'REGINA MIRANDA',
  'ANTONIO PEREIRA', 'CLARICE IKEDA', 'LEVI CARNEIRO', 'MARIA AMELIA',
  'MARIA JUVENAL', 'MARIO LOPES', 'SANTO DIAS',
  'ADRIAO BERNARDES', 'CARLOS AYRES', 'CARLOS MORAES', 'ESTHER',
  'MARIO ARMINANTE', 'SAMUEL WAINER', 'VERA ATHAYDE',
  'ALEXANDRE ANSALDO', 'CANDIDO OLIVEIRA', 'EVANDRO LINS', 'ITIRO MUTO',
  'JACOB', 'JOAO GOULART', 'JOSE BENTO', 'RENE MUAWAD',
  'ALEXANDRE MARCONDES', 'ANA MARIA', 'ANIZ BADRA', 'AYRTON SENNA',
  'ITURBIDES', 'NAIR DAMIAO', 'ROSSINE', 'VICENTINA',
  'CHRISTIANO ALTENFELDER', 'HILTON REIS', 'ILDA VIEIRA', 'JOAQUIM ALVARES',
  'JOSE EPHIM', 'JOSE VIEIRA', 'LEONOR', 'MARIA LUIZA ROQUE',
];

export const SCHOOLS: School[] = schoolNames.map((name, i) => ({
  id: `school-${i + 1}`,
  name,
  active: true,
}));

// PECs for Qualidade da Aula
const qualidadePecs: { name: string; meta: number | null; schools: string[] }[] = [
  { name: 'Aline', meta: null, schools: ['AURELIO CAMPOS', 'ELOELY NAMBU', 'JAYR DE ANDRADE', 'JERONYMO MONTEIRO', 'JORGE SARAIVA', 'MADRE DOMINEUC', 'NEIVA DE LOURDES', 'VICENTE DE PAULO'] },
  { name: 'Caroline', meta: null, schools: ['ADA PELLEGRINI', 'ANTONIO CANDIDO', 'HOMERO VAZ', 'JOSE XAVIER', 'LEONEL BRIZOLA', 'GAIVOTAS II', 'OTONIEL ASSIS', 'SAVERIO'] },
  { name: 'Dalila', meta: 9, schools: ['ERNESTO NAZARETH', 'AFRANIO', 'ALBERTO SALOTTI', 'ARGEO PINTO', 'ERODICE', 'JUVENTINA', 'ROBERTO MANGE', 'SERGIO RADUAN', 'WASHINGTON NATEL'] },
  { name: 'Magali', meta: 9, schools: ['ADELAIDE ROSA', 'VALDIR CONCEIÇÃO', 'EMILIO WARWICK', 'EURIPEDES', 'FRANCISCO ROSWELL', 'HEITOR VILLA', 'IRMA CHARLITA', 'JARDIM NORONHA', 'MARLENE ADUA'] },
  { name: 'Noemi', meta: 7, schools: ['BEATRIZ LOPES', 'CALHIM ABUD', 'FRANCISCO JOAO', 'JOSE DUARTE', 'JOSE GERALDO', 'LAERTE RAMOS', 'TANCREDO'] },
  { name: 'Helaine', meta: null, schools: ['ANA LUIZA', 'CARLOS CATTONY', 'DAVID ZEIGER', 'JESUS ATTAB', 'LUCAS RASQUINHO', 'MARIA SINISGALLI', 'MARISTELA', 'PRISCILIANA'] },
  { name: 'Fabiano', meta: null, schools: ['BENEDITO CELIO', 'BENEDITO FERREIRA', 'CLAUDIRENE', 'DUARTE LEOPOLDO', 'GIULIO LEONE', 'HERBERT BALDUS', 'HERMINIO', 'MARIAZINHA'] },
  { name: 'Verônica', meta: 7, schools: ['ADOLFO CASAIS', 'CALLIA', 'CONDOMINIO VARGEM', 'LEDA GUIMARAES', 'PAULINO', 'PERILLIER', 'REGINA MIRANDA'] },
  { name: 'Gislaine', meta: 7, schools: ['ANTONIO PEREIRA', 'CLARICE IKEDA', 'LEVI CARNEIRO', 'MARIA AMELIA', 'MARIA JUVENAL', 'MARIO LOPES', 'SANTO DIAS'] },
  { name: 'Edilene', meta: null, schools: ['ADRIAO BERNARDES', 'CARLOS AYRES', 'CARLOS MORAES', 'ESTHER', 'MARIO ARMINANTE', 'SAMUEL WAINER', 'VERA ATHAYDE'] },
  { name: 'Silvia', meta: null, schools: ['ALEXANDRE ANSALDO', 'CANDIDO OLIVEIRA', 'EVANDRO LINS', 'ITIRO MUTO', 'JACOB', 'JOAO GOULART', 'JOSE BENTO', 'RENE MUAWAD'] },
  { name: 'Marjorie', meta: null, schools: ['ALEXANDRE MARCONDES', 'ANA MARIA', 'ANIZ BADRA', 'AYRTON SENNA', 'ITURBIDES', 'NAIR DAMIAO', 'ROSSINE', 'VICENTINA'] },
  { name: 'Evelyn', meta: null, schools: ['CHRISTIANO ALTENFELDER', 'HILTON REIS', 'ILDA VIEIRA', 'JOAQUIM ALVARES', 'JOSE EPHIM', 'JOSE VIEIRA', 'LEONOR', 'MARIA LUIZA ROQUE'] },
  { name: 'Camila', meta: null, schools: [] }, // all schools
];

export const PECS: PEC[] = [
  ...qualidadePecs.map((p, i) => ({
    id: `pec-qa-${i + 1}`,
    name: p.name,
    area_id: 'qualidade',
    custom_meta: p.meta,
    active: true,
  })),
  // Dev Curricular
  { id: 'pec-dc-1', name: 'PEC Curricular 1', area_id: 'curricular', custom_meta: null, active: true },
  // Conviva
  { id: 'pec-cv-1', name: 'PEC Conviva 1', area_id: 'conviva', custom_meta: null, active: true },
  // Educação Especial
  { id: 'pec-ee-1', name: 'PEC Ed. Especial 1', area_id: 'especial', custom_meta: null, active: true },
  // Recomposição
  { id: 'pec-rc-1', name: 'PEC Recomposição 1', area_id: 'recomposicao', custom_meta: null, active: true },
  // Multiplica
  { id: 'pec-mp-1', name: 'PEC Multiplica 1', area_id: 'multiplica', custom_meta: null, active: true },
];

// PEC-School access mapping
export const PEC_SCHOOL_ACCESS: PecSchoolAccess[] = (() => {
  const access: PecSchoolAccess[] = [];
  
  qualidadePecs.forEach((p, i) => {
    const pecId = `pec-qa-${i + 1}`;
    if (p.name === 'Camila') {
      // All schools
      SCHOOLS.forEach(s => access.push({ pec_id: pecId, school_id: s.id }));
    } else {
      p.schools.forEach(schoolName => {
        const school = SCHOOLS.find(s => s.name === schoolName);
        if (school) access.push({ pec_id: pecId, school_id: school.id });
      });
    }
  });
  
  // Areas with access to all schools
  ['pec-dc-1', 'pec-ee-1', 'pec-rc-1', 'pec-mp-1', 'pec-cv-1'].forEach(pecId => {
    SCHOOLS.forEach(s => access.push({ pec_id: pecId, school_id: s.id }));
  });
  
  return access;
})();

// Fortnights Q03 to Q21
export const FORTNIGHTS: Fortnight[] = Array.from({ length: 19 }, (_, i) => {
  const num = i + 3;
  const code = `Q${num.toString().padStart(2, '0')}`;
  return {
    id: `fortnight-${num}`,
    code,
    label: `Quinzena ${code}`,
    order: num,
  };
});

// Helper to generate fortnight days (10 working days per fortnight)
export function generateFortnightDays(fortnightId: string, fortnightOrder: number): FortnightDay[] {
  // Generate placeholder dates - in production these would come from DB
  const baseYear = 2025;
  const startWeek = (fortnightOrder - 3) * 2 + 5; // approximate weeks
  const days: FortnightDay[] = [];
  
  let dayCount = 0;
  let currentDate = new Date(baseYear, 0, 1);
  currentDate.setDate(currentDate.getDate() + (startWeek * 7));
  
  while (dayCount < 10) {
    const dow = currentDate.getDay();
    if (dow !== 0 && dow !== 6) {
      dayCount++;
      days.push({
        id: `${fortnightId}-day-${dayCount}`,
        fortnight_id: fortnightId,
        date: currentDate.toISOString().split('T')[0],
        day_order: dayCount,
      });
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}

export function getPecMeta(pec: PEC, area: Area): number | null {
  if (pec.custom_meta !== null) return pec.custom_meta;
  return area.default_meta;
}

export function getSchoolsForPec(pecId: string): School[] {
  const accessIds = PEC_SCHOOL_ACCESS
    .filter(a => a.pec_id === pecId)
    .map(a => a.school_id);
  return SCHOOLS.filter(s => accessIds.includes(s.id));
}
