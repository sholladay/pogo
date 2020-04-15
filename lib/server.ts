import { http } from '../dependencies.ts';
import * as bang from './bang.ts';
import respond from './respond.ts';
import Request from './request.ts';
import Toolkit from './toolkit.ts';
import Router from './router.ts';
import { RouteHandler, RouteOptions, RoutesList, ServerOptions } from './types.ts';

const getPathname = (path: string): string => {
    return new URL(path, 'about:blank').pathname;
};

export default class Server {
    _config: { [option: string]: any };
    raw?: http.Server;
    router: Router;
    constructor(options: ServerOptions) {
        this._config = {
            hostname : 'localhost',
            ...options
        };
        this.router = new Router();
    }
    async inject(rawRequest: http.ServerRequest) {
        const route = this.router.lookup(rawRequest.method, getPathname(rawRequest.url));

        if (!route) {
            return respond(bang.notFound());
        }

        const request = new Request({
            raw    : rawRequest,
            route,
            server : this
        });

        try {
            return respond(await route.handler(request, new Toolkit()));
        }
        catch (error) {
            return respond(bang.Bang.wrap(error));
        }
    }
    async respond(request: http.ServerRequest) {
        const response = await this.inject(request);
        request.respond(response);
    }
    route(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler) {
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
