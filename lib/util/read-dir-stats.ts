import { path } from '../../dependencies.ts';

interface NamedStat extends Deno.FileInfo {
    name: Deno.DirEntry['name']
}

const readDirStats = async (dir: string): Promise<Array<NamedStat>> => {
    const stats: Array<Promise<NamedStat>> = [];
    const statEntry = async (file: Deno.DirEntry): Promise<NamedStat> => {
        const status = await Deno.stat(path.join(dir, file.name));
        return {
            ...file,
            ...status
        };
    };
    for await (const child of Deno.readDir(dir)) {
        stats.push(statEntry(child));
    }
    return Promise.all(stats);
};

export default readDirStats;
export type {
    NamedStat
};
