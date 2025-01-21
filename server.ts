import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, join } from 'node:path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();

  // Resolve paths
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');
  
  // Create the SSR engine instance
  const commonEngine = new CommonEngine();

  // Set view engine and views path
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Serve static files (Angular assets like JS, CSS, etc.)
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y',  // Cache static files for 1 year
    index: false,  // Avoid using index.html here
  }));

  // SSR route for Angular Universal rendering
  server.get('**', (req, res, next) => {
    const { protocol, originalUrl, headers, baseUrl } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))  // Send the rendered HTML to the client
      .catch((err) => next(err));  // Handle errors
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
