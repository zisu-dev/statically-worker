declare global {
  const KV: KVNamespace
}

export async function handleRequest(req: Request): Promise<Response> {
  return route(req)
}

const allowedOrigins = [
  'zzisu.dev',
  'zisu.dev',
  'zzs1.cn',
  'zhangzisu.cn',
  'swarm-p.com',
  'localhost',
  'pages.dev',
  'vercel.app'
]

function isValidOrigin(origin: string) {
  return allowedOrigins.some((x) => origin.endsWith(x))
}

function isValidReferer(ref: string) {
  const url = new URL(ref)
  return isValidOrigin(url.hostname)
}

async function followRedirect(req: Request): Promise<Response> {
  const res = await fetch(req, {
    headers: {
      Referer: ''
    }
  })
  const location = res.headers.get('location')
  if ([301, 302, 303, 307, 308].includes(res.status) && location) {
    return followRedirect(new Request(location))
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

  function notFound() {
    return new Response('Not found', { status: 404 })
  }

  // Redirect / to main domain
  if (url.pathname === '/') return gotoMain()

  // Use icon from main domain
  if (url.pathname === '/favicon.ico') {
    url.hostname = main
    return followRedirect(new Request(url.toString(), req))
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
    if (value === null) return notFound()

    return followRedirect(new Request(value, req))
  }

  // Other request should be proxied
  url.hostname = 'cdn.statically.io'
  return followRedirect(new Request(url.toString(), req))
}
