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
export { default as Toolkit } from './lib/toolkit.ts';
export { default as Request } from './lib/request.ts';
export { default as Response } from './lib/response.ts';

/**
 * Returns a route handler function that serves the specified directory using `h.directory()`
 */
export const directory = (path: string, options?: DirectoryHandlerOptions): RouteHandler => {
    return (request, h) => {
        return h.directory(path, options);
    };
}

/**
 * Returns a route handler function that serves the specified file using `h.file()`
 */
export const file = (path: string, options?: FileHandlerOptions): RouteHandler => {
    return (request, h) => {
        return h.file(path, options);
    };
};

/**
 * Returns a new instance of the Server class
 */
export const server = (options?: ServerOptions): Server => {
    return new Server(options);
};

/**
 * Returns a new instance of the Router class
 */
export const router = (route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): Router => {
    return new Router(route, options, handler);
};

export default { directory, file, server, router };
