import express from 'express';
import multer from 'multer';
import { Client } from '@gradio/client';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
const upload = multer({ storage: multer.memoryStorage() });
app.post('/solve-captcha', upload.single('image'), async (req, res) => {
    try {
        let imageBuffer;
        if (req.file) {
            imageBuffer = req.file.buffer;
        } else if (req.body.image) {
            const base64String = req.body.image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
            imageBuffer = Buffer.from(base64String, 'base64');
        } else {
            return res.status(400).json({ error: 'No image provided' });
        }

        const client = await Client.connect("docparser/Text_Captcha_breaker");
        const result = await client.predict("/predict", { img_org: imageBuffer });

        res.json({ captcha: result.data });
    } catch (error) {
        console.error('Error solving CAPTCHA:', error);
        res.status(500).json({ error: 'Failed to solve CAPTCHA' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});