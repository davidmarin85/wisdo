/** Enlaces de afiliado de PartnerStack: fuente única para el marketplace,
 *  la página de resultado del diagnóstico y el email.
 *
 *  Uno por programa: el marcado como "link principal" en PartnerStack, salvo
 *  Apollo, que usa el enlace personalizado /wisdo (el que lleva más clics).
 *  Exportado de PartnerStack el 30/09/2026 (partnerstack_links.xlsx).
 *
 *  `slug`: la ruta de /go/{slug}/ y el nombre con el que se guardan los clics
 *  en Supabase. No cambiarlo una vez publicado o se parte el histórico.
 *  `aliases`: otros nombres con los que aparece la herramienta en el motor de
 *  diagnóstico o en el marketplace. Se comparan sin mayúsculas ni símbolos. */
export interface PartnerLink {
  slug: string;
  name: string;
  url: string;
  aliases?: string[];
}

export const PARTNER_LINKS: PartnerLink[] = [
  // Ventas y prospección
  { slug: 'apollo', name: 'Apollo.io', url: 'https://get.apollo.io/wisdo', aliases: ['Apollo'] },
  { slug: 'lemlist', name: 'lemlist', url: 'https://get.lemlist.com/22o5s4s396mz' },
  { slug: 'lusha', name: 'Lusha', url: 'https://partnerstack.lusha.com/ytoxkheu0feb' },
  { slug: 'amplemarket', name: 'Amplemarket', url: 'https://grow.amplemarket.com/4audvlzb0i23' },
  // Kaspr no aparece en la exportación de PartnerStack, pero el enlace sigue
  // funcionando (30/09/2026). Comprobar si el programa sigue activo.
  { slug: 'kaspr', name: 'Kaspr', url: 'https://kaspr.partnerlinks.io/gwm4l081zvey' },
  { slug: 'thordata', name: 'ThorData', url: 'https://affiliate.thordata.com/2c3snuep3vp0' },

  // CRM
  { slug: 'folk', name: 'folk', url: 'https://try.folk.app/28a0uwx07ug3', aliases: ['folk CRM'] },
  { slug: 'nutshell', name: 'Nutshell', url: 'https://try.nutshell.com/1hwij1c2fiki', aliases: ['Nutshell CRM'] },
  { slug: 'capsule', name: 'Capsule', url: 'https://get.capsulenow.io/bdnbofpvfhpc', aliases: ['Capsule CRM'] },
  { slug: 'transpond', name: 'Transpond', url: 'https://get.capsulenow.io/7kbd5v9euuvo-5z5n5x' },

  // Conversación y telefonía
  { slug: 'manychat', name: 'ManyChat', url: 'https://manychat.partnerlinks.io/4p9bnpg0tw4o', aliases: ['Manychat'] },
  { slug: 'wati', name: 'Wati', url: 'https://affiliates.wati.io/ego7xbjytbnq', aliases: ['Wati.io'] },
  { slug: 'krispcall', name: 'KrispCall', url: 'https://try.krispcall.com/8xqb028wq9zz' },
  { slug: 'callhippo', name: 'CallHippo', url: 'https://join.callhippo.com/k8f4qoa1vwes' },

  // Email marketing y automatización
  { slug: 'getresponse', name: 'GetResponse', url: 'https://try.getresponsetoday.com/ra01yn2yegh2' },
  { slug: 'campaign-monitor', name: 'Campaign Monitor', url: 'https://partners.campaignmonitor.com/siyw6v7fn2aq' },
  { slug: 'n8n', name: 'n8n', url: 'https://n8n.partnerlinks.io/u19q4bzd3e5x' },
  { slug: 'kartra', name: 'Kartra', url: 'https://try.kartra.com/ew6qjoshynj9' },
  { slug: 'webinarjam', name: 'WebinarJam', url: 'https://try.kartra.com/05ob6sfzbfft-26ysr' },
  { slug: 'everwebinar', name: 'EverWebinar', url: 'https://try.kartra.com/adpn2uo9qyam-xvggcn' },

  // Analítica y anuncios
  { slug: 'whatconverts', name: 'WhatConverts', url: 'https://partners.whatconverts.com/4t19z6ccc8li' },
  { slug: 'birch', name: 'Bïrch', url: 'https://join.bir.ch/zdvcx9ktp36i', aliases: ['Birch', 'Revealbot'] },
  { slug: 'diginius', name: 'Diginius', url: 'https://get.diginius.com/k2zyi1klgwyv' },
  { slug: 'rank-prompt', name: 'Rank Prompt', url: 'https://join.rankprompt.com/kazaozxqrn7p' },

  // Web, ecommerce y formación
  { slug: 'wegic', name: 'Wegic', url: 'https://try.wegic.ai/d2bl6mqqxtbc' },
  { slug: 'emergent', name: 'Emergent', url: 'https://get.emergent.sh/aaj55jzvaems' },
  { slug: 'plesk', name: 'Plesk', url: 'https://try.plesk.com/u0dwdgdpf4ux' },
  { slug: 'spocket', name: 'Spocket', url: 'https://get.spocket.co/ygzvfzb7u5p2' },
  { slug: 'alidrop', name: 'Alidrop', url: 'https://get.alidrop.co/i91f24rvspb3' },
  { slug: 'learnworlds', name: 'LearnWorlds', url: 'https://get.learnworlds.com/91r1itlzue6f' },
  { slug: 'switcher-studio', name: 'Switcher Studio', url: 'https://start.switcherstudio.com/9n916d4og2og' },
  { slug: 'stampezee', name: 'StampEzee', url: 'https://get.stampezee.com/m3rl8tu2fetg' },
  { slug: 'aisq', name: 'AISQ', url: 'https://try.aisq.com/tyyi1nmvdgbd' },
  { slug: 'flippa', name: 'Flippa', url: 'https://referral.flippa.com/dsyphdfj0pzb' },
  { slug: 'tenable', name: 'Tenable', url: 'https://shop.tenable.com/4fykgple03qs', aliases: ['Nessus'] },
];
