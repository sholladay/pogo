import { React } from './dependencies.ts';

interface PostProps {
    text: string,
    title: string,
    authorName?: string
}

const Post = (props: PostProps) => {
    const {
        text,
        title,
        authorName = 'Anonymous'
    } = props;
    return (
        <>
            <h1>{title}</h1>
            <p>By: {authorName}</p>
            <p>{text}</p>
        </>
    );
}

export default Post;