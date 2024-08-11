import type { NextConfig } from 'next'

const config: NextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve = {
                ...config.resolve,
                fallback: {
                    ...config.resolve?.fallback,
                    fs: false,
                    path: false,
                    os: false,
                },
            }
        }
        return config
    },
    // 画像ドメインの設定（必要に応じて）
    images: {
        domains: ['localhost', 'vercel-image-composer.vercel.app'],
    },
}

export default config