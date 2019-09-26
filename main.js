import { http } from './dependencies.js';
import respond from './lib/respond.js';
import Response from './lib/response.js';
import Toolkit from './lib/toolkit.js';
import Router from './lib/router.js';

class Pogo {
    constructor(option) {
        this._config = {
            hostname : 'localhost',
            ...option
        };
        this.router = new Router();
    }
    async inject(request) {
        console.log(`Request: ${new Date().toISOString()} ${request.method} ${request.url}`);

        const route = this.router.route(request.method, request.url);
        const handler = route && route.data;

        if (!handler) {
            return respond.notFound(request);
        }

        request.params = route.params;
        request.response = new Response();

        let result;
        try {
            result = await handler(request, new Toolkit());
        }
        catch (error) {
            return respond.badImplementation(request);
        }

        return respond(request, result);
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
                this.router.add({ ...route, method }, route.handler);
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

export default {
    server(...args) {
        return new Pogo(...args);
    }
};
