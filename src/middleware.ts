import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || 'admin:password').split(':')

function isAuthenticated(req: NextRequest) {
    const authHeader = req.headers.get('authorization')

    if (!authHeader) {
        return false
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const user = auth[0]
    const pass = auth[1]

    return user === AUTH_USER && pass === AUTH_PASS
}

export function middleware(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { message: 'Authentication required' },
            {
                status: 401,
                headers: { 'WWW-Authenticate': 'Basic' },
            },
        )
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/((?!favicon.ico|api/health).*)',
}
