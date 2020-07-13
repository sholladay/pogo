import Router, { RoutesList } from './lib/router.ts';
import Server from './lib/server.ts';
import { RouteOptions, RouteHandler, ServerOptions } from './lib/types.ts';

export * as types from './lib/types.ts'

export { default as Router } from './lib/router.ts';
export { default as Server } from './lib/server.ts';

export const Main = {
    server(options: ServerOptions): Server {
        return new Server(options);
    },
    router(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): Router {
        return new Router(route, options, handler);
    }
};

export default Main;
