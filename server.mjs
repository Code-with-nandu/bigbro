import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSevakPhotoRouter } from './server/photo-upload.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY ?? '';
const imageDirectory = path.join(root, 'public', 'sample-sevak');
console.info(`[sevak-photo] image directory=${imageDirectory}`);

app.use(createSevakPhotoRouter({ supabaseUrl, publishableKey, imageDirectory }));
app.use('/sample-sevak', express.static(imageDirectory, { fallthrough: false, immutable: true, maxAge: '1y' }));
app.use(express.static(path.join(root, 'dist')));
app.get('*', (_req, res) => res.sendFile(path.join(root, 'dist', 'index.html')));

const port = Number(process.env.PORT ?? 3001);
app.listen(port, '0.0.0.0', () => console.log(`BigBro server listening on ${port}`));
