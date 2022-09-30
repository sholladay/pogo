import { RouteHandler } from './client/dependencies.ts';
import { pogo } from './dependencies.ts';

const server = pogo.server({ port : 3000 });
const handler: RouteHandler = (request, h) => {
    return h.file('./index.html')
}

server.router.get('/', handler);

server.router.get('/app.js', (request, h) => {
    return h.file('./build/app.js')
});

export default server;
