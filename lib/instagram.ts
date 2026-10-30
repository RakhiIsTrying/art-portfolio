// Nightly Instagram check: new posts are copied into our storage and wait in Admin → Instagram for review.
// Uses the official Instagram API (Instagram Login). Everything private lives in the private "inbox" bucket.
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { notifyArtist } from '@/lib/notify'

const GRAPH = 'https://graph.instagram.com'
const PRIVATE = 'inbox'            // private bucket: the token and the review queue
const PUBLIC = 'artworks'          // public bucket: copied images and reels
const STATE = 'instagram/state.json'
const PENDING = 'instagram/pending/'
const REFRESH_EVERY_DAYS = 7       // tokens last 60 days; refreshing weekly keeps them alive

export type IgState = {
  token?: string
  username?: string
  tokenRefreshedAt?: string
  seen: string[]                   // post ids already handled (queued, or there before connecting)
  lastRunAt?: string
  lastResult?: string
}

export type PendingPost = {
  id: string
  kind: 'image' | 'reel'
  caption: string
  permalink: string
  postedAt: string
  imageUrl: string                 // the image, or the reel's poster
  videoUrl?: string
}

type IgMedia = {
  id: string; caption?: string; media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'; media_url?: string
  thumbnail_url?: string; permalink: string; timestamp: string
  children?: { data: { media_type: string; media_url?: string; thumbnail_url?: string }[] }
}

const store = () => getSupabaseAdminClient().storage

async function readJson<T>(bucket: string, path: string): Promise<T | null> {
  const { data } = await store().from(bucket).download(path)
  if (!data) return null
  try { return JSON.parse(await data.text()) as T } catch { return null }
}
async function writeJson(bucket: string, path: string, value: unknown) {
  const { error } = await store().from(bucket).upload(path, JSON.stringify(value), { contentType: 'application/json', upsert: true })
  if (error) throw new Error(`Could not save ${path}: ${error.message}`)
}

export async function getState(): Promise<IgState> {
  return (await readJson<IgState>(PRIVATE, STATE)) ?? { seen: [] }
}
const saveState = (s: IgState) => writeJson(PRIVATE, STATE, s)

async function graph<T>(path: string, token: string): Promise<T> {
  const url = `${GRAPH}${path}${path.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(token)}`
  const res = await fetch(url, { cache: 'no-store' })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error?.message ?? `Instagram said ${res.status}`)
  return body as T
}

/** Save a token pasted in Admin, after checking it works. */
export async function connect(token: string) {
  const me = await graph<{ username: string }>('/me?fields=username', token)
  const state = await getState()
  await saveState({ ...state, token, username: me.username, tokenRefreshedAt: new Date().toISOString(), lastResult: `Connected as @${me.username}` })
  return me.username
}

async function copyToStorage(url: string, path: string, contentType: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Could not download from Instagram (${res.status})`)
  const { error } = await store().from(PUBLIC).upload(path, await res.arrayBuffer(), { contentType, upsert: true })
  if (error) throw new Error(error.message)
  return store().from(PUBLIC).getPublicUrl(path).data.publicUrl
}

/** Check Instagram for new posts. The first run only remembers what's already there. */
export async function syncInstagram(): Promise<string> {
  const state = await getState()
  if (!state.token) return 'Not connected yet'

  // Keep the token alive
  const days = state.tokenRefreshedAt ? (Date.now() - Date.parse(state.tokenRefreshedAt)) / 864e5 : Infinity
  if (days >= REFRESH_EVERY_DAYS) {
    try {
      const r = await graph<{ access_token: string }>(`/refresh_access_token?grant_type=ig_refresh_token`, state.token)
      state.token = r.access_token
      state.tokenRefreshedAt = new Date().toISOString()
    } catch (e) { console.error('Instagram token refresh failed:', e) }
  }

  let result: string
  try {
    const { data } = await graph<{ data: IgMedia[] }>(
      '/me/media?limit=25&fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}',
      state.token)

    if (!state.seen.length) {
      state.seen = data.map(m => m.id)
      result = `First check: noted ${data.length} existing posts. New posts from now on will show up here.`
    } else {
      const fresh = data.filter(m => !state.seen.includes(m.id)).reverse()   // oldest first
      let queued = 0
      for (const m of fresh) {
        const post = await toPending(m)
        if (post) { await writeJson(PRIVATE, `${PENDING}${m.id}.json`, post); queued++ }
        state.seen.push(m.id)
      }
      result = queued ? `${queued} new ${queued === 1 ? 'post' : 'posts'} waiting for review` : 'No new posts'
      if (queued) {
        await notifyArtist({ kind: 'Instagram', subject: `${queued} new ${queued === 1 ? 'post' : 'posts'} to review`,
          text: `New from Instagram, waiting in Admin → Instagram:\n\n${fresh.map(m => `• ${firstLine(m.caption) || 'Untitled'}  ${m.permalink}`).join('\n')}\n\nhttps://faradaycage.xyz/admin/instagram` })
          .catch(e => console.error('Instagram email failed:', e))
      }
    }
  } catch (e) {
    result = `Check failed: ${e instanceof Error ? e.message : String(e)}`
  }

  state.seen = state.seen.slice(-500)
  state.lastRunAt = new Date().toISOString()
  state.lastResult = result
  await saveState(state)
  return result
}

async function toPending(m: IgMedia): Promise<PendingPost | null> {
  const base = { id: m.id, caption: m.caption ?? '', permalink: m.permalink, postedAt: m.timestamp }
  if (m.media_type === 'VIDEO') {
    if (!m.media_url) return null
    const videoUrl = await copyToStorage(m.media_url, `instagram/reels/${m.id}.mp4`, 'video/mp4')
    const imageUrl = m.thumbnail_url ? await copyToStorage(m.thumbnail_url, `instagram/reels/posters/${m.id}.jpg`, 'image/jpeg') : ''
    return { ...base, kind: 'reel', imageUrl, videoUrl }
  }
  // A single image, or the first image of a carousel
  const src = m.media_type === 'IMAGE' ? m.media_url : m.children?.data.find(c => c.media_type === 'IMAGE')?.media_url
  if (!src) return null
  return { ...base, kind: 'image', imageUrl: await copyToStorage(src, `instagram/${m.id}.jpg`, 'image/jpeg') }
}

export async function listPending(): Promise<PendingPost[]> {
  const { data: files } = await store().from(PRIVATE).list(PENDING.slice(0, -1), { limit: 100 })
  const posts = await Promise.all((files ?? []).filter(f => f.name.endsWith('.json'))
    .map(f => readJson<PendingPost>(PRIVATE, `${PENDING}${f.name}`)))
  return posts.filter((p): p is PendingPost => !!p).sort((a, b) => b.postedAt.localeCompare(a.postedAt))
}

export async function getPending(id: string) {
  return readJson<PendingPost>(PRIVATE, `${PENDING}${id}.json`)
}

/** Remove from the queue; with dropMedia, also delete the copied files (when skipping). */
export async function removePending(post: PendingPost, dropMedia: boolean) {
  await store().from(PRIVATE).remove([`${PENDING}${post.id}.json`])
  if (dropMedia) {
    const paths = post.kind === 'reel'
      ? [`instagram/reels/${post.id}.mp4`, `instagram/reels/posters/${post.id}.jpg`]
      : [`instagram/${post.id}.jpg`]
    await store().from(PUBLIC).remove(paths)
  }
}

/** A tidy title from a caption: its first line, without hashtags or mentions. */
export function firstLine(caption?: string) {
  const line = (caption ?? '').split('\n').map(l => l.replace(/[#@][\w.]+/g, '').trim()).find(Boolean) ?? ''
  return line.length > 60 ? line.slice(0, 57).trimEnd() + '…' : line
}
