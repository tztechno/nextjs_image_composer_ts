import type { AppProps } from 'next/app'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Fabric.jsの初期化
    if (typeof window !== 'undefined') {
      const fabric = require('fabric').fabric;
      fabric.Object.prototype.transparentCorners = false;
    }
  }, [])

  return <Component {...pageProps} />
}

export default MyApp