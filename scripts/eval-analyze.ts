// Compara modelos en el análisis de webs de /api/analyze, con el mismo prompt
// y el mismo esquema que usa la web (src/lib/website-profile.ts).
//
// Uso (desde la raíz del proyecto, con ANTHROPIC_API_KEY en .env):
//   npx tsx --env-file=.env --tsconfig tsconfig.json scripts/eval-analyze.ts
//   … --repeat 2         repite cada análisis para medir la consistencia
//   … --sites a.com,b.io usa otras webs
//
// Coste orientativo: ~$1 con las 15 webs por defecto y --repeat 1.
// Escribe los resultados en scripts/eval-results/.
import Anthropic from '@anthropic-ai/sdk';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readSite, type SiteSnapshot } from '@lib/site-reader';
import { usageCostUsd } from '@lib/ai-usage';
import { ANALYZE_MODELS, profileWebsite, type AnalyzeModel, type WebsiteProfile } from '@lib/website-profile';

// Mezcla de tipos de negocio y tamaños, sobre todo de España y LatAm.
const DEFAULT_SITES = [
  'wisdo.io', // agencia pequeña
  'flat101.es', // agencia
  'cyberclick.es', // agencia
  'wearemarketing.com', // agencia
  'holded.com', // SaaS
  'getquipu.com', // SaaS
  'woffu.com', // SaaS
  'signaturit.com', // SaaS
  'hawkersco.com', // ecommerce
  'singularu.com', // ecommerce
  'mrwonderfulshop.es', // ecommerce
  'juanmerodio.com', // consultor
  'vilmanunez.com', // consultora
  'hubspot.com', // SaaS grande (escalando)
  'cellercanroca.com', // restaurante (otro)
];

interface Run {
  site: string;
  model: AnalyzeModel;
  respondedModel: string;
  profile: WebsiteProfile | null;
  costUsd: number | null;
  inputTokens: number;
  outputTokens: number;
  ms: number;
  error?: string;
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Falta ANTHROPIC_API_KEY. Añádela a .env y ejecuta con --env-file=.env');
    process.exit(1);
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const sites = arg('sites')?.split(',') ?? DEFAULT_SITES;
  const repeat = Number(arg('repeat') ?? 1);
  const runs: Run[] = [];
  const unreadable: string[] = [];

  for (const site of sites) {
    let snapshot: SiteSnapshot;
    try {
      snapshot = await readSite(site);
    } catch (e) {
      console.log(`✗ ${site}: no se pudo leer (${(e as Error).message})`);
      unreadable.push(site);
      continue;
    }

    // Los tres modelos en paralelo sobre la misma lectura de la web.
    for (let r = 0; r < repeat; r++) {
      const results = await Promise.all(
        ANALYZE_MODELS.map(async (model): Promise<Run> => {
          const t0 = Date.now();
          try {
            const { profile, model: responded, usage } = await profileWebsite(client, snapshot, model);
            return {
              site, model, respondedModel: responded, profile,
              costUsd: usageCostUsd(responded, usage),
              inputTokens: usage.input_tokens ?? 0,
              outputTokens: usage.output_tokens ?? 0,
              ms: Date.now() - t0,
            };
          } catch (e) {
            return {
              site, model, respondedModel: model, profile: null, costUsd: null,
              inputTokens: 0, outputTokens: 0, ms: Date.now() - t0, error: (e as Error).message,
            };
          }
        })
      );
      runs.push(...results);
      console.log(
        `✓ ${site}` + (repeat > 1 ? ` #${r + 1}` : '') + ': ' +
          results.map((x) => `${x.model.replace('claude-', '')}=${x.profile ? `${x.profile.tipo_negocio}/${x.profile.etapa}` : 'ERROR'}`).join('  ')
      );
    }
  }

  // — Resumen —
  const reference: AnalyzeModel = 'claude-opus-5-5';
  const lines: string[] = [`# Comparación de modelos: análisis de webs`, '', `Fecha: ${new Date().toISOString()}`, `Webs: ${sites.length} (${unreadable.length} sin leer) · repeticiones: ${repeat}`, ''];

  lines.push('## Resumen por modelo', '', '| Modelo | Coste medio | Tokens entrada / salida (media) | Latencia media | Errores | tipo = Opus | etapa = Opus |', '|---|---|---|---|---|---|---|');
  for (const model of ANALYZE_MODELS) {
    const mine = runs.filter((r) => r.model === model);
    const ok = mine.filter((r) => r.profile);
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
    let sameTipo = 0;
    let sameEtapa = 0;
    let compared = 0;
    for (const r of ok) {
      const ref = runs.find((x) => x.site === r.site && x.model === reference && x.profile);
      if (!ref || model === reference) continue;
      compared++;
      if (ref.profile!.tipo_negocio === r.profile!.tipo_negocio) sameTipo++;
      if (ref.profile!.etapa === r.profile!.etapa) sameEtapa++;
    }
    lines.push(
      `| ${model} | $${avg(ok.map((r) => r.costUsd ?? 0)).toFixed(4)} | ${Math.round(avg(ok.map((r) => r.inputTokens)))} / ${Math.round(avg(ok.map((r) => r.outputTokens)))} | ${(avg(ok.map((r) => r.ms)) / 1000).toFixed(1)} s | ${mine.length - ok.length} | ${model === reference ? '—' : `${sameTipo}/${compared}`} | ${model === reference ? '—' : `${sameEtapa}/${compared}`} |`
    );
  }

  if (repeat > 1) {
    lines.push('', '## Consistencia (misma web, varias repeticiones)', '', '| Modelo | Webs con la misma etapa en todas las repeticiones |', '|---|---|');
    for (const model of ANALYZE_MODELS) {
      const bySite = new Map<string, Set<string>>();
      for (const r of runs.filter((x) => x.model === model && x.profile)) {
        if (!bySite.has(r.site)) bySite.set(r.site, new Set());
        bySite.get(r.site)!.add(r.profile!.etapa);
      }
      const stable = [...bySite.values()].filter((s) => s.size === 1).length;
      lines.push(`| ${model} | ${stable}/${bySite.size} |`);
    }
  }

  lines.push('', '## Detalle por web', '');
  for (const site of sites.filter((s) => !unreadable.includes(s))) {
    lines.push(`### ${site}`, '', '| Campo | ' + ANALYZE_MODELS.join(' | ') + ' |', '|---|' + ANALYZE_MODELS.map(() => '---').join('|') + '|');
    const first = (m: AnalyzeModel) => runs.find((r) => r.site === site && r.model === m);
    const cell = (m: AnalyzeModel, f: (p: WebsiteProfile) => string) => {
      const r = first(m);
      return r?.profile ? f(r.profile).replace(/\|/g, '/') : `ERROR ${r?.error ?? ''}`;
    };
    const fields: [string, (p: WebsiteProfile) => string][] = [
      ['tipo / etapa', (p) => `${p.tipo_negocio} / ${p.etapa} (${p.confianza})`],
      ['resumen', (p) => p.resumen],
      ['modelo de negocio', (p) => p.modelo_negocio],
      ['servicios', (p) => p.servicios.join('; ')],
      ['nicho', (p) => p.nicho],
      ['cliente ideal', (p) => p.cliente_ideal],
    ];
    for (const [label, f] of fields) {
      lines.push(`| ${label} | ` + ANALYZE_MODELS.map((m) => cell(m, f)).join(' | ') + ' |');
    }
    lines.push('');
  }

  mkdirSync('scripts/eval-results', { recursive: true });
  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  writeFileSync(`scripts/eval-results/${stamp}.md`, lines.join('\n'));
  writeFileSync(`scripts/eval-results/${stamp}.json`, JSON.stringify(runs, null, 2));
  console.log(`\nResultados en scripts/eval-results/${stamp}.md`);
  const total = runs.reduce((a, r) => a + (r.costUsd ?? 0), 0);
  console.log(`Coste total de la prueba: $${total.toFixed(3)}`);
}

main();
