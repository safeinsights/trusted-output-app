import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || ':').split(':')

function isAuthenticated(req: NextRequest) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')

    if (!authHeader) {
        return false
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')
    const user = auth[0]
    const pass = auth[1]

    if (user == AUTH_USER && pass == AUTH_PASS) {
        return true
    } else {
        return false
    }
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return new NextResponse('Authentication required', {
            status: 401,
            headers: { 'WWW-Authenticate': 'Basic' },
        })
    }

    return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: '/((?!favicon.ico).*)',
}
