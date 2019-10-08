import { pogo } from './dependencies.js';

const server = pogo.server({ port : 3000 });

server.route({
    method : 'GET',
    path   : '/',
    handler() {
        return 'Hello, world!';
    }
});

export default server;
