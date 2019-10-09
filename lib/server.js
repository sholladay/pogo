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
    route(routes) {
        for (const route of [].concat(routes)) {
            if (typeof route.handler !== 'function') {
                throw new TypeError('route.handler must be a function');
            }
            for (const method of [].concat(route.method)) {
                this.router.add({
                    ...route,
                    method
                });
            }
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
