import { defineEventHandler, getRouterParam, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const path = getRouterParam(event, 'path') || ''

  // Fallback to local CMS on port 3000 if CMS_API_INTERNAL is not defined
  const targetBase = (config.cmsApiInternal || 'http://localhost:3000/api').replace(/\/+$/, '')

  // Preserve query string parameters
  const reqUrl = event.node.req.url || ''
  const queryIndex = reqUrl.indexOf('?')
  const queryString = queryIndex !== -1 ? reqUrl.slice(queryIndex) : ''

  const targetUrl = `${targetBase}/${path}${queryString}`

  try {
    return await $fetch(targetUrl)
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 502,
      statusMessage: `CMS Proxy Error: ${err?.message || 'Could not connect to CMS'}`,
    })
  }
})
