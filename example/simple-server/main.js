import { pogo } from './dependencies.js';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return 'Hello, world!';
});

export default server;
