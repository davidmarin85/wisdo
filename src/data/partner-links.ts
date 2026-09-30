/** Enlaces de afiliado de PartnerStack: fuente única para el marketplace,
 *  la página de resultado del diagnóstico y el email.
 *
 *  Uno por programa: el marcado como "link principal" en PartnerStack, salvo
 *  Apollo, que usa el enlace personalizado /wisdo (el que lleva más clics).
 *  Exportado de PartnerStack el 30/09/2026 (partnerstack_links.xlsx).
 *
 *  `aliases`: otros nombres con los que aparece la herramienta en el motor de
 *  diagnóstico o en el marketplace. Se comparan sin mayúsculas ni símbolos. */
export interface PartnerLink {
  name: string;
  url: string;
  aliases?: string[];
}

export const PARTNER_LINKS: PartnerLink[] = [
  // Ventas y prospección
  { name: 'Apollo.io', url: 'https://get.apollo.io/wisdo', aliases: ['Apollo'] },
  { name: 'lemlist', url: 'https://get.lemlist.com/22o5s4s396mz' },
  { name: 'Lusha', url: 'https://partnerstack.lusha.com/ytoxkheu0feb' },
  { name: 'Amplemarket', url: 'https://grow.amplemarket.com/4audvlzb0i23' },
  { name: 'ThorData', url: 'https://affiliate.thordata.com/2c3snuep3vp0' },

  // CRM
  { name: 'folk', url: 'https://try.folk.app/28a0uwx07ug3', aliases: ['folk CRM'] },
  { name: 'Nutshell', url: 'https://try.nutshell.com/1hwij1c2fiki', aliases: ['Nutshell CRM'] },
  { name: 'Capsule', url: 'https://get.capsulenow.io/bdnbofpvfhpc', aliases: ['Capsule CRM'] },
  { name: 'Transpond', url: 'https://get.capsulenow.io/7kbd5v9euuvo-5z5n5x' },

  // Conversación y telefonía
  { name: 'ManyChat', url: 'https://manychat.partnerlinks.io/4p9bnpg0tw4o', aliases: ['Manychat'] },
  { name: 'Wati', url: 'https://affiliates.wati.io/ego7xbjytbnq', aliases: ['Wati.io'] },
  { name: 'KrispCall', url: 'https://try.krispcall.com/8xqb028wq9zz' },
  { name: 'CallHippo', url: 'https://join.callhippo.com/k8f4qoa1vwes' },

  // Email marketing y automatización
  { name: 'GetResponse', url: 'https://try.getresponsetoday.com/ra01yn2yegh2' },
  { name: 'Campaign Monitor', url: 'https://partners.campaignmonitor.com/siyw6v7fn2aq' },
  { name: 'n8n', url: 'https://n8n.partnerlinks.io/u19q4bzd3e5x' },
  { name: 'Kartra', url: 'https://try.kartra.com/ew6qjoshynj9' },
  { name: 'WebinarJam', url: 'https://try.kartra.com/05ob6sfzbfft-26ysr' },
  { name: 'EverWebinar', url: 'https://try.kartra.com/adpn2uo9qyam-xvggcn' },

  // Analítica y anuncios
  { name: 'WhatConverts', url: 'https://partners.whatconverts.com/4t19z6ccc8li' },
  { name: 'Bïrch', url: 'https://join.bir.ch/zdvcx9ktp36i', aliases: ['Birch', 'Revealbot'] },
  { name: 'Diginius', url: 'https://get.diginius.com/k2zyi1klgwyv' },
  { name: 'Rank Prompt', url: 'https://join.rankprompt.com/kazaozxqrn7p' },

  // Web, ecommerce y formación
  { name: 'Wegic', url: 'https://try.wegic.ai/d2bl6mqqxtbc' },
  { name: 'Emergent', url: 'https://get.emergent.sh/aaj55jzvaems' },
  { name: 'Plesk', url: 'https://try.plesk.com/u0dwdgdpf4ux' },
  { name: 'Spocket', url: 'https://get.spocket.co/ygzvfzb7u5p2' },
  { name: 'Alidrop', url: 'https://get.alidrop.co/i91f24rvspb3' },
  { name: 'LearnWorlds', url: 'https://get.learnworlds.com/91r1itlzue6f' },
  { name: 'Switcher Studio', url: 'https://start.switcherstudio.com/9n916d4og2og' },
  { name: 'StampEzee', url: 'https://get.stampezee.com/m3rl8tu2fetg' },
  { name: 'AISQ', url: 'https://try.aisq.com/tyyi1nmvdgbd' },
  { name: 'Flippa', url: 'https://referral.flippa.com/dsyphdfj0pzb' },
  { name: 'Tenable', url: 'https://shop.tenable.com/4fykgple03qs', aliases: ['Nessus'] },
];
