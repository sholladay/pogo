import pogo from 'https://deno.land/x/pogo/main.ts';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return 'Hello, world!';
});

server.start();
