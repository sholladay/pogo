import { pogo } from './dependencies.ts';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return 'Hello, world!';
});

export default server;
