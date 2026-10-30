// Supabase settings from the environment, with any spaces / line breaks removed.
// Keys never contain whitespace; one pasted with a line break in it makes every request fail.
const clean = (v: string | undefined) => (v ?? '').replace(/\s+/g, '')

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL)
export const SUPABASE_ANON_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
export const serviceRoleKey = () => clean(process.env.SUPABASE_SERVICE_ROLE_KEY)
