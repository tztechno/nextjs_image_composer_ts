import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const IndexPage = () => {
    const [images, setImages] = useState({
        G: [] as string[],
        A: [] as string[],
        B: [] as string[],
        C: [] as string[]
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/images')
            .then(response => response.json())
            .then(data => {
                setImages(data);
                setIsLoading(false);
            })
            .catch(err => {
                setError('画像の取得に失敗しました');
                setIsLoading(false);
            });
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <Head>
                <title>画像表示ツール</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main>
                <h1>画像表示ツール</h1>

                <h2>背景画像</h2>
                <div>
                    {images.G.map((img, index) => (
                        <div key={index}>
                            <h3>背景画像 {index + 1}</h3>
                            <Image
                                src={`/images/G/${img}`}
                                alt={`Background ${index + 1}`}
                                width={200}
                                height={200}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                        </div>
                    ))}
                </div>

                <h2>フォルダAの画像</h2>
                <div>
                    {images.A.map((img, index) => (
                        <div key={index}>
                            <h3>フォルダA画像 {index + 1}</h3>
                            <Image
                                src={`/images/A/${img}`}
                                alt={`Image A ${index + 1}`}
                                width={200}
                                height={200}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                        </div>
                    ))}
                </div>

                <h2>フォルダBの画像</h2>
                <div>
                    {images.B.map((img, index) => (
                        <div key={index}>
                            <h3>フォルダB画像 {index + 1}</h3>
                            <Image
                                src={`/images/B/${img}`}
                                alt={`Image B ${index + 1}`}
                                width={200}
                                height={200}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                        </div>
                    ))}
                </div>

                <h2>フォルダCの画像</h2>
                <div>
                    {images.C.map((img, index) => (
                        <div key={index}>
                            <h3>フォルダC画像 {index + 1}</h3>
                            <Image
                                src={`/images/C/${img}`}
                                alt={`Image C ${index + 1}`}
                                width={200}
                                height={200}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export default IndexPage;
