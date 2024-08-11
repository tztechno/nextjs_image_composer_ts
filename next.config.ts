import type { NextConfig } from 'next'
import type { Configuration as WebpackConfig } from 'webpack'

const config: NextConfig = {
    webpack: (config: WebpackConfig, { isServer }: { isServer: boolean }) => {
        if (!isServer) {
            config.resolve = config.resolve || {}
            config.resolve.fallback = {
                ...(config.resolve.fallback || {}),
                fs: false,
            }
        }
        return config
    },
}

export default config