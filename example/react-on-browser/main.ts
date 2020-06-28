import { pogo } from './dependencies.ts';
import { RouteHandler } from 'https://deno.land/x/pogo/lib/types.ts'

const server = pogo.server({ port : 3000 });
const handler: RouteHandler = (request, h) => {
    return h.file('./index.html')
}

server.router.get('/', handler);

server.router.get('/app.js', (request, h) => {
    return h.file('./build/app.js')
});

export default server;