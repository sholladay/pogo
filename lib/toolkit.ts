import Response from './response.ts';
import * as bang from './bang.ts';
import { ToolkitInterface, FileHandlerOptions, ResponseBody } from './types.ts';
import isPathInside from './util/is-path-inside.ts';
import { mime } from '../dependencies.ts';

export default class Toolkit implements ToolkitInterface {
    async file(path: string, options?: FileHandlerOptions): Promise<Response> {
        if (options?.confine !== false) {
            const confine = typeof options?.confine === 'string' ? options.confine : Deno.cwd();
            if (!(await isPathInside.fs(path, confine))) {
                throw bang.forbidden();
            }
        }
        const file = await Deno.readFile(path);
        const mediaType = mime.lookup(path);
        const contentType = mime.contentType(mediaType || '');
        const response = this.response(file);
        if (contentType) {
            response.type(contentType);
        }
        return response;
    }
    response(body?: ResponseBody): Response {
        return new Response({ body });
    }
    redirect(url: string): Response {
        return this.response().redirect(url);
    }
}
