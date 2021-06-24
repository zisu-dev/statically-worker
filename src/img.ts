import { defineEndpoint } from './base'
import { $fetch, handle400 } from './utils'

export default defineEndpoint('img', async (url, req) => {
  const result = url.pathname.match(/^\/([^/]+)\/(.+)$/)
  if (!result) return handle400(url, req)
  const schema = result[1]
  if (schema !== 'http' && schema !== 'https') return handle400(url, req)
  const target = result[2]
  console.log(`${schema}://${target}`)
  return $fetch(new Request(`${schema}://${target}`, req))
})
