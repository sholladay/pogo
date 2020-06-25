import { pogo, React } from './dependencies.ts';
import Post from './post.tsx';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return (
        <>
            <Post
                title="my first post"
                text="Don't know what to write."
                authorName="dr.net"
            />
            <Post
                title="my second post"
                text="Want to write about IOT devices."
            />
        </>
    )
});

export default server;