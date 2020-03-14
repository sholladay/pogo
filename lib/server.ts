import { http } from '../dependencies.ts';
import * as bang from './bang.ts';
import respond from './respond.ts';
import Request from './request.ts';
import Toolkit from './toolkit.ts';
import Router from './router.ts';

const getPathname = (path) => {
    return new URL(path, 'about:blank').pathname;
};

export default class Server {
    constructor(option) {
        this._config = {
            hostname : 'localhost',
            ...option
        };
        this.router = new Router();
    }
    async inject(rawRequest) {
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
    async respond(request) {
        const response = await this.inject(request);
        request.respond(response);
    }
    route(route, options, handler) {
        if (typeof handler !== 'function') {
            handler = typeof options === 'function' ? options : (options && options.handler);
        }
        for (const settings of [].concat(route)) {
            if (typeof handler !== 'function' && typeof settings.handler !== 'function') {
                const method = settings.method || options.method;
                const path = settings.path || options.path;
                throw new TypeError('Route is missing a handler function: ' + method + ' ' + path);
            }
            this.router.add(settings, options, handler);
        }
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
        this.raw.close();
    }
}
