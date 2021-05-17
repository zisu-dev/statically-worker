import gravatar from 'gravatar'

declare global {
  const KV: KVNamespace
  const ORIGINS: string
}

export async function handleRequest(req: Request): Promise<Response> {
  return route(req)
}

const allowedOrigins = ORIGINS.split(',').map((x) => x.trim())

function NotFound() {
  return new Response('Not found', { status: 404 })
}

function BadRequest() {
  return new Response('Bad Request', { status: 400 })
}

function isValidOrigin(origin: string) {
  return allowedOrigins.some((x) => origin.endsWith(x))
}

function isValidReferer(ref: string) {
  const url = new URL(ref)
  return isValidOrigin(url.hostname)
}

async function fFetch(req: Request): Promise<Response> {
  const res = await fetch(req, {
    headers: {
      Referer: ''
    }
  })
  const location = res.headers.get('location')
  if ([301, 302, 303, 307, 308].includes(res.status) && location) {
    return fFetch(new Request(location))
  } else {
    return res
  }
}

async function route(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const main = url.hostname.replace(/^[^.]+\./, '')

  function gotoMain() {
    return Response.redirect('https://' + main)
  }

  // Redirect / to main domain
  if (url.pathname === '/') return gotoMain()

  // Use icon from main domain
  if (url.pathname === '/favicon.ico') {
    url.hostname = main
    return fFetch(new Request(url.toString(), req))
  }

  const referer = req.headers.get('Referer')
  if (referer) {
    if (!isValidReferer(referer)) return gotoMain()
  }

  // Defined assets
  if (url.pathname.startsWith('/defined/')) {
    const key = url.pathname.substr(9)
    if (!key) return gotoMain()

    const value = await KV.get(key)
    if (value === null) return NotFound()

    return fFetch(new Request(value, req))
  }

  // Gravatar
  if (url.pathname.startsWith('/gravatar/')) {
    const result = url.pathname.substr(10).match(/^([^/]+)(?:\/([^/]*))?/)
    if (!result) return BadRequest()
    const email = result[1]
    const size = result[2]
    const avatarUrl = gravatar.url(email, { size }, true)
    return fFetch(new Request(avatarUrl))
  }

  // Other request should be proxied
  url.hostname = 'cdn.statically.io'
  return fFetch(new Request(url.toString(), req))
}
