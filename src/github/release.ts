import { defineEndpoint } from '../base'
import { $fetch } from '../utils'

export default defineEndpoint('release', async (url, req) => {
  url.hostname = 'github.com'
  return $fetch(new Request(url.toString(), req))
})
