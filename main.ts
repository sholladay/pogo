import Router, { RoutesList } from './lib/router.ts';
import Server from './lib/server.ts';
import {
    DirectoryHandlerOptions,
    FileHandlerOptions,
    RouteHandler,
    RouteOptions,
    ServerOptions
} from './lib/types.ts';

export * as types from './lib/types.ts';

export { default as Router } from './lib/router.ts';
export { default as Server } from './lib/server.ts';

export const directory = (path: string, options?: DirectoryHandlerOptions): RouteHandler => {
    return (request, h) => {
        return h.directory(path, options);
    };
}

export const file = (path: string, options?: FileHandlerOptions): RouteHandler => {
    return (request, h) => {
        return h.file(path, options);
    };
};

export const server = (options: ServerOptions): Server => {
    return new Server(options);
};

export const router = (route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): Router => {
    return new Router(route, options, handler);
};

export default { directory, file, server, router };
