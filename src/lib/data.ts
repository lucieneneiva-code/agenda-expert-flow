import { Area, PEC, School, Fortnight, FortnightDay, PecSchoolAccess } from './types';

export const AREAS: Area[] = [
  { id: 'qualidade', name: 'PEC Qualidade da Aula', icon: '📚', default_meta: 8, color: 'from-blue-500 to-blue-600' },
  { id: 'curricular', name: 'PEC Desenvolvimento Curricular', icon: '📋', default_meta: null, color: 'from-emerald-500 to-emerald-600' },
  { id: 'especial', name: 'PEC Educação Especial', icon: '♿', default_meta: 4, color: 'from-purple-500 to-purple-600' },
  { id: 'conviva', name: 'PEC Conviva', icon: '🤝', default_meta: 8, color: 'from-amber-500 to-amber-600' },
  { id: 'multiplica', name: 'PEC Multiplica', icon: '✖️', default_meta: null, color: 'from-teal-500 to-teal-600' },
  { id: 'recomposicao', name: 'PEC Recomposição', icon: '🔄', default_meta: 4, color: 'from-rose-500 to-rose-600' },
];

// IDs of areas to show on the home screen
export const HOME_AREA_IDS = ['qualidade', 'curricular', 'especial', 'conviva', 'multiplica'];

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
  { name: 'Edilene', meta: 7, schools: ['ADRIAO BERNARDES', 'CARLOS AYRES', 'CARLOS MORAES', 'ESTHER', 'MARIO ARMINANTE', 'SAMUEL WAINER', 'VERA ATHAYDE'] },
  { name: 'Silvia', meta: null, schools: ['ALEXANDRE ANSALDO', 'CANDIDO OLIVEIRA', 'EVANDRO LINS', 'ITIRO MUTO', 'JACOB', 'JOAO GOULART', 'JOSE BENTO', 'RENE MUAWAD'] },
  { name: 'Marjorie', meta: null, schools: ['ALEXANDRE MARCONDES', 'ANA MARIA', 'ANIZ BADRA', 'AYRTON SENNA', 'ITURBIDES', 'NAIR DAMIAO', 'ROSSINE', 'VICENTINA'] },
  { name: 'Evelyn', meta: null, schools: ['CHRISTIANO ALTENFELDER', 'HILTON REIS', 'ILDA VIEIRA', 'JOAQUIM ALVARES', 'JOSE EPHIM', 'JOSE VIEIRA', 'LEONOR', 'MARIA LUIZA ROQUE'] },
  { name: 'Camila', meta: null, schools: [] }, // all schools
];

// Desenvolvimento Curricular PECs
const curricularPecNames = ['Julio', 'Sirlene', 'Valéria', 'Marcone', 'Manoel', 'Noel', 'Roger', 'Camila', 'Janaína', 'Edilian', 'Elenilson'];

// Educação Especial PECs
const especialPecNames = ['Osvaldo', 'Elaine'];

// Conviva PECs
const convivaPecNames = ['Márcia', 'Maria Caroline'];

// Multiplica PECs
const multiplicaPecNames = ['Danila', 'Rosemari'];

// Recomposição PECs
const recomposicaoPecNames = ['Rodrigo'];

export const PECS: PEC[] = [
  ...qualidadePecs.map((p, i) => ({
    id: `pec-qa-${i + 1}`,
    name: p.name,
    area_id: 'qualidade',
    custom_meta: p.meta,
    active: true,
  })),
  // Desenvolvimento Curricular
  ...curricularPecNames.map((name, i) => ({
    id: `pec-dc-${i + 1}`,
    name,
    area_id: 'curricular',
    custom_meta: null,
    active: true,
  })),
  // Educação Especial
  ...especialPecNames.map((name, i) => ({
    id: `pec-ee-${i + 1}`,
    name,
    area_id: 'especial',
    custom_meta: null,
    active: true,
  })),
  // Conviva
  ...convivaPecNames.map((name, i) => ({
    id: `pec-cv-${i + 1}`,
    name,
    area_id: 'conviva',
    custom_meta: null,
    active: true,
  })),
  // Multiplica
  ...multiplicaPecNames.map((name, i) => ({
    id: `pec-mp-${i + 1}`,
    name,
    area_id: 'multiplica',
    custom_meta: null,
    active: true,
  })),
  // Recomposição
  ...recomposicaoPecNames.map((name, i) => ({
    id: `pec-rc-${i + 1}`,
    name,
    area_id: 'recomposicao',
    custom_meta: null,
    active: true,
  })),
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
  
  // All PECs from curricular, especial, conviva, multiplica, recomposicao get access to all schools
  const allSchoolAreaPrefixes = ['pec-dc-', 'pec-ee-', 'pec-cv-', 'pec-mp-', 'pec-rc-'];
  PECS.filter(p => allSchoolAreaPrefixes.some(prefix => p.id.startsWith(prefix))).forEach(pec => {
    SCHOOLS.forEach(s => access.push({ pec_id: pec.id, school_id: s.id }));
  });
  
  return access;
})();

// Fixed fortnight date ranges for 2026 (23 quinzenas)
const FORTNIGHT_RANGES: { start: string; end: string }[] = [
  { start: '2026-02-23', end: '2026-03-06' }, // Q1
  { start: '2026-03-09', end: '2026-03-20' }, // Q2
  { start: '2026-03-23', end: '2026-04-03' }, // Q3
  { start: '2026-04-06', end: '2026-04-17' }, // Q4
  { start: '2026-04-20', end: '2026-05-01' }, // Q5
  { start: '2026-05-04', end: '2026-05-15' }, // Q6
  { start: '2026-05-18', end: '2026-05-29' }, // Q7
  { start: '2026-06-01', end: '2026-06-12' }, // Q8
  { start: '2026-06-15', end: '2026-06-26' }, // Q9
  { start: '2026-06-29', end: '2026-07-10' }, // Q10
  { start: '2026-07-13', end: '2026-07-24' }, // Q11
  { start: '2026-07-27', end: '2026-08-07' }, // Q12
  { start: '2026-08-10', end: '2026-08-21' }, // Q13
  { start: '2026-08-24', end: '2026-09-04' }, // Q14
  { start: '2026-09-07', end: '2026-09-18' }, // Q15
  { start: '2026-09-21', end: '2026-10-02' }, // Q16
  { start: '2026-10-05', end: '2026-10-16' }, // Q17
  { start: '2026-10-19', end: '2026-10-30' }, // Q18
  { start: '2026-11-02', end: '2026-11-13' }, // Q19
  { start: '2026-11-16', end: '2026-11-27' }, // Q20
  { start: '2026-11-30', end: '2026-12-11' }, // Q21
  { start: '2026-12-14', end: '2026-12-25' }, // Q22
  { start: '2026-12-28', end: '2026-12-31' }, // Q23
];

function formatDateBR(isoDate: string): string {
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export const FORTNIGHTS: Fortnight[] = FORTNIGHT_RANGES.map((range, i) => {
  const num = i + 1;
  const code = `Q${num.toString().padStart(2, '0')}`;
  const startBR = formatDateBR(range.start);
  const endBR = formatDateBR(range.end);
  // Display as "dd/mm" only
  const startShort = startBR.substring(0, 5);
  const endShort = endBR.substring(0, 5);
  return {
    id: `fortnight-${num}`,
    code,
    label: `Quinzena ${num} – de ${startShort} a ${endShort}`,
    order: num,
  };
});

// Generate fortnight days from the fixed date ranges (10 working days)
export function generateFortnightDays(fortnightId: string, fortnightOrder: number): FortnightDay[] {
  const rangeIndex = fortnightOrder - 1;
  const range = FORTNIGHT_RANGES[rangeIndex];
  if (!range) return [];

  const days: FortnightDay[] = [];
  let dayCount = 0;
  const currentDate = new Date(range.start + 'T12:00:00');
  const endDate = new Date(range.end + 'T12:00:00');

  while (currentDate <= endDate) {
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

export function getDayDate(dayId: string): string | null {
  // dayId format: "fortnight-{N}-day-{M}"
  const match = dayId.match(/^fortnight-(\d+)-day-(\d+)$/);
  if (!match) return null;
  const fortnightOrder = parseInt(match[1], 10);
  const dayOrder = parseInt(match[2], 10);
  const fortnight = FORTNIGHTS.find(f => f.order === fortnightOrder);
  if (!fortnight) return null;
  const days = generateFortnightDays(fortnight.id, fortnightOrder);
  const day = days.find(d => d.day_order === dayOrder);
  return day?.date ?? null;
}

export function getSchoolsForPec(pecId: string): School[] {
  const accessIds = PEC_SCHOOL_ACCESS
    .filter(a => a.pec_id === pecId)
    .map(a => a.school_id);
  return SCHOOLS.filter(s => accessIds.includes(s.id)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
