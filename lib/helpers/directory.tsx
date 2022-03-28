import file from './file.ts';
import * as bang from '../bang.ts';
import ServerResponse from '../response.ts';
import isPathInside from '../util/is-path-inside.ts';
import readDirStats from '../util/read-dir-stats.ts';
import DirectoryListing from '../components/directory-listing.tsx';
import { React, path } from '../../dependencies.ts';

interface DirectoryHandlerOptions {
    listing: boolean
}

const directory = async (dirPath: string, filePath?: string, options?: DirectoryHandlerOptions): Promise<ServerResponse> => {
    const joinedFilePath = path.join(dirPath, filePath ?? '.');
    const isDirPath = path.relative(dirPath, joinedFilePath) === '';
    if (!isDirPath && !(await isPathInside.fs(joinedFilePath, dirPath))) {
        throw bang.forbidden();
    }
    const status = await Deno.stat(joinedFilePath);
    if (status.isFile) {
        return file(joinedFilePath, { confine : dirPath });
    }
    if (!options?.listing) {
        throw bang.forbidden();
    }
    const files = await readDirStats(joinedFilePath);
    files.sort((left, right) => {
        return left.name.localeCompare(right.name);
    });
    return ServerResponse.wrap(<DirectoryListing basePath={path.relative(dirPath, joinedFilePath)} files={files} />);
};

export default directory;
export type {
    DirectoryHandlerOptions
};
