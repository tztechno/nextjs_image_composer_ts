import { useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import fs from 'fs/promises';
import path from 'path';

interface HomeProps {
    initialResultImages: string[];
}

export default function Home({ initialResultImages }: HomeProps) {
    const [resultImages, setResultImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const storedImages = localStorage.getItem('resultImages');
        if (storedImages) {
            setResultImages(JSON.parse(storedImages));
        } else {
            setResultImages(initialResultImages);
        }
    }, [initialResultImages]);

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
            {/* ... (既存のコード) ... */}
            <h2>結果画像</h2>
            <div id="thumbnails">
                {resultImages.map((image, index) => (
                    <div key={index} className="thumbnail">
                        <img
                            src={image}
                            alt={`Result ${index + 1}`}
                            style={{ width: '150px', height: 'auto', border: '1px solid #ddd' }}
                        />
                    </div>
                ))}
            </div>
            {resultImages.length > 0 && (
                <button onClick={handleDownload}>Download Results</button>
            )}
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
    return { props: { initialResultImages: [] } };
};