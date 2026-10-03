import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchYouTubeThumbnail } from '@/lib/youtube'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('fetchYouTubeThumbnail', () => {
  it('returns thumbnail_url from oEmbed response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        thumbnail_url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        title: 'Never Gonna Give You Up',
      }),
    } as Response)

    const result = await fetchYouTubeThumbnail('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    expect(result).toBe('https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg')
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('oembed?url=')
    )
  })

  it('throws when oEmbed request fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response)

    await expect(
      fetchYouTubeThumbnail('https://www.youtube.com/watch?v=invalid')
    ).rejects.toThrow('oEmbed request failed')
  })

  it('throws when thumbnail_url is missing from response', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'No thumbnail' }),
    } as Response)

    await expect(
      fetchYouTubeThumbnail('https://www.youtube.com/watch?v=xyz')
    ).rejects.toThrow('No thumbnail')
  })
})
