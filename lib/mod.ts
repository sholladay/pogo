import Router, { RoutesList } from './router.ts';
import Server from './server.ts';
import { RouteOptions, RouteHandler, ServerOptions } from './types.ts';

export class Main {
    static server(options: ServerOptions) : Server {
        return new Server(options);
    }

    static router(route? : RoutesList, options? : RouteOptions | RouteHandler, handler? : RouteHandler) : Router {
        return new Router(route, options, handler);
    }
}

export default Main;
