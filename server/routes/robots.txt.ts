export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const config = useRuntimeConfig()
  const siteUrl = ((config.public?.siteUrl as string) || 'https://nerdintheforest.com').replace(/\/$/, '')

  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
