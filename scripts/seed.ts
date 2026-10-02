import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

const PLACEHOLDER = 'https://placehold.co/800x800/b04a33/fef9e2?text=Art'

const artworks = [
  { title: 'Sample Music 1',  collection_slug: 'music',   image_url: PLACEHOLDER, featured: true, featured_order: 1 },
  { title: 'Sample Movie 1',  collection_slug: 'movies',  image_url: PLACEHOLDER, featured: true, featured_order: 2 },
  { title: 'Sample Comic 1',  collection_slug: 'comics',  image_url: PLACEHOLDER, featured: true, featured_order: 3 },
  { title: 'Sample Bee 1',    collection_slug: 'bee-ben', image_url: PLACEHOLDER, featured: true, featured_order: 4 },
  { title: 'Sample Paper 1',  collection_slug: 'paper',   image_url: PLACEHOLDER, featured: true, featured_order: 5 },
  { title: 'Sample Music 2',  collection_slug: 'music',   image_url: PLACEHOLDER, featured: true, featured_order: 6 },
  { title: 'Sample Movie 2',  collection_slug: 'movies',  image_url: PLACEHOLDER, featured: true, featured_order: 7 },
  { title: 'Sample Comic 2',  collection_slug: 'comics',  image_url: PLACEHOLDER, featured: true, featured_order: 8 },
  { title: 'Sample Paper 2',  collection_slug: 'paper',   image_url: PLACEHOLDER, featured: true, featured_order: 9 },
]

async function seed() {
  const { error } = await supabase.from('artworks').insert(artworks)
  if (error) { console.error('Seed failed:', error); process.exit(1) }
  console.log('Seeded', artworks.length, 'artworks')
}

seed()
