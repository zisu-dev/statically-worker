import { IHandler } from './base'

export const handle404: IHandler = async (url, req) => {
  const body = `The requested url ${req.url} not found`
  return new Response(body, { status: 404 })
}

export const handle400: IHandler = async (url, req) => {
  return new Response('Bad Request', { status: 400 })
}

export async function $fetch(req: Request): Promise<Response> {
  const res = await fetch(req, {
    headers: {
      Referer: ''
    }
  })
  const location = res.headers.get('location')
  if ([301, 302, 303, 307, 308].includes(res.status) && location) {
    return $fetch(new Request(location))
  } else {
    return res
  }
}
