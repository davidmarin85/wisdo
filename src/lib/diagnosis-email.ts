// Email del diagnóstico (lo envía /api/capture con Resend).
// HTML de email: tablas y estilos en línea, porque Gmail, Outlook y compañía
// ignoran <style> y el CSS moderno. Mismos colores y orden que /diagnosis/.
//
// Todo lo que viene de Claude o de la web del usuario se escapa: el análisis
// sale de contenido de terceros y no puede meter HTML en el email.
import { BOOK_A_CALL_URL } from '@data/site';
import { toolLink } from '@lib/tool-links';
import type { Archetype, Stack } from '@lib/wisdo-engine';

export interface DiagnosisEmailParams {
  archetype: Archetype;
  stack: Stack;
  aiDiagnosis: string | null;
  resumen: string | null;
  siteHost: string | null;
  resultUrl: string;
  leadId: string;
  /** Origen absoluto de la web (https://www.wisdo.io), para los enlaces /go/. */
  siteUrl: string;
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
  return `Your stack is ready: ${stack.name}`;
}

export function buildDiagnosisEmailHtml(p: DiagnosisEmailParams): string {
  const tools = p.stack.tools
    .map((t, i) => {
      const url = toolLink(t.name, { from: 'email', lead: p.leadId, origin: p.siteUrl });
      return `
        <tr>
          <td style="padding:16px 0;border-top:1px solid ${C.border};">
            <span style="font-family:${MONO};font-size:12px;color:${C.accent};">${String(i + 1).padStart(2, '0')}</span>
            &nbsp;<strong style="font-size:15px;color:${C.text};">${esc(t.name)}</strong>
            ${t.free ? `&nbsp;<span style="font-family:${MONO};font-size:11px;color:${C.green};">FREE PLAN</span>` : ''}
            <div style="margin-top:6px;font-size:14px;line-height:1.5;color:${C.muted};">${esc(t.role)}</div>
            ${url ? `<a href="${esc(url)}" style="display:inline-block;margin-top:8px;font-size:14px;font-weight:600;color:${C.accent};text-decoration:none;">Try ${esc(t.name)} &rarr;</a>` : ''}
          </td>
        </tr>`;
    })
    .join('');

  const preheader = p.resumen ?? `Your recommended stack: ${p.stack.name}`;

  return `<!doctype html>
<html lang="en">
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
            ${eyebrow(p.siteHost ? `wisdo diagnosis · ${p.siteHost}` : 'wisdo diagnosis')}
            <h1 style="margin:14px 0 0;font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-0.6px;color:${C.text};">${esc(p.stack.name)}</h1>
            <div style="margin-top:8px;font-size:14px;color:${C.muted};">
              Estimated cost <strong style="color:${C.accent};">${esc(p.stack.cost)}</strong>
              &nbsp;·&nbsp; Profile: ${esc(p.archetype.name)}
            </div>

            ${p.resumen ? `
            <div style="margin-top:24px;">
              ${eyebrow('We analyzed your website')}
              <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:${C.soft};">${esc(p.resumen)}</p>
            </div>` : ''}

            ${p.aiDiagnosis ? `
            <div style="margin-top:24px;">
              ${eyebrow('Why this stack fits you')}
              <p style="margin:10px 0 0;padding:14px 16px;border-left:3px solid ${C.accent};background:${C.bg};font-size:15px;line-height:1.65;color:${C.soft};">${esc(p.aiDiagnosis)}</p>
            </div>` : ''}

            <div style="margin-top:24px;">${eyebrow('Your stack')}</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">${tools}</table>

            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:20px;">
              <tr>
                <td style="background:${C.text};border-radius:8px;">
                  <a href="${esc(p.resultUrl)}" style="display:inline-block;padding:13px 22px;font-size:14px;font-weight:600;color:${C.bg};text-decoration:none;">See your full diagnosis</a>
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
                  <div style="font-size:16px;font-weight:600;color:${C.text};">Want us to set it up for you?</div>
                  <div style="margin-top:6px;font-size:14px;line-height:1.55;color:${C.muted};">We’re certified HubSpot, Google and Meta partners. On a call we’ll go through your diagnosis with you and explain how we’d put it in place.</div>
                  <a href="${esc(BOOK_A_CALL_URL)}" style="display:inline-block;margin-top:12px;font-size:14px;font-weight:600;color:${C.accent};text-decoration:none;">Book a call &rarr;</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 4px 0;font-size:12px;line-height:1.6;color:${C.faint};">
            Some links in this email are affiliate links: if you sign up through them we may earn a commission, at no extra cost to you.<br><br>
            You’re receiving this email because you requested a diagnosis on wisdo.io. Keep it: your diagnosis is always at the link above.
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
    `Your stack: ${p.stack.name} (${p.stack.cost})`,
    `Profile: ${p.archetype.name}`,
    '',
  ];
  if (p.resumen) lines.push('We analyzed your website', p.resumen, '');
  if (p.aiDiagnosis) lines.push('Why this stack fits you', p.aiDiagnosis, '');
  lines.push('Your stack');
  p.stack.tools.forEach((t, i) => {
    const url = toolLink(t.name, { from: 'email', lead: p.leadId, origin: p.siteUrl });
    lines.push(`${i + 1}. ${t.name}: ${t.role}${url ? ` (${url})` : ''}`);
  });
  lines.push(
    '',
    `See your full diagnosis: ${p.resultUrl}`,
    '',
    `Want us to set it up for you? Book a call: ${BOOK_A_CALL_URL}`,
    '',
    'Some links in this email are affiliate links: if you sign up through them we may earn a commission, at no extra cost to you.'
  );
  return lines.join('\n');
}
