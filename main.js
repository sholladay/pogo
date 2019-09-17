import { http } from './dependencies.js';
import respond from './lib/respond.js';
import Toolkit from './lib/toolkit.js';

class Pogo {
    constructor(option) {
        this._config = {
            hostname : 'localhost',
            ...option
        };
        this.router = {};
    }
    route(routes) {
        for (const route of [].concat(routes)) {
            if (typeof route.handler !== 'function') {
                throw new TypeError('route.handler must be a function');
            }

            this.router[route.method] = this.router[route.method] || {};
            this.router[route.method][route.path] = route;
        }
    }
    async inject(request) {
        console.log(`Request: ${new Date().toISOString()} ${request.method} ${request.url}`);

        const methodRouter = this.router[request.method];
        const route = methodRouter && methodRouter[request.url];
        if (!route) {
            return respond.notFound(request);
        }

        let result;
        try {
            result = await route.handler(request, new Toolkit());
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
