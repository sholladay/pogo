import { RouteHandler } from './client/dependencies.ts';
import { pogo } from './dependencies.ts';

const server = pogo.server({ port : 3000 });

// The RouteHandler type can improve autocomplete when you define a route in a separate file from the server
const handler: RouteHandler = (request, h) => {
    return h.file('./index.html');
};

server.router.get('/', handler);

server.router.get('/app.js', (request, h) => {
    return h.file('./build/app.js');
});

export default server;
