import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { background, imageA, imageB, imageC, posX_A, posY_A, posX_B, posY_B, posX_C, posY_C } = req.body;

            // ここで、base64エンコードされた画像データを受け取ると仮定します
            const backgroundBuffer = Buffer.from(background.split(',')[1], 'base64');
            const imageABuffer = Buffer.from(imageA.split(',')[1], 'base64');
            const imageBBuffer = Buffer.from(imageB.split(',')[1], 'base64');
            const imageCBuffer = Buffer.from(imageC.split(',')[1], 'base64');

            const backgroundImage = await sharp(backgroundBuffer).metadata();

            const composite = await sharp(backgroundBuffer)
                .composite([
                    { input: imageABuffer, top: Math.round(parseFloat(posY_A) * (backgroundImage.height || 0)), left: Math.round(parseFloat(posX_A) * (backgroundImage.width || 0)) },
                    { input: imageBBuffer, top: Math.round(parseFloat(posY_B) * (backgroundImage.height || 0)), left: Math.round(parseFloat(posX_B) * (backgroundImage.width || 0)) },
                    { input: imageCBuffer, top: Math.round(parseFloat(posY_C) * (backgroundImage.height || 0)), left: Math.round(parseFloat(posX_C) * (backgroundImage.width || 0)) },
                ])
                .toBuffer();

            const resultBase64 = `data:image/png;base64,${composite.toString('base64')}`;

            res.status(200).json({ message: 'Image composed successfully', image: resultBase64 });
        } catch (error) {
            console.error('Error processing images:', error);
            res.status(500).json({ error: `Internal server error: ${(error as Error).message}` });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}