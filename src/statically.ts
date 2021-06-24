import { defineEndpoint } from './base'
import { $fetch } from './utils'

export default defineEndpoint('s', async (url, req) => {
  url.hostname = 'cdn.statically.io'
  return $fetch(new Request(url.toString(), req))
})
