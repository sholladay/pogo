import Request from './request.ts';
import Response from './response.ts';
import Router from './router.ts';
import Toolkit from './toolkit.ts';

export interface Route {
    method: string,
    path: string,
    handler: RouteHandler
}

export type RequestParams = { [param: string]: string };

export type RouteOptions = Partial<Route>;

export interface NormalizedRoute extends Route {
    segments: Array<string>
}

export interface RouteWithParams extends NormalizedRoute {
    params: RequestParams
}

export interface ServerOptions {
    hostname?: string,
    port: number
}

type JSONStringifyable = boolean | null | number | object | string;
export type ResponseBody = Deno.Reader | Uint8Array | JSONStringifyable;
export type RouteHandlerResult = Response | ResponseBody | Error | Promise<RouteHandlerResult>;
export type RouteHandler = (request: Request, h: Toolkit) => RouteHandlerResult;
export type RoutesList = RouteOptions | Router | string | Iterable<RoutesList>;
