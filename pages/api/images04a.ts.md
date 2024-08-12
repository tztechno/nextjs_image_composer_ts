// pages/api/images.ts

import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const getImageFileNames = (dir: string) => {
    return fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const publicPath = path.join(process.cwd(), 'public/images');

    const folders = ['G', 'A', 'B', 'C'];
    const images: { [key: string]: string[] } = {};

    folders.forEach(folder => {
        const folderPath = path.join(publicPath, folder);
        if (fs.existsSync(folderPath)) {
            images[folder] = getImageFileNames(folderPath);
        } else {
            images[folder] = [];
        }
    });

    res.status(200).json(images);
}
