import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';
import { defineConfig, type Connect, type Plugin, type ViteDevServer } from 'vite';

function mountLocalApiRoute(server: ViteDevServer, route: string, modulePath: string) {
  server.middlewares.use(route, async (req: Connect.IncomingMessage, res) => {
    try {
      const url = new URL(req.url || '', 'http://localhost');
      const query: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        query[key] = value;
      });

      let body: unknown = undefined;
      if (req.method === 'POST') {
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const raw = Buffer.concat(chunks).toString('utf8');
        body = raw ? JSON.parse(raw) : {};
      }

      const vercelReq = Object.assign(req, { query, body });
      const vercelRes = Object.assign(res, {
        status(code: number) {
          res.statusCode = code;
          return vercelRes;
        },
        json(payload: unknown) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(payload));
          return vercelRes;
        },
      });

      const mod = await server.ssrLoadModule(modulePath);
      await mod.default(vercelReq, vercelRes);
    } catch (err) {
      console.error(`Local ${route} error:`, err);
      if (!res.writableEnded) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Local API handler error.' }));
      }
    }
  });
}

function localApiPlugin(): Plugin {
  const virtualPgId = '\0local-pg-cjs-shim';
  return {
    name: 'local-vercel-api',
    resolveId(id, _importer, options) {
      if (options?.ssr && id === 'pg') {
        return virtualPgId;
      }
    },
    load(id) {
      if (id === virtualPgId) {
        return [
          "import { createRequire } from 'node:module';",
          'const require = createRequire(import.meta.url);',
          "const pg = require('pg');",
          'export const { Pool, Client, Query, Connection, Result, DatabaseError, TypeOverrides, escapeIdentifier, escapeLiteral, defaults, types, utils } = pg;',
          'export default pg;',
        ].join('\n');
      }
    },
    configureServer(server) {
      dotenv.config({ path: '.env.local' });
      dotenv.config();
      mountLocalApiRoute(server, '/api/student-auth', '/api/student-auth.ts');
      mountLocalApiRoute(server, '/api/student-data', '/api/student-data.ts');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), localApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
