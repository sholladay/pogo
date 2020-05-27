import { http } from '../dependencies.ts';
import * as bang from './bang.ts';
import serialize from './serialize.ts';
import Request from './request.ts';
import Response from './response.ts';
import Toolkit from './toolkit.ts';
import Router, {
    RoutesList,
    RoutesListHasHandler,
    RoutesListHasHandlerAndMethod,
    RoutesListHasHandlerAndPath,
    RoutesListHasMethod,
    RoutesListHasMethodAndPath,
    RoutesListHasPath,
    RouteOptionsHasHandler,
    RouteOptionsHasHandlerAndMethod,
    RouteOptionsHasHandlerAndPath,
    RouteOptionsHasMethod,
    RouteOptionsHasMethodAndPath,
    RouteOptionsHasPath
} from './router.ts';
import { RouteHandler, RouteOptions, ServerOptions } from './types.ts';

const getPathname = (path: string): string => {
    return new URL(path, 'about:blank').pathname;
};

export default class Server {
    _config: { [option: string]: any, catchAll?: RouteHandler };
    raw?: http.Server;
    router: Router;
    constructor(options: ServerOptions) {
        this._config = {
            hostname : 'localhost',
            ...options
        };
        this.router = new Router();
        if (options && options.catchAll) {
            this.router.all("/{___catchAll*}", options.catchAll);
        }
    }
    async inject(rawRequest: http.ServerRequest): Promise<Response> {
        const route = this.router.lookup(rawRequest.method, getPathname(rawRequest.url));

        const customCatchAll = this._config.catchAll;
        if (!route && !customCatchAll) {
            return serialize(bang.notFound());
        }

        // At least one of foundRoute and catchAll is obtained
        const handler = (route ? route.handler : customCatchAll) as RouteHandler;

        const request = new Request({
            raw    : rawRequest,
            route,
            server : this
        });

        try {
            return serialize(await handler(request, new Toolkit()));
        }
        catch (error) {
            return serialize(bang.Bang.wrap(error));
        }
    }
    async respond(request: http.ServerRequest) {
        const response = await this.inject(request);
        request.respond({
            body    : response.body ?? undefined,
            headers : response.headers,
            status  : response.status
        } as http.Response);
    }
    route(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    route(route: RoutesListHasMethodAndPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    route(route: RoutesListHasHandlerAndMethod, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    route(route: RoutesListHasHandlerAndPath, options: RouteOptionsHasMethod, handler?: RouteHandler): this;
    route(route: RoutesListHasHandler, options: RouteOptionsHasMethodAndPath, handler?: RouteHandler): this;
    route(route: RoutesListHasPath, options: RouteOptionsHasHandlerAndMethod, handler?: RouteHandler): this;
    route(route: RoutesListHasPath, options: RouteOptionsHasMethod, handler: RouteHandler): this;
    route(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    route(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    route(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        this.router.add(route, options, handler);
        return this;
    }
    async start() {
        const server = http.serve({
            hostname : this._config.hostname,
            port     : this._config.port
        });
        this.raw = server;
        for await (const request of server) {
            this.respond(request);
        }
    }
    async stop() {
        this.raw?.close();
    }
}
