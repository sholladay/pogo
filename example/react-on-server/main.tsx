import { pogo, React } from './dependencies.ts';
import Post from './post.tsx';

const server = pogo.server({ port : 3000 });

server.router.get('/', () => {
    return (
        <>
            <Post
                title="My Second Post"
                text="Let's talk about IOT devices..."
            />
            <Post
                title="My First Post"
                text="Welcome to my blog..."
                authorName="Jane Doe"
            />
        </>
    );
});

export default server;
