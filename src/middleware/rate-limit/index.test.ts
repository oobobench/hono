import { Hono } from '../../hono'
import { rateLimit } from '.'

describe('Rate Limit Middleware', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests under the limit', async () => {
    const app = new Hono()
    app.use('*', rateLimit({ windowMs: 1000, limit: 2 }))
    app.get('/', (c) => c.text('ok'))

    const r1 = await app.request('/')
    const r2 = await app.request('/')
    expect(r1.status).toBe(200)
    expect(r2.status).toBe(200)
  })

  it('rejects requests that exceed the limit', async () => {
    const app = new Hono()
    app.use('*', rateLimit({ windowMs: 1000, limit: 2 }))
    app.get('/', (c) => c.text('ok'))

    await app.request('/')
    await app.request('/')
    const blocked = await app.request('/')
    expect(blocked.status).toBe(429)
    expect(await blocked.text()).toBe('Too Many Requests')
  })

  it('slides the window after windowMs elapses', async () => {
    const app = new Hono()
    app.use('*', rateLimit({ windowMs: 1000, limit: 1 }))
    app.get('/', (c) => c.text('ok'))

    expect((await app.request('/')).status).toBe(200)
    expect((await app.request('/')).status).toBe(429)

    vi.advanceTimersByTime(1001)

    expect((await app.request('/')).status).toBe(200)
  })

  it('tracks limits separately per keyGenerator output', async () => {
    const app = new Hono()
    app.use(
      '*',
      rateLimit({
        windowMs: 1000,
        limit: 1,
        keyGenerator: (c) => c.req.header('x-user') || 'anon',
      })
    )
    app.get('/', (c) => c.text('ok'))

    const a1 = await app.request('/', { headers: { 'x-user': 'a' } })
    const b1 = await app.request('/', { headers: { 'x-user': 'b' } })
    const a2 = await app.request('/', { headers: { 'x-user': 'a' } })

    expect(a1.status).toBe(200)
    expect(b1.status).toBe(200)
    expect(a2.status).toBe(429)
  })

  it('invokes onLimitExceeded for a custom response', async () => {
    const app = new Hono()
    app.use(
      '*',
      rateLimit({
        windowMs: 1000,
        limit: 1,
        onLimitExceeded: (c) => c.text('slow down', 429),
      })
    )
    app.get('/', (c) => c.text('ok'))

    await app.request('/')
    const blocked = await app.request('/')
    expect(blocked.status).toBe(429)
    expect(await blocked.text()).toBe('slow down')
  })
})
