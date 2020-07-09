import file from './file.ts';
import * as bang from '../bang.ts';
import Response from '../response.ts';
import isPathInside from '../util/is-path-inside.ts';
import readDirStats from '../util/read-dir-stats.ts';
import DirectoryListing from '../components/directory-listing.tsx';
import { React, path } from '../../dependencies.ts';

export interface DirectoryHandlerOptions {
    listing: boolean
}

const directory = async (dirPath: string, filePath?: string, options?: DirectoryHandlerOptions): Promise<Response> => {
    const fp = path.join(dirPath, filePath ?? '.');
    if (fp !== dirPath && !(await isPathInside.fs(fp, dirPath))) {
        throw bang.forbidden();
    }
    const status = await Deno.stat(fp);
    if (status.isFile) {
        return file(fp, { confine : dirPath });
    }
    if (!options?.listing) {
        throw bang.forbidden();
    }
    const files = await readDirStats(fp);
    files.sort((left, right) => {
        return left.name.localeCompare(right.name);
    });
    return Response.wrap(<DirectoryListing basePath={path.relative(dirPath, fp)} files={files} />);
};

export default directory;
