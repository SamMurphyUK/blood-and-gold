import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const audioRoot = join(process.cwd(), 'assets', 'audio');

function sendAudioFile(req: Connect.IncomingMessage, res: Connect.ServerResponse, next: Connect.NextFunction) {
  const raw = req.url?.split('?')[0] ?? '';
  if (!raw.includes('/assets/audio/')) {
    next();
    return;
  }
  const name = decodeURIComponent(raw.slice(raw.indexOf('/assets/audio/') + '/assets/audio/'.length));
  const file = normalize(join(audioRoot, name));
  if (!file.startsWith(audioRoot) || !existsSync(file) || !statSync(file).isFile()) {
    next();
    return;
  }
  res.setHeader('Content-Type', 'audio/mpeg');
  createReadStream(file).pipe(res);
}

function audioAssetsPlugin(): Plugin {
  return {
    name: 'audio-assets',
    configureServer(server) {
      server.middlewares.use(sendAudioFile);
    },
    configurePreviewServer(server) {
      server.middlewares.use(sendAudioFile);
    },
    writeBundle(options) {
      const outDir = options.dir ?? join(process.cwd(), 'dist');
      cpSync(audioRoot, join(outDir, 'assets', 'audio'), { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), audioAssetsPlugin()],
  base: './',
});
