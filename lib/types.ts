import Request from './request.ts';
import Response from './response.ts';
import Toolkit from './toolkit.ts';

export interface Route {
    method: string,
    path: string,
    handler: RouteHandler,
    vhost?: string
}

export type RequestParams = { [param: string]: string };

export interface RouteOptions extends Omit<Partial<Route>, 'method' | 'path'> {
    method?: Route['method'] | Iterable<Route['method']>,
    path?: Route['path'] | Iterable<Route['path']>
}

export interface NormalizedRoute extends Route {
    segments: Array<string>
}

export interface MatchedRoute extends NormalizedRoute {
    params: RequestParams
}

export interface ServerOptions {
    hostname?: string,
    port: number
}

type JSONStringifyable = boolean | null | number | object | string;
export type ResponseBody = Deno.Reader | Uint8Array | JSONStringifyable;
export type RouteHandlerResult = Response | ResponseBody | Error | Promise<Response | ResponseBody | Error>;
export type RouteHandler = (request: Request, h: Toolkit) => RouteHandlerResult;
