import { handle404 } from './utils'

export interface IHandler {
  (url: URL, req: Request): Promise<Response>
}

export function defineEndpoint(prefix: string, handler: IHandler) {
  return { prefix, handler }
}

interface IRouteTable {
  [prefix: string]: IHandler
}

interface IRouterOptions {
  root?: IHandler
  fallback?: IHandler
}

export class Router {
  private root
  private fallback
  private routes

  constructor(options: IRouterOptions = {}) {
    this.root = options.root || handle404
    this.fallback = options.fallback || handle404
    this.routes = Object.create(null) as IRouteTable
  }

  register(endpoint: ReturnType<typeof defineEndpoint>) {
    const { prefix, handler } = endpoint
    if (prefix in this.routes) throw new Error('Duplicate')
    this.routes[prefix] = handler
  }

  handle(url: URL, req: Request): Promise<Response> {
    const { pathname } = url
    const i = pathname.indexOf('/', 1)
    const len = (i >= 0 ? i : pathname.length) - 1
    if (len > 0) {
      // Non-root
      const sub = pathname.substr(1, len)
      if (sub in this.routes) {
        url.pathname = pathname.substr(len + 1)
        return this.routes[sub](url, req)
      } else {
        return this.fallback(url, req)
      }
    } else {
      // Root
      return this.root(url, req)
    }
  }
}
