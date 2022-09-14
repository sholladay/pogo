import ServerResponse from '../response.ts';
import * as bang from '../bang.ts';
import isPathInside from '../util/is-path-inside.ts';
import { mime } from '../../dependencies.ts';

interface FileHandlerOptions {
    confine: boolean | string
}

const file = async (path: string, options?: FileHandlerOptions): Promise<ServerResponse> => {
    if (options?.confine !== false) {
        const confine = typeof options?.confine === 'string' ? options.confine : '.';
        if (!(await isPathInside.fs(path, confine))) {
            throw bang.forbidden();
        }
    }
    const file = await Deno.readFile(path);
    const mediaType = mime.lookup(path);
    const contentType = mime.contentType(mediaType || '');
    const response = new ServerResponse({ body : file });
    if (contentType) {
        response.type(contentType);
    }
    return response;
};

export default file;
export type {
    FileHandlerOptions
};
