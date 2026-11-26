// Utilidades del blog: lectura de la colección, categorías, tiempo de lectura
// y fechas. Las páginas del blog se prerenderizan, así que todo esto corre en
// el build.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;
export type CategorySlug = Post['data']['category'];

export const PAGE_SIZE = 12;

export const BLOG_CATEGORIES: Record<
  CategorySlug,
  { label: string; singular: string; readLabel: string; description: string }
> = {
  guides: {
    label: 'Guides',
    singular: 'Guide',
    readLabel: 'Read the guide',
    description:
      'Step-by-step how-tos for the marketing and sales setups we build for clients: CRM, outbound, tracking and reporting.',
  },
  comparisons: {
    label: 'Comparisons',
    singular: 'Comparison',
    readLabel: 'Read the comparison',
    description:
      "Side-by-side reviews of the tools in our Market: what each one is good at, what it costs, and when we'd pick it.",
  },
};

export const CATEGORY_SLUGS = Object.keys(BLOG_CATEGORIES) as CategorySlug[];

/** Posts publicados, del más reciente al más antiguo. Los borradores solo se
 *  ven en desarrollo. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** El post marcado como destacado; si no hay, el más reciente. */
export function pickFeatured(posts: Post[]): Post | undefined {
  return posts.find((p) => p.data.featured) ?? posts[0];
}

/** Minutos de lectura: palabras ÷ 230, redondeado hacia arriba. */
export function readingMinutes(post: Post): number {
  const text = (post.body ?? '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`\[\]()!|-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 230));
}

const DATE_FMT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "NOV 18, 2026" */
export function formatDate(date: Date): string {
  return DATE_FMT.format(date).toUpperCase();
}

export const postUrl = (post: Post) => `/blog/${post.id}/`;
export const categoryUrl = (slug: CategorySlug) => `/blog/category/${slug}/`;

/** Relacionados: primero la misma categoría, luego los más recientes. */
export function relatedPosts(post: Post, posts: Post[], count = 3): Post[] {
  const others = posts.filter((p) => p.id !== post.id);
  const same = others.filter((p) => p.data.category === post.data.category);
  const rest = others.filter((p) => p.data.category !== post.data.category);
  return [...same, ...rest].slice(0, count);
}

/** Etiquetas de una lista de posts, por frecuencia. */
export function tagsOf(posts: Post[]): string[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}
