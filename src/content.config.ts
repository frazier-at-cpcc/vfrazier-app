import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum([
        'Instructional Design',
        'AI & Workforce',
        'Teaching',
        'Cloud & Infra',
        'Research',
        'Notes',
      ]),
      heroImage: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const speakingTopics = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/speaking-topics' }),
  schema: z.object({
    title: z.string(),
    audienceFit: z.string(),
    abstract: z.string(),
    formats: z.array(z.enum(['Keynote', 'Panel', 'Half-day workshop', 'Full-day workshop', 'Podcast guest', 'Webinar'])),
    takeaways: z.array(z.string()).min(1).max(5),
    featured: z.boolean().default(false),
    nsfFunded: z.boolean().default(false),
    order: z.number().default(99),
    tag: z.string(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/testimonials' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    quote: z.string(),
    highlightedPhrase: z.string().optional(),
    initials: z.string().regex(/^[A-Z]{1,3}$/, 'Initials must be 1–3 uppercase letters'),
    relationship: z.string().optional(),
    linkedInUrl: z.string().url().optional(),
    placeholder: z.boolean().default(false),
    order: z.number().default(99),
  }),
});

const talksGiven = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/talks-given' }),
  schema: z.object({
    event: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
    talkTitle: z.string(),
    format: z.enum(['Keynote', 'Panel', 'Workshop', 'Podcast', 'Webinar', 'Guest lecture']),
    slidesUrl: z.string().url().optional(),
    recordingUrl: z.string().url().optional(),
    eventUrl: z.string().url().optional(),
    upcoming: z.boolean().default(false),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/courses' }),
  schema: z.object({
    code: z.string(),
    title: z.string(),
    institution: z.enum(['Central Piedmont', 'UNC Charlotte', 'Wingate', 'Wake Tech', 'Wayne CC']),
    level: z.enum(['Associate', 'Bachelor', 'Graduate', 'Honors']),
    lastTaught: z.string(),
    description: z.string(),
    syllabusUrl: z.string().url().optional(),
    current: z.boolean().default(false),
  }),
});

const press = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/press' }),
  schema: z.object({
    kind: z.enum(['Podcast', 'News', 'Award', 'Talk']),
    title: z.string(),
    org: z.string().optional(),
    url: z.string().url().optional(),
    year: z.string().optional(),
    order: z.number().default(99),
  }),
});

const career = defineCollection({
  loader: glob({ pattern: '**/*.{json,yaml,yml}', base: './src/content/career' }),
  schema: z.object({
    years: z.string(),
    title: z.string(),
    org: z.string(),
    order: z.number(),
  }),
});

export const collections = { posts, speakingTopics, testimonials, talksGiven, courses, press, career };
