import { useState } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import fs from 'fs/promises';
import path from 'path';

interface HomeProps {
    initialResultImages: string[];
}

export default function Home({ initialResultImages }: HomeProps) {
    const [resultImages, setResultImages] = useState<string[]>(initialResultImages);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            const response = await fetch('/api/compose', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const result = await response.json();
            setResultImages(result.images);
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
                <link rel="stylesheet" href="/css/styles.css" />
            </Head>

            <main>
                <h1>画像合成ツール</h1>
                <form onSubmit={handleSubmit}>
                    <h2>画像の設置位置を指定</h2>
                    <div>
                        <label htmlFor="posX_A">imageAのx位置:</label>
                        <input type="number" name="posX_A" step="0.1" required />
                        <label htmlFor="posY_A">imageAのy位置:</label>
                        <input type="number" name="posY_A" step="0.1" required />
                    </div>
                    <div>
                        <label htmlFor="posX_B">imageBのx位置:</label>
                        <input type="number" name="posX_B" step="0.1" required />
                        <label htmlFor="posY_B">imageBのy位置:</label>
                        <input type="number" name="posY_B" step="0.1" required />
                    </div>
                    <div>
                        <label htmlFor="posX_C">imageCのx位置:</label>
                        <input type="number" name="posX_C" step="0.1" required />
                        <label htmlFor="posY_C">imageCのy位置:</label>
                        <input type="number" name="posY_C" step="0.1" required />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '処理中...' : '画像を合成して保存'}
                    </button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <h2>結果画像</h2>
                <div id="thumbnails">
                    {resultImages.map((image) => (
                        <div key={image} className="thumbnail">
                            <img
                                src={`/images/Result/${image}`}
                                alt={image}
                                style={{ width: '150px', height: 'auto', border: '1px solid #ddd' }}
                            />
                            <p>{image}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    const FOLDERS = {
        result: path.join(process.cwd(), 'public', 'images', 'Result'),
    };

    try {
        const files = await fs.readdir(FOLDERS.result);
        const imageFiles = files.filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
        return { props: { initialResultImages: imageFiles } };
    } catch (error) {
        console.error('Error reading Result folder:', error);
        return { props: { initialResultImages: [] } };
    }
};