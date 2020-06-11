import Response from './response.ts';
import { ResponseBody } from './types.ts';
import { mime } from '../dependencies.ts';

export default class Toolkit {
    async file(path: string): Promise<Response> {
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
