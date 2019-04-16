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
    route(option) {
        for (const config of [].concat(option)) {
            if (typeof config.handler !== 'function') {
                throw new TypeError('route.handler must be a function');
            }

            this.router[config.method] = this.router[config.method] || {};
            this.router[config.method][config.path] = config;
        }
    }
    async _handleRequest(request) {
        console.log(`Request: ${new Date().toISOString()} ${request.method} ${request.url}`);

        const methodRouter = this.router[request.method];
        const route = methodRouter && methodRouter[request.url];
        if (!route) {
            await respond.notFound(request);
            return;
        }

        let result;
        try {
            result = await route.handler(request, new Toolkit());
        }
        catch (error) {
            await respond.badImplementation(request);
            return;
        }

        if (result instanceof Toolkit) {
            await respond(request, result._response);
        }
        else if (result) {
            await respond(request, { body : result });
        }
        else {
            await respond.badImplementation(request);
        }
    }
    async start() {
        const host = this._config.hostname + ':' + this._config.port;
        const server = http.serve(host);
        for await (const request of server) {
            await this._handleRequest(request);
        }
    }
}

export default {
    server(...args) {
        return new Pogo(...args);
    }
};
