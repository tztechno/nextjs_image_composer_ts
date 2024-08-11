import { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import fs from 'fs/promises';
import path from 'path';
import Image from 'next/image';

interface HomeProps {
    initialResultImages: string[];
}

interface ResultImage {
    data: string;
    filename: string;
}

export default function Home({ initialResultImages }: HomeProps) {
    const [resultImages, setResultImages] = useState<ResultImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedImages = localStorage.getItem('resultImages');
        if (storedImages) {
            setResultImages(JSON.parse(storedImages));
        } else {
            setResultImages(initialResultImages.map(filename => ({ data: `/images/Result/${filename}`, filename })));
        }
    }, [initialResultImages]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            console.log('Submitting form data');
            const response = await fetch('/api/compose', {
                method: 'POST',
                body: formData,
            });

            console.log('Response received:', response.status);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Network response was not ok');
            }

            const result = await response.json();
            console.log('Result:', result);
            setResultImages(result.images);
            localStorage.setItem('resultImages', JSON.stringify(result.images));
        } catch (error) {
            console.error('Error:', error);
            setError(`An error occurred while composing the images: ${(error as Error).message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch('/api/download', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ images: resultImages }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate download');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'result_images.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError(`Failed to download images: ${(error as Error).message}`);
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
                    <h2>画像の設置位置を指定</h2>
                    <div>
                        <label htmlFor="posX_A">Ax:</label>
                        <input type="number" name="posX_A" step="0.1" required />
                        <label htmlFor="posY_A">Ay:</label>
                        <input type="number" name="posY_A" step="0.1" required />
                    </div>
                    <div>
                        <label htmlFor="posX_B">Bx:</label>
                        <input type="number" name="posX_B" step="0.1" required />
                        <label htmlFor="posY_B">By:</label>
                        <input type="number" name="posY_B" step="0.1" required />
                    </div>
                    <div>
                        <label htmlFor="posX_C">Cx:</label>
                        <input type="number" name="posX_C" step="0.1" required />
                        <label htmlFor="posY_C">Cy:</label>
                        <input type="number" name="posY_C" step="0.1" required />
                    </div>
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '処理中...' : '画像を合成して保存'}
                    </button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <h2>結果画像</h2>
                <div id="thumbnails">
                    {resultImages.map((image, index) => (
                        <div key={index} className="thumbnail">
                            <Image
                                src={image.data}
                                alt={`Result ${index + 1}`}
                                width={150}
                                height={150}
                                style={{ objectFit: 'contain', border: '1px solid #ddd' }}
                            />
                            <p>{image.filename}</p>
                        </div>
                    ))}
                </div>
                {resultImages.length > 0 && (
                    <button onClick={handleDownload}>Download Results</button>
                )}
            </main>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    return { props: { initialResultImages: [] } };
};