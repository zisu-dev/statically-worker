import { defineEndpoint } from './base'
import { $fetch, handle404 } from './utils'

export default defineEndpoint('defined', async (url, req) => {
  const key = url.pathname.substr(1)
  if (!key) {
    return handle404(url, req)
  }

  const value = await KV.get(key)
  if (!value) {
    return handle404(url, req)
  }

  return $fetch(new Request(value, req))
})
