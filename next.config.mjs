import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isLambda = process.env.LAMBDA_DEPLOYMENT === 'true'

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    transpilePackages: ['si-encryption'],
    ...(isLambda && {
        outputFileTracingRoot: path.join(__dirname, '../../'),
        images: {
            unoptimized: true,
        },
        // Optimize for serverless
        poweredByHeader: false,
        reactStrictMode: false,
    }),
}

export default nextConfig
