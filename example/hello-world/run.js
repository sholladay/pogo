import pogo from 'https://deno.land/x/pogo/main.js';

const server = pogo.server({ port : 3000 });

server.route({
    method : 'GET',
    path   : '/',
    handler() {
        return 'Hello, world!';
    }
});

server.start();
