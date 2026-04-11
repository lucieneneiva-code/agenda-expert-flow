export interface Area {
  id: string;
  name: string;
  icon: string;
  default_meta: number | null;
  color: string;
}

export interface PEC {
  id: string;
  name: string;
  area_id: string;
  custom_meta: number | null;
  active: boolean;
}

export interface School {
  id: string;
  name: string;
  active: boolean;
}

export interface PecSchoolAccess {
  pec_id: string;
  school_id: string;
}

export interface Fortnight {
  id: string;
  code: string;
  label: string;
  order: number;
}

export interface FortnightDay {
  id: string;
  fortnight_id: string;
  date: string;
  day_order: number;
}

export type Period = 'manha' | 'tarde';

export type ActivityType =
  | 'Visita à Escola'
  | 'Recomposição de Habilidades'
  | 'Análise de Dados de Aprendizagem'
  | 'Planejamento de Intervenção Pedagógica'
  | 'Apoio ao CGP'
  | 'Outros';

export const ACTIVITY_TYPES: ActivityType[] = [
  'Visita à Escola',
  'Outros',
];

export const RECOMPOSICAO_ACTIVITY_TYPES: ActivityType[] = [
  'Recomposição de Habilidades',
  'Análise de Dados de Aprendizagem',
  'Planejamento de Intervenção Pedagógica',
  'Apoio ao CGP',
  'Visita à Escola',
  'Outros',
];

export interface AgendaEntry {
  id: string;
  pec_id: string;
  area_id: string;
  fortnight_id: string;
  day_id: string;
  period: Period;
  activity_type: ActivityType;
  school_id: string | null;
  school_other_text: string | null;
  observation: string | null;
  agenda_topic: string | null;
  link: string | null;
  type_other_text: string | null;
  status_visita: string | null;
  link_termo: string | null;
  data_confirmacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalVisits: number;
  schoolsVisited: number;
  schoolsNotVisited: number;
  pecWithoutAgenda: number;
  pecBelowMeta: number;
}
