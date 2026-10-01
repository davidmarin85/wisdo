// Forma de un lead tal y como lo pintan el informe del diagnóstico
// (components/diagnosis/DiagnosisReport.astro) y el dashboard.
import type { QuizAnswers } from '@lib/wisdo-engine';

export interface ReportWebsiteProfile {
  resumen?: string;
  modelo_negocio?: string;
  servicios?: string[];
  nicho?: string;
  cliente_ideal?: string;
  confianza?: string;
  detected_tools?: string[];
}

export interface ReportLead {
  id: string;
  problema_raiz: string;
  tipo_negocio: string | null;
  etapa: string | null;
  archetype: string | null;
  stack_key: string | null;
  answers_raw: QuizAnswers | null;
  ai_diagnosis: string | null;
  website_url: string | null;
  website_profile: ReportWebsiteProfile | null;
}

/** Columnas de leads que necesita el informe. Nunca incluir el email:
 *  el informe público se sirve a quien tenga el enlace. */
export const REPORT_COLUMNS =
  'id, problema_raiz, tipo_negocio, etapa, archetype, stack_key, answers_raw, ai_diagnosis, website_url, website_profile';
