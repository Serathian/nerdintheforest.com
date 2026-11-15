interface SitemapEntry {
  loc: string
  lastmod?: string
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function fetchSlugs(url: string): Promise<Array<{ slug?: string; updatedAt?: string }>> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as { docs?: Array<{ slug?: string; updatedAt?: string }> }
    return Array.isArray(data.docs) ? data.docs : []
  } catch {
    return []
  }
}

export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  const config = useRuntimeConfig()
  const origin = ((config.public?.siteUrl as string) || 'https://nerdintheforest.com').replace(/\/$/, '')
  const cmsInternal = ((config.cmsApiInternal as string) || 'http://localhost:3000/api').replace(/\/$/, '')

  const entries: SitemapEntry[] = [
    { loc: `${origin}/` },
    { loc: `${origin}/ledger` },
    { loc: `${origin}/gear` },
    { loc: `${origin}/ethos` },
  ]

  const [locations, dispatches] = await Promise.all([
    fetchSlugs(`${cmsInternal}/nitf_locations?limit=200`),
    fetchSlugs(`${cmsInternal}/nitf_dispatches?where[status][equals]=published&limit=200`),
  ])

  for (const loc of locations) {
    if (loc.slug) {
      entries.push({ loc: `${origin}/locations/${loc.slug}`, lastmod: loc.updatedAt })
    }
  }

  for (const dispatch of dispatches) {
    if (dispatch.slug) {
      entries.push({ loc: `${origin}/dispatches/${dispatch.slug}`, lastmod: dispatch.updatedAt })
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`
})
