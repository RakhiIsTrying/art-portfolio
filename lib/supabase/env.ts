// Supabase settings from the environment, with stray spaces / line breaks removed
// (a key pasted with a trailing newline makes every request fail).
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
export const serviceRoleKey = () => (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
