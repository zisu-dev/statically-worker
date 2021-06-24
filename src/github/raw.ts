import mime from 'mime'
import { defineEndpoint } from '../base'
import { $fetch } from '../utils'

export default defineEndpoint('raw', async (url, req) => {
  url.hostname = 'raw.githubusercontent.com'
  let res = await $fetch(new Request(url.toString(), req))
  res = new Response(res.body, res)
  res.headers.set('Content-Type', mime.getType(url.pathname) || 'text/plain')
  return res
})
