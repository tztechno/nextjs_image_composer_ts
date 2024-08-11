import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { Buffer } from 'buffer';

const upload = multer({ dest: 'uploads/' });

const FOLDERS = {
    A: path.join(process.cwd(), 'public', 'images', 'A'),
    B: path.join(process.cwd(), 'public', 'images', 'B'),
    C: path.join(process.cwd(), 'public', 'images', 'C'),
    background: path.join(process.cwd(), 'public', 'images', 'background'),
    result: path.join(process.cwd(), 'public', 'images', 'Result'),
};

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method === 'POST') {

        try {
            // Multer middleware
            await new Promise((resolve, reject) => {
                upload.none()(req, res, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            const imagesA = fs.readdirSync(FOLDERS.A).filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
            const imagesB = fs.readdirSync(FOLDERS.B).filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
            const imagesC = fs.readdirSync(FOLDERS.C).filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));
            const backgrounds = fs.readdirSync(FOLDERS.background).filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));

            if (backgrounds.length === 0 || imagesA.length === 0 || imagesB.length === 0 || imagesC.length === 0) {
                return res.status(400).json({ error: 'One or more image folders are empty.' });
            }

            const { posX_A, posY_A, posX_B, posY_B, posX_C, posY_C } = req.body;

            const composedImages = [];

            for (const background of backgrounds) {
                for (const imageA of imagesA) {
                    for (const imageB of imagesB) {
                        for (const imageC of imagesC) {
                            const backgroundPath = path.join(FOLDERS.background, background);
                            const imageAPath = path.join(FOLDERS.A, imageA);
                            const imageBPath = path.join(FOLDERS.B, imageB);
                            const imageCPath = path.join(FOLDERS.C, imageC);

                            const backgroundImage = await sharp(backgroundPath).metadata();

                            const composite = await sharp(backgroundPath)
                                .composite([
                                    { input: imageAPath, top: Math.round(parseFloat(posY_A) * backgroundImage.height), left: Math.round(parseFloat(posX_A) * backgroundImage.width) },
                                    { input: imageBPath, top: Math.round(parseFloat(posY_B) * backgroundImage.height), left: Math.round(parseFloat(posX_B) * backgroundImage.width) },
                                    { input: imageCPath, top: Math.round(parseFloat(posY_C) * backgroundImage.height), left: Math.round(parseFloat(posX_C) * backgroundImage.width) },
                                ])
                                .toBuffer();

                            const resultFilename = `${path.basename(imageA, path.extname(imageA))}_${path.basename(imageB, path.extname(imageB))}_${path.basename(imageC, path.extname(imageC))}_${path.basename(background, path.extname(background))}.png`;

                            // ファイルシステムに書き込む代わりに、Base64エンコードされた文字列として保存
                            const base64Image = `data:image/png;base64,${composite.toString('base64')}`;
                            composedImages.push({ name: resultFilename, data: base64Image });
                        }
                    }
                }
            }

            res.status(200).json({ message: 'Images composed successfully', images: composedImages });


        } catch (error) {
            console.error('Error processing images:', error);
            res.status(500).json({ error: `Internal server error: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}