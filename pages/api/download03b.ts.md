import { NextApiRequest, NextApiResponse } from 'next';
import JSZip from 'jszip';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { images } = req.body;

            const zip = new JSZip();

            images.forEach((image: { data: string; filename: string }) => {
                const base64Data = image.data.replace(/^data:image\/\w+;base64,/, '');
                const buffer = Buffer.from(base64Data, 'base64');
                zip.file(image.filename, buffer);
            });

            const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename=result_images.zip');
            res.send(zipBuffer);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to generate download' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}