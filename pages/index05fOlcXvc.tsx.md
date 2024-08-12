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
        const posX_A = parseFloat(formData.get('posX_A') as string);
        const posY_A = parseFloat(formData.get('posY_A') as string);
        const posX_B = parseFloat(formData.get('posX_B') as string);
        const posY_B = parseFloat(formData.get('posY_B') as string);
        const posX_C = parseFloat(formData.get('posX_C') as string);
        const posY_C = parseFloat(formData.get('posY_C') as string);

        const { G, A, B, C } = images;

        const results: { data: string; filename: string }[] = [];

        for (const bg of G) {
            for (const imgA of A) {
                for (const imgB of B) {
                    for (const imgC of C) {
                        console.log(`Composing: ${imgA}_${imgB}_${imgC}_${bg}`);
                        const canvas = new fabric.Canvas(null, { width: 500, height: 500 }) as fabric.Canvas & {
                            width: number;
                            height: number;
                        };

                        // 背景画像を読み込んで配置
                        await new Promise<void>((resolve, reject) => {
                            fabric.Image.fromURL(`/images/G/${bg}`,
                                (img: fabric.Image) => {
                                    if (!img) {
                                        reject(`Failed to load background image ${bg}`);
                                        return;
                                    }
                                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                                    resolve();
                                },
                                {
                                    crossOrigin: 'anonymous'
                                }
                            );
                        });

                        // A, B, C の画像を読み込んで配置
                        await Promise.all([

                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/A/${imgA}`,
                                    (img: fabric.Image) => {
                                        if (!img) {
                                            reject(`Failed to load image A ${imgA}`);
                                            return;
                                        }
                                        const canvasWidth = canvas.width || 500;  // デフォルト値を設定
                                        const canvasHeight = canvas.height || 500;  // デフォルト値を設定
                                        img.set({
                                            left: posX_A * canvasWidth,
                                            top: posY_A * canvasHeight
                                        });
                                        canvas.add(img);
                                        resolve();
                                    },
                                    { crossOrigin: 'anonymous' }
                                );
                            }),

                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/B/${imgB}`,
                                    (img: fabric.Image) => {
                                        if (!img) {
                                            reject(`Failed to load image B ${imgA}`);
                                            return;
                                        }
                                        const canvasWidth = canvas.width || 500;  // デフォルト値を設定
                                        const canvasHeight = canvas.height || 500;  // デフォルト値を設定
                                        img.set({
                                            left: posX_B * canvasWidth,
                                            top: posY_B * canvasHeight
                                        });
                                        canvas.add(img);
                                        resolve();
                                    },
                                    { crossOrigin: 'anonymous' }
                                );
                            }),

                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/C/${imgC}`,
                                    (img: fabric.Image) => {
                                        if (!img) {
                                            reject(`Failed to load image C ${imgA}`);
                                            return;
                                        }
                                        const canvasWidth = canvas.width || 500;  // デフォルト値を設定
                                        const canvasHeight = canvas.height || 500;  // デフォルト値を設定
                                        img.set({
                                            left: posX_C * canvasWidth,
                                            top: posY_C * canvasHeight
                                        });
                                        canvas.add(img);
                                        resolve();
                                    },
                                    { crossOrigin: 'anonymous' }
                                );
                            }),

                        ]);

                        // キャンバスを画像としてエクスポート
                        const base64Image = canvas.toDataURL('image/png');
                        const filename = `${imgA.split('.')[0]}_${imgB.split('.')[0]}_${imgC.split('.')[0]}_${bg.split('.')[0]}.png`;

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

    const downloadImage = (filename: string, data: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = filename;
        link.click();
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

            // ダウンロード機能を実行
            for (const image of composedImages) {
                downloadImage(image.filename, image.data);
            }

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
                            <input type="number" id={`posX_${letter}`} name={`posX_${letter}`} step="0.01" min="0" max="1" required />
                            <br />
                            <label htmlFor={`posY_${letter}`}>{`${letter}y : `}</label>
                            <input type="number" id={`posY_${letter}`} name={`posY_${letter}`} step="0.01" min="0" max="1" required />
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
