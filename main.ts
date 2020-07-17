import Router, { RoutesList } from './lib/router.ts';
import Server from './lib/server.ts';
import {
    DirectoryHandlerOptions,
    FileHandlerOptions,
    RouteHandler,
    RouteOptions,
    ServerOptions
} from './lib/types.ts';

export default {
    directory(path: string, options?: DirectoryHandlerOptions): RouteHandler {
        return (request, h) => {
            return h.directory(path, options);
        };
    },
    file(path: string, options?: FileHandlerOptions): RouteHandler {
        return (request, h) => {
            return h.file(path, options);
        };
    },
    server(options: ServerOptions): Server {
        return new Server(options);
    },
    router(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): Router {
        return new Router(route, options, handler);
    }
};
