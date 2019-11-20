import { http } from '../dependencies.js';
import * as bang from './bang.js';
import respond from './respond.js';
import Request from './request.js';
import Toolkit from './toolkit.js';
import Router from './router.js';

const getPathname = (path) => {
    return new URL(path, 'http://localhost').pathname;
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
        const route = this.router.route(rawRequest.method, getPathname(rawRequest.url));

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
        const host = this._config.hostname + ':' + this._config.port;
        const server = http.serve(host);
        for await (const request of server) {
            this.respond(request);
        }
    }
}
