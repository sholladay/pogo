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

/**
 * A server represents your application and its ability to handle HTTP requests.
 * Use `pogo.server()` to create a server instance.
 */
export default class Server {
    options: ServerOptions;
    raw?: http.Server;
    router: Router;
    constructor(options: ServerOptions) {
        this.options = {
            hostname : 'localhost',
            ...options
        };
        this.router = new Router();
        const { catchAll } = this.options;
        if (typeof catchAll === 'function') {
            this.router.all('/{catchAll*}', catchAll);
        }
    }
    async inject(rawRequest: http.ServerRequest): Promise<Response> {
        const route = this.router.lookup(rawRequest.method, getPathname(rawRequest.url));

        if (!route) {
            return serialize(bang.notFound());
        }

        const request = new Request({
            raw    : rawRequest,
            route,
            server : this
        });

        try {
            return serialize(await route.handler(request, new Toolkit(request)));
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
        const { certFile, keyFile, ...options } = this.options;
        const server = (typeof certFile === 'string' && typeof keyFile === 'string') ?
            http.serveTLS({
                ...options,
                certFile,
                keyFile
            }) :
            http.serve(options);
        this.raw = server;
        for await (const request of server) {
            // NOTE: Do not `await` here (handle requests concurrently for performance)
            this.respond(request);
        }
    }
    async stop() {
        this.raw?.close();
    }
}
