import directory, { DirectoryHandlerOptions } from './helpers/directory.tsx';
import file, { FileHandlerOptions } from './helpers/file.ts';
import ServerRequest from './request.ts';
import ServerResponse from './response.ts';
import { ResponseBody } from './types.ts';

/**
 * A response toolkit contains various utility methods for creating responses.
 * Pogo passes a toolkit instance as the second argument to route handlers.
 */
export default class Toolkit {
    request: ServerRequest
    constructor(request: ServerRequest) {
        this.request = request;
    }
    async file(path: string, options?: FileHandlerOptions): Promise<ServerResponse> {
        return file(path, options);
    }
    async directory(path: string, options?: DirectoryHandlerOptions): Promise<ServerResponse> {
        const lastParamName = this.request.route.paramNames[this.request.route.paramNames.length - 1];
        const filePath = this.request.params[lastParamName];
        return directory(path, filePath, options);
    }
    response(body?: ResponseBody): ServerResponse {
        return new ServerResponse({ body });
    }
    redirect(url: string): ServerResponse {
        return this.response().redirect(url);
    }
}
