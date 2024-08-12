import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { fabric } from 'fabric';

const IndexPage = () => {
    const [images, setImages] = useState({
        G: [] as string[],
        A: [] as string[],
        B: [] as string[],
        C: [] as string[]
    });

    const [resultImages, setResultImages] = useState<{ data: string; filename: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/images')
            .then(response => response.json())
            .then(data => setImages(data))
            .catch(err => setError('画像の取得に失敗しました'));
    }, []);

    useEffect(() => {
        fabric.Object.prototype.transparentCorners = false;
    }, []);

    const composeImages = async (formData: FormData) => {
        const posX_A = parseInt(formData.get('posX_A') as string);
        const posY_A = parseInt(formData.get('posY_A') as string);
        const posX_B = parseInt(formData.get('posX_B') as string);
        const posY_B = parseInt(formData.get('posY_B') as string);
        const posX_C = parseInt(formData.get('posX_C') as string);
        const posY_C = parseInt(formData.get('posY_C') as string);

        const { G, A, B, C } = images;

        const results: { data: string; filename: string }[] = [];

        for (const bg of G) {
            for (const imgA of A) {
                for (const imgB of B) {
                    for (const imgC of C) {
                        console.log(`Composing: ${imgA}_${imgB}_${imgC}_${bg}`);
                        const canvas = new fabric.Canvas(null, { width: 500, height: 500 });

                        // 背景画像を読み込んで配置
                        await new Promise<void>((resolve, reject) => {
                            fabric.Image.fromURL(`/images/G/${bg}`, (img, error) => {
                                if (error) {
                                    reject(`Failed to load background image ${bg}: ${error.message}`);
                                } else {
                                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                                    resolve();
                                }
                            });
                        });

                        // A, B, C の画像を読み込んで配置
                        await Promise.all([
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/A/${imgA}`, (img, error) => {
                                    if (error) {
                                        reject(`Failed to load image A ${imgA}: ${error.message}`);
                                    } else {
                                        img.set({ left: posX_A, top: posY_A });
                                        canvas.add(img);
                                        resolve();
                                    }
                                });
                            }),
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/B/${imgB}`, (img, error) => {
                                    if (error) {
                                        reject(`Failed to load image B ${imgB}: ${error.message}`);
                                    } else {
                                        img.set({ left: posX_B, top: posY_B });
                                        canvas.add(img);
                                        resolve();
                                    }
                                });
                            }),
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/C/${imgC}`, (img, error) => {
                                    if (error) {
                                        reject(`Failed to load image C ${imgC}: ${error.message}`);
                                    } else {
                                        img.set({ left: posX_C, top: posY_C });
                                        canvas.add(img);
                                        resolve();
                                    }
                                });
                            }),
                        ]);

                        // キャンバスを画像としてエクスポート
                        const base64Image = canvas.toDataURL({ format: 'png' });
                        const filename = `${imgA}_${imgB}_${imgC}_${bg}`;

                        console.log(`Composed: ${filename}`);
                        results.push({
                            data: base64Image,
                            filename: filename
                        });

                        // キャンバスを破棄
                        canvas.dispose();
                    }
                }
            }
        }
        console.log(`Total composed images: ${results.length}`);
        return results;
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
        const formData = new FormData(event.currentTarget);

        try {
            const composedImages = await composeImages(formData);
            console.log(`Setting ${composedImages.length} images to state`);
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

                <h2>結果画像 ({resultImages.length}枚)</h2>
                <div id="thumbnails">
                    {resultImages.length === 0 ? (
                        <p>合成画像がありません。</p>
                    ) : (
                        resultImages.map((image, index) => (
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
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

export default IndexPage;
