// Colecciones de contenido. El blog vive en src/content/blog/*.md.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      excerpt: z.string(),
      category: z.enum(['guides', 'comparisons']),
      /** Etiquetas libres: CRM, Outbound, Reporting… */
      tags: z.array(z.string()).default([]),
      date: z.coerce.date(),
      /** Portada (captura de producto o visual de datos, nunca foto de stock).
       *  Sin portada se dibuja un fondo de marca. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      featured: z.boolean().default(false),
      /** Slugs de wisdo Market (src/data/tools.ts) para la columna derecha. */
      tools: z.array(z.string()).default([]),
      author: z.string().default('Wisdo team'),
      /** Los borradores no se publican. */
      draft: z.boolean().default(false),
    }).refine((d) => !d.cover || !!d.coverAlt, {
      message: 'coverAlt is required when cover is set',
      path: ['coverAlt'],
    }),
});

export const collections = { blog };
