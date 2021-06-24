import { defineEndpoint, Router } from '../base'
import raw from './raw'
import release from './release'

export default defineEndpoint('gh', async (url, req) => {
  const router = new Router()

  router.register(raw)
  router.register(release)

  return router.handle(url, req)
})
