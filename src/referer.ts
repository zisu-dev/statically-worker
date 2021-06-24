const allowedOrigins = ORIGINS.split(',').map((x) => x.trim())

function isValidOrigin(origin: string) {
  return allowedOrigins.some((x) => origin.endsWith(x))
}

function isValidReferer(ref: string) {
  const url = new URL(ref)
  return isValidOrigin(url.hostname)
}

export function isValidRequest(req: Request) {
  const referer = req.headers.get('Referer')
  return !referer || isValidReferer(referer)
}
