import { http } from '../dependencies.ts';
import * as bang from './bang.ts';
import ServerRequest from './request.ts';
import ServerResponse from './response.ts';
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
    RouteOptionsHasPath,
    toSignature
} from './router.ts';
import { ResponseBody, RouteHandler, RouteOptions } from './types.ts';

export interface ServerOptions {
    catchAll?: RouteHandler,
    certFile?: string,
    hostname?: string,
    keyFile?: string,
    port?: number
}

const serialize = (input: ServerResponse | ResponseBody | Error): Response => {
    return ServerResponse.wrap(input).toWeb();
};

/**
 * A server represents your application and its ability to handle HTTP requests.
 * Use `pogo.server()` to create a server instance.
 */
export default class Server {
    options: ServerOptions;
    raw: http.Server;
    router: Router;
    url: URL;
    constructor(options?: ServerOptions) {
        this.options = {
            hostname : 'localhost',
            port     : options?.certFile ? 443 : 80,
            ...options
        };
        this.raw = new http.Server({
            handler : (request) => {
                return this.inject(request);
            },
            hostname : this.options.hostname,
            port     : this.options.port
        });
        this.url = new URL((this.options.certFile ? 'https://' : 'http://') + this.options.hostname + ':' + this.options.port);
        this.router = new Router();
        const { catchAll } = this.options;
        if (typeof catchAll === 'function') {
            this.router.all('/{catchAll*}', catchAll);
        }
    }
    async inject(request: Request | string | URL): Promise<Response> {
        const rawRequest = request instanceof Request ? request : new Request(new URL(request.toString(), this.url).toString());
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
            const result = await route.handler(serverRequest, new Toolkit(serverRequest));
            if (typeof result === 'undefined') {
                throw bang.badImplementation(`Handler for ${toSignature(route)} returned undefined which is not allowed, return null or h.response() instead to explicitly send an empty response`);
            }
            return serialize(result);
        }
        catch (error) {
            console.error(error);
            return serialize(error);
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
            await this.raw.listenAndServeTls(certFile, keyFile);
        }
        else {
            await this.raw.listenAndServe();
        }
    }
    async stop() {
        this.raw.close();
    }
}
