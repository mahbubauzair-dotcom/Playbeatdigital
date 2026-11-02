import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { adminRouter } from './src/server/adminRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));

  // Mount Admin API routes under /api/admin
  app.use('/api/admin', adminRouter);

  if (!isProd) {
    // In dev: integrate Vite via connect middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve pre-rendered static assets
    const outDir = path.resolve(__dirname, 'out');
    app.use(express.static(outDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(outDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PlayBeat Server] Ready on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[PlayBeat Server] Failed to start:', err);
  process.exit(1);
});
