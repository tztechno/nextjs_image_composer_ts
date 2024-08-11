import { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Image from 'next/image';

interface ResultImage {
    data: string;
    filename: string;
}

interface HomeProps {
    initialResultImages: ResultImage[];
}

const [resultImages, setResultImages] = useState<ResultImage[]>(initialResultImages);

export default function Home({ initialResultImages }: HomeProps) {
    const [resultImages, setResultImages] = useState<ResultImage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedImages = localStorage.getItem('resultImages');
        if (storedImages) {
            setResultImages(JSON.parse(storedImages));
        }
    }, []);

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
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setResultImages(result.images);
            localStorage.setItem('resultImages', JSON.stringify(result.images));
        } catch (error) {
            console.error('Error:', error);
            setError(`画像の合成中にエラーが発生しました: ${(error as Error).message}`);
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
                <h1>画像合成ツールvc</h1>
                <form onSubmit={handleSubmit}>
                    <h2>画像の設置位置を指定</h2>
                    {['A', 'B', 'C'].map((letter) => (
                        <div key={letter}>
                            <label htmlFor={`posX_${letter}`}>{`${letter}x : `}</label>
                            <input type="number" id={`posX_${letter}`} name={`posX_${letter}`} step="0.1" required />
                            <br />
                            <label htmlFor={`posY_${letter}`}>{`${letter}y : `}</label>
                            <input type="number" id={`posY_${letter}`} name={`posY_${letter}`} step="0.1" required />
                        </div>
                    ))}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? '処理中...' : '画像を合成して保存'}
                    </button>
                </form>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <h2>結果画像</h2>
                <div id="thumbnails">
                    {resultImages.map((image, index) => (
                        <div key={image.filename} className="thumbnail">
                            <Image
                                src={image.data}
                                alt={`結果画像 ${index + 1}`}
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