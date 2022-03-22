import { http } from '../dependencies.ts';
import * as bang from './bang.ts';
import serialize from './serialize.ts';
import ServerRequest from './request.ts';
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
import { RouteHandler, RouteOptions } from './types.ts';

export interface ServerOptions {
    catchAll?: RouteHandler,
    certFile?: string,
    hostname?: string,
    keyFile?: string,
    port?: number
}

/**
 * A server represents your application and its ability to handle HTTP requests.
 * Use `pogo.server()` to create a server instance.
 */
export default class Server {
    options: ServerOptions;
    raw: http.Server;
    router: Router;
    constructor(options?: ServerOptions) {
        this.options = {
            hostname : 'localhost',
            port     : options?.certFile ? 443 : 80,
            ...options
        };
        this.raw = new http.Server({
            handler  : this.inject,
            hostname : this.options.hostname,
            port     : this.options.port
        });
        this.router = new Router();
        const { catchAll } = this.options;
        if (typeof catchAll === 'function') {
            this.router.all('/{catchAll*}', catchAll);
        }
    }
    async inject(request: Request | string | URL): Promise<Response> {
        const baseUrl = (this.options.certFile ? 'https://' : 'http://') + this.options.hostname + ':' + this.options.port;
        const rawRequest = request instanceof Request ? request : new Request(new URL(request, baseUrl).toString());
        const url = new URL(rawRequest.url);
        const route = this.router.lookup(rawRequest.method, url.pathname, url.hostname);
        if (!route) {
            return serialize(bang.notFound());
        }

        const serverRequest = new ServerRequest({
            raw    : rawRequest,
            route,
            server : this
        });

        try {
            return serialize(await route.handler(serverRequest, new Toolkit(serverRequest)));
        }
        catch (error) {
            return serialize(bang.Bang.wrap(error));
        }
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
        const { certFile, keyFile } = this.options;
        if (certFile && keyFile) {
            this.raw.listenAndServeTls(certFile, keyFile);
        }
        else {
            this.raw.listenAndServe();
        }
    }
    async stop() {
        this.raw.close();
    }
}
