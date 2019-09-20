import { http } from './dependencies.js';
import respond from './lib/respond.js';
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
    route(routes) {
        for (const route of [].concat(routes)) {
            if (typeof route.handler !== 'function') {
                throw new TypeError('route.handler must be a function');
            }
            this.router.add(route, route.handler);
        }
    }
    async inject(request) {
        console.log(`Request: ${new Date().toISOString()} ${request.method} ${request.url}`);

        const route = this.router.route(request.method, request.url);
        const handler = route && route.data;

        if (!handler) {
            return respond.notFound(request);
        }

        const requestWithParams = { ...request, params : route.params };
        let result;
        try {
            result = await handler(requestWithParams, new Toolkit());
        }
        catch (error) {
            return respond.badImplementation(request);
        }

        if (result instanceof Toolkit) {
            return respond(request, result._response);
        }
        else if (result) {
            return respond(request, { body : result });
        }
        else {
            return respond.badImplementation(request);
        }
    }
    async respond(request) {
        const response = await this.inject(request);
        request.respond(response);
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
