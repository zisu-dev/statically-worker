import { Router } from './base'
import { isValidRequest } from './referer'
import { $fetch, handle400 } from './utils'
import defined from './defined'
import gravatar from './gravatar'
import img from './img'
import statically from './statically'
import github from './github'

declare global {
  const KV: KVNamespace
  const ORIGINS: string
}

export async function handleRequest(ev: FetchEvent): Promise<Response> {
  const req = ev.request

  const cacheKey = new Request(new URL(req.url).toString(), req)
  const cache = caches.default

  let res = await cache.match(cacheKey)
  if (!res) {
    res = await route(req)
    res = new Response(res.body, res)
    res.headers.append('Cache-Control', 's-maxage=60')
    ev.waitUntil(cache.put(cacheKey, res.clone()))
  }
  return res
}

async function route(req: Request): Promise<Response> {
  const url = new URL(req.url)

  if (!isValidRequest(req)) return handle400(url, req)

  const router = new Router({
    root: async () => {
      return Response.redirect('https://github.com/zisu-dev/statically-worker')
    },
    fallback: async (url, req) => {
      url.hostname = 'cdn.statically.io'
      return $fetch(new Request(url.toString(), req))
    }
  })

  router.register(defined)
  router.register(gravatar)
  router.register(img)
  router.register(github)
  router.register(statically)

  return router.handle(url, req)
}
