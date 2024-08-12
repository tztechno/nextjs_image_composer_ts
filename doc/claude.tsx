import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const composeImages = async (formData: FormData) => {
        // この関数内で画像の合成処理を行います
        // 実際の処理はクライアントサイドのJavaScriptライブラリを使用して実装します
        // 例: fabricjs, konvajs など
        // ここでは仮の実装として、ダミーの合成結果を返します
        return ['data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='];
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            const composedImages = await composeImages(formData);
            setResultImages(composedImages);
        } catch (error) {
            console.error('Error:', error);
            setError(`An error occurred while composing the images: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <Head>
                <title>画像合成ツール</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <main>
                <h1>画像合成ツール</h1>
                <form onSubmit={handleSubmit}>
                    {/* フォームの内容は変更なし */}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '処理中...' : '画像を合成'}
                    </button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <h2>結果画像</h2>
                <div id="thumbnails">
                    {resultImages.map((image, index) => (
                        <div key={index} className="thumbnail">
                            <Image
                                src={image}
                                alt={`Result ${index + 1}`}
                                width={150}
                                height={150}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}