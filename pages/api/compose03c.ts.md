import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { posX_A, posY_A, posX_B, posY_B, posX_C, posY_C } = req.body;

            const publicDir = path.join(process.cwd(), 'public');
            const imagesA = await fs.readdir(path.join(publicDir, 'images', 'A'));
            const imagesB = await fs.readdir(path.join(publicDir, 'images', 'B'));
            const imagesC = await fs.readdir(path.join(publicDir, 'images', 'C'));
            const backgrounds = await fs.readdir(path.join(publicDir, 'images', 'background'));

            const results = [];

            for (const bg of backgrounds) {
                for (const imgA of imagesA) {
                    for (const imgB of imagesB) {
                        for (const imgC of imagesC) {
                            const background = sharp(path.join(publicDir, 'images', 'background', bg));
                            const imageA = sharp(path.join(publicDir, 'images', 'A', imgA));
                            const imageB = sharp(path.join(publicDir, 'images', 'B', imgB));
                            const imageC = sharp(path.join(publicDir, 'images', 'C', imgC));

                            const composite = await background.composite([
                                { input: await imageA.toBuffer(), top: parseInt(posY_A), left: parseInt(posX_A) },
                                { input: await imageB.toBuffer(), top: parseInt(posY_B), left: parseInt(posX_B) },
                                { input: await imageC.toBuffer(), top: parseInt(posY_C), left: parseInt(posX_C) },
                            ]).toBuffer();

                            const base64Image = `data:image/png;base64,${composite.toString('base64')}`;
                            results.push({
                                data: base64Image,
                                filename: `${path.basename(imgA)}_${path.basename(imgB)}_${path.basename(imgC)}_${bg}`
                            });
                        }
                    }
                }
            }

            res.status(200).json({ images: results });
        } catch (error) {
            console.error('Error processing images:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}