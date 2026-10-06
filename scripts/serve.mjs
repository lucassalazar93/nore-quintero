import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, extname, sep} from 'node:path';
import {networkInterfaces} from 'node:os';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 3000);
// Por defecto solo este equipo. `--lan` (npm run dev:lan) lo abre a la red local para probar desde el teléfono.
const lan = process.argv.includes('--lan');
const host = process.env.HOST || (lan ? '0.0.0.0' : '127.0.0.1');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8','.json':'application/json; charset=utf-8','.woff2':'font/woff2'};
const server = createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405, {Allow:'GET, HEAD'}).end(); return;}
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = resolve(root, '.' + pathname);
    if (file !== resolve(root) && !file.startsWith(resolve(root) + sep)) {res.writeHead(403).end(); return;}
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, {'Content-Type':types[extname(file)] || 'application/octet-stream','Content-Length':body.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (error) {
    const status = error instanceof URIError ? 400 : ['ENOENT','ENOTDIR'].includes(error.code) ? 404 : 500;
    res.writeHead(status, {'Content-Type':'text/plain; charset=utf-8'}).end(status === 404 ? 'Archivo no encontrado' : 'No se pudo atender la solicitud');
  }
});
server.on('error', error => {console.error(`No se pudo iniciar: ${error.message}. Puedes cambiar el puerto con PORT.`); process.exit(1);});
server.listen(port, host, () => {
  if (host !== '0.0.0.0') {console.log(`Nore Quintero disponible en http://${host}:${port}`); return;}
  const addresses = Object.values(networkInterfaces()).flat().filter(item => item.family === 'IPv4' && !item.internal).map(item => item.address);
  console.log(`Nore Quintero disponible en http://127.0.0.1:${port} y, en la red local, en:\n${addresses.map(address => `  http://${address}:${port}`).join('\n')}`);
});
