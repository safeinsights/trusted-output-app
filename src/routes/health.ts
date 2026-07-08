import { json } from '@/http/json'
import type { RouteHandler } from '@/http/router'

export const health: RouteHandler = () => json({ success: true, message: { status: 'ok' } })
