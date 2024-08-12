const composeImages = async (formData: FormData) => {
    const posX_A = parseInt(formData.get('posX_A') as string);
    const posY_A = parseInt(formData.get('posY_A') as string);
    const posX_B = parseInt(formData.get('posX_B') as string);
    const posY_B = parseInt(formData.get('posY_B') as string);
    const posX_C = parseInt(formData.get('posX_C') as string);
    const posY_C = parseInt(formData.get('posY_C') as string);

    const { backgrounds, imagesA, imagesB, imagesC } = images;

    const results: { data: string; filename: string }[] = [];

    for (const bg of backgrounds) {
        for (const imgA of imagesA) {
            for (const imgB of imagesB) {
                for (const imgC of imagesC) {
                    console.log(`Composing: ${imgA}_${imgB}_${imgC}_${bg}`);
                    const canvas = new fabric.Canvas(null, { width: 500, height: 500 });

                    try {
                        await new Promise<void>((resolve, reject) => {
                            fabric.Image.fromURL(`/images/background/${bg}`, (img) => {
                                if (img) {
                                    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
                                    resolve();
                                } else {
                                    reject(`Failed to load background image ${bg}`);
                                }
                            });
                        });

                        await Promise.all([
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/A/${imgA}`, (img) => {
                                    if (img) {
                                        img.set({ left: posX_A, top: posY_A });
                                        canvas.add(img);
                                        resolve();
                                    } else {
                                        reject(`Failed to load image A ${imgA}`);
                                    }
                                });
                            }),
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/B/${imgB}`, (img) => {
                                    if (img) {
                                        img.set({ left: posX_B, top: posY_B });
                                        canvas.add(img);
                                        resolve();
                                    } else {
                                        reject(`Failed to load image B ${imgB}`);
                                    }
                                });
                            }),
                            new Promise<void>((resolve, reject) => {
                                fabric.Image.fromURL(`/images/C/${imgC}`, (img) => {
                                    if (img) {
                                        img.set({ left: posX_C, top: posY_C });
                                        canvas.add(img);
                                        resolve();
                                    } else {
                                        reject(`Failed to load image C ${imgC}`);
                                    }
                                });
                            }),
                        ]);

                        const base64Image = canvas.toDataURL({ format: 'png' });

                        const filename = `${imgA}_${imgB}_${imgC}_${bg}`;

                        console.log(`Composed: ${filename}`);
                        results.push({
                            data: base64Image,
                            filename: filename
                        });

                        canvas.dispose();
                    } catch (error) {
                        console.error(error);
                        setError(`An error occurred: ${(error as Error).message}`);
                    }
                }
            }
        }
    }
    console.log(`Total composed images: ${results.length}`);
    return results;
};
