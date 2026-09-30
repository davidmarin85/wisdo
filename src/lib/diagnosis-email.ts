// Email del diagnóstico (lo envía /api/capture con Resend).
// HTML de email: tablas y estilos en línea, porque Gmail, Outlook y compañía
// ignoran <style> y el CSS moderno. Mismos colores y orden que /resultado/.
//
// Todo lo que viene de Claude o de la web del usuario se escapa: el análisis
// sale de contenido de terceros y no puede meter HTML en el email.
import { BOOK_A_CALL_URL } from '@data/site';
import { toolUrl } from '@lib/tool-links';
import type { Archetype, Stack } from '@lib/wisdo-engine';

export interface DiagnosisEmailParams {
  archetype: Archetype;
  stack: Stack;
  aiDiagnosis: string | null;
  resumen: string | null;
  siteHost: string | null;
  resultUrl: string;
}

const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: '#1e1e1e',
  text: '#ffffff',
  soft: '#e6e6e6',
  muted: '#a7a7a7',
  faint: '#7c7c7c',
  accent: '#6798ff',
  green: '#13c28a',
};
const SANS = "Inter,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'JetBrains Mono',Menlo,Consolas,monospace";

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function eyebrow(text: string): string {
  return `<div style="font-family:${MONO};font-size:11px;letter-spacing:0.8px;text-transform:uppercase;color:${C.muted};">${esc(text)}</div>`;
}

export function diagnosisEmailSubject(stack: Stack): string {
  return `Tu stack está listo: ${stack.name}`;
}

export function buildDiagnosisEmailHtml(p: DiagnosisEmailParams): string {
  const tools = p.stack.tools
    .map((t, i) => {
      const url = toolUrl(t.name);
      return `
        <tr>
          <td style="padding:16px 0;border-top:1px solid ${C.border};">
            <span style="font-family:${MONO};font-size:12px;color:${C.accent};">${String(i + 1).padStart(2, '0')}</span>
            &nbsp;<strong style="font-size:15px;color:${C.text};">${esc(t.name)}</strong>
            ${t.free ? `&nbsp;<span style="font-family:${MONO};font-size:11px;color:${C.green};">PLAN GRATIS</span>` : ''}
            <div style="margin-top:6px;font-size:14px;line-height:1.5;color:${C.muted};">${esc(t.role)}</div>
            ${url ? `<a href="${esc(url)}" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:600;color:${C.accent};text-decoration:none;">Probar ${esc(t.name)} &rarr;</a>` : ''}
          </td>
        </tr>`;
    })
    .join('');

  const preheader = p.resumen ?? `Tu stack recomendado: ${p.stack.name}`;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(diagnosisEmailSubject(p.stack))}</title>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;font-family:${SANS};color:${C.text};">

        <tr>
          <td style="padding:0 4px 24px;font-size:17px;font-weight:600;letter-spacing:-0.2px;">
            <span style="color:${C.green};">&#9679;</span>&nbsp;wisdo
          </td>
        </tr>

        <tr>
          <td style="background:${C.card};border:1px solid ${C.border};border-radius:10px;padding:28px;">
            ${eyebrow(p.siteHost ? `Diagnóstico wisdo · ${p.siteHost}` : 'Diagnóstico wisdo')}
            <h1 style="margin:14px 0 0;font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-0.6px;color:${C.text};">${esc(p.stack.name)}</h1>
            <div style="margin-top:8px;font-size:14px;color:${C.muted};">
              Coste estimado <strong style="color:${C.accent};">${esc(p.stack.cost)}</strong>
              &nbsp;·&nbsp; Perfil ${esc(p.archetype.name)}
            </div>

            ${p.resumen ? `
            <div style="margin-top:24px;">
              ${eyebrow('Hemos analizado tu web')}
              <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:${C.soft};">${esc(p.resumen)}</p>
            </div>` : ''}

            ${p.aiDiagnosis ? `
            <div style="margin-top:24px;">
              ${eyebrow('Por qué este stack es para ti')}
              <p style="margin:10px 0 0;padding:14px 16px;border-left:3px solid ${C.accent};background:${C.bg};font-size:15px;line-height:1.65;color:${C.soft};">${esc(p.aiDiagnosis)}</p>
            </div>` : ''}

            <div style="margin-top:24px;">${eyebrow('Tu stack')}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${tools}</table>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="background:${C.text};border-radius:8px;">
                  <a href="${esc(p.resultUrl)}" style="display:inline-block;padding:13px 22px;font-size:14px;font-weight:600;color:${C.bg};text-decoration:none;">Ver tu diagnóstico completo</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 4px 0;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:10px;">
              <tr>
                <td style="padding:20px 24px;">
                  <div style="font-size:16px;font-weight:600;color:${C.text};">¿Te lo montamos nosotros?</div>
                  <div style="margin-top:6px;font-size:14px;line-height:1.55;color:${C.muted};">Somos partners certificados de HubSpot, Google y Meta. En una llamada revisamos tu diagnóstico contigo y te contamos cómo lo pondríamos en marcha.</div>
                  <a href="${esc(BOOK_A_CALL_URL)}" style="display:inline-block;margin-top:12px;font-size:14px;font-weight:600;color:${C.accent};text-decoration:none;">Reservar una llamada &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 4px 0;font-size:12px;line-height:1.6;color:${C.faint};">
            Recibes este email porque pediste un diagnóstico en wisdo.io. Guárdalo: tu diagnóstico está siempre en el enlace de arriba.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// Versión en texto plano: la leen algunos clientes y mejora la entrega.
export function buildDiagnosisEmailText(p: DiagnosisEmailParams): string {
  const lines = [
    `Tu stack: ${p.stack.name} (${p.stack.cost})`,
    `Perfil: ${p.archetype.name}`,
    '',
  ];
  if (p.resumen) lines.push('Hemos analizado tu web', p.resumen, '');
  if (p.aiDiagnosis) lines.push('Por qué este stack es para ti', p.aiDiagnosis, '');
  lines.push('Tu stack');
  p.stack.tools.forEach((t, i) => {
    const url = toolUrl(t.name);
    lines.push(`${i + 1}. ${t.name}: ${t.role}${url ? ` (${url})` : ''}`);
  });
  lines.push(
    '',
    `Ver tu diagnóstico completo: ${p.resultUrl}`,
    '',
    `¿Te lo montamos nosotros? Reserva una llamada: ${BOOK_A_CALL_URL}`
  );
  return lines.join('\n');
}
