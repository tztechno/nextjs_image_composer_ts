import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

const IndexPage = () => {
    const [images, setImages] = useState({
        backgrounds: [] as string[],
        imagesA: [] as string[],
        imagesB: [] as string[],
        imagesC: [] as string[]
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 画像リストを手動で設定する例
    useEffect(() => {
        setImages({
            backgrounds: ['bg1.png', 'bg2.png'],
            imagesA: ['A1.png', 'A2.png'],
            imagesB: ['B1.png', 'B2.png'],
            imagesC: ['C1.png', 'C2.png']
        });
    }, []);

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
                    {images.backgrounds.map((bg, index) => (
                        <div key={index}>
                            <h3>背景画像 {index + 1}</h3>
                            <Image
                                src={`/images/background/${bg}`}
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
                    {images.imagesA.map((img, index) => (
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
                    {images.imagesB.map((img, index) => (
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
                    {images.imagesC.map((img, index) => (
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
