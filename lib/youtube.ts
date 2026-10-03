export async function fetchYouTubeThumbnail(youtubeUrl: string): Promise<string> {
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`
  const res = await fetch(oEmbedUrl)

  if (!res.ok) throw new Error('oEmbed request failed')

  const data = await res.json()
  if (!data.thumbnail_url) throw new Error('No thumbnail in oEmbed response')

  return data.thumbnail_url as string
}
