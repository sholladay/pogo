import Request from './request.ts';
import Response from './response.ts';
import Router from './router.ts';
import Toolkit from './toolkit.ts';

export interface Route {
    method?: string,
    path?: string,
    handler?: RouteHandler
};

export interface ServerOptions {
    hostname?: string,
    port: number
}

type JSONStringifyable = boolean | null | number | object | string;
export type RouteHandlerResult = Response | Deno.Reader | Uint8Array | JSONStringifyable | Error | Promise<RouteHandlerResult>;
export type RouteHandler = (request: Request, h: Toolkit) => RouteHandlerResult;
export type RoutesList = Route | Router | string | Array<RoutesList>;
