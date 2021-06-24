import gravatar from 'gravatar'
import { defineEndpoint } from './base'
import { $fetch, handle400 } from './utils'

export default defineEndpoint('gravatar', async (url, req) => {
  const result = url.pathname.match(/^\/([^/]+)(?:\/([^/]*))?/)
  if (!result) return handle400(url, req)
  const email = result[1]
  const size = result[2]
  const avatarUrl = gravatar.url(email, { size }, true)
  return $fetch(new Request(avatarUrl))
})
