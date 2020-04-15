import Response from './response.ts';

type JSONStringifyable = boolean | null | number | object | string;
type ResponseBody = Deno.Reader | Uint8Array | JSONStringifyable;

export default class Toolkit {
    response(body?: ResponseBody): Response {
        return new Response({ body });
    }
    redirect(url: string): Response {
        return this.response().redirect(url);
    }
}
