import directory, { DirectoryHandlerOptions } from './helpers/directory.tsx';
import file, { FileHandlerOptions } from './helpers/file.ts';
import Request from './request.ts';
import Response from './response.ts';
import { ResponseBody } from './types.ts';

export default class Toolkit {
    request: Request
    constructor(request: Request) {
        this.request = request;
    }
    async file(path: string, options?: FileHandlerOptions): Promise<Response> {
        return file(path, options);
    }
    async directory(path: string, options?: DirectoryHandlerOptions): Promise<Response> {
        const lastParamName = this.request.route.paramNames[this.request.route.paramNames.length - 1];
        const filePath = this.request.params[lastParamName];
        return directory(path, filePath, options);
    }
    response(body?: ResponseBody): Response {
        return new Response({ body });
    }
    redirect(url: string): Response {
        return this.response().redirect(url);
    }
}
