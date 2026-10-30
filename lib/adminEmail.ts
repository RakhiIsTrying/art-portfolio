// The only account allowed into Admin
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? 'rakhisinha100896@gmail.com').toLowerCase()
export const isAdminEmail = (email: string | null | undefined) => !!email && email.trim().toLowerCase() === ADMIN_EMAIL
