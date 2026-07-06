export type RouteParams = Record<string, string>
export type RouteHandler = (req: Request, params: RouteParams) => Promise<Response> | Response

type CompiledRoute = {
    method: string
    regex: RegExp
    keys: string[]
    handler: RouteHandler
}

const compile = (path: string): { regex: RegExp; keys: string[] } => {
    const keys: string[] = []
    const pattern = path
        .split('/')
        .map((segment) => {
            if (segment.startsWith(':')) {
                keys.push(segment.slice(1))
                return '([^/]+)'
            }
            return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        })
        .join('/')
    return { regex: new RegExp(`^${pattern}$`), keys }
}

export class Router {
    private routes: CompiledRoute[] = []

    register(method: string, path: string, handler: RouteHandler): void {
        const { regex, keys } = compile(path)
        this.routes.push({ method: method.toUpperCase(), regex, keys, handler })
    }

    match(method: string, pathname: string): { handler: RouteHandler; params: RouteParams } | null {
        for (const route of this.routes) {
            if (route.method !== method.toUpperCase()) continue
            const captured = pathname.match(route.regex)
            if (!captured) continue
            const params: RouteParams = {}
            route.keys.forEach((key, index) => {
                params[key] = decodeURIComponent(captured[index + 1])
            })
            return { handler: route.handler, params }
        }
        return null
    }
}
