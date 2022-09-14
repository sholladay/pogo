import {
    NormalizedRoute,
    RequestParams,
    Route,
    RouteHandler,
    RouteOptions,
    MatchedRoute
} from './types.ts';

export type RouteOptionsHasHandler = RouteOptions & Required<Pick<RouteOptions, 'handler'>>;
export type RouteOptionsHasMethod = RouteOptions & Required<Pick<RouteOptions, 'method'>>;
export type RouteOptionsHasPath = RouteOptions & Required<Pick<RouteOptions, 'path'>>;
export type RouteOptionsHasHandlerAndMethod = RouteOptions & Required<Pick<RouteOptions, 'handler' | 'method'>>;
export type RouteOptionsHasHandlerAndPath = RouteOptions & Required<Pick<RouteOptions, 'handler' | 'path'>>;
export type RouteOptionsHasMethodAndPath = RouteOptions & Required<Pick<RouteOptions, 'method' | 'path'>>;
export type RequiredRouteOptions = RouteOptions & Required<Pick<RouteOptions, 'method' | 'path' | 'handler'>>;

export type RoutesList = RequiredRouteOptions | Router | Iterable<RoutesList>;
export type RoutesListHasHandler = RouteOptionsHasHandler | Router | Iterable<RoutesListHasHandler>;
export type RoutesListHasMethod = RouteOptionsHasMethod | Router | Iterable<RoutesListHasMethod>;
export type RoutesListHasPath = RouteOptionsHasPath | Router | string | Iterable<RoutesListHasPath>;
export type RoutesListHasHandlerAndMethod = RouteOptionsHasHandlerAndMethod | Router | Iterable<RoutesListHasHandlerAndMethod>;
export type RoutesListHasHandlerAndPath = RouteOptionsHasHandlerAndPath | Router | Iterable<RoutesListHasHandlerAndPath>;
export type RoutesListHasMethodAndPath = RouteOptionsHasMethodAndPath | Router | Iterable<RoutesListHasMethodAndPath>;

const paramPattern = /\{(\w+)(?:\?|\*(?:[1-9]\d*)?)?\}/u;
const paramsPattern = new RegExp(paramPattern, paramPattern.flags + 'g');

const expandPath = (path: string): Array<string> => {
    return Array.from(path.matchAll(paramsPattern) as Iterable<RegExpExecArray>).flatMap((match) => {
        const [param, name] = match;
        const before = match.input.slice(0, match.index);
        const after = match.input.slice(match.index + param.length);

        // Optional param, expand to paths WITH and WITHOUT the param
        if (param.endsWith('?}')) {
            const isWholeSegment = before.endsWith('/') && after.startsWith('/');
            const withParam = before + `{${name}}` + after;
            const withoutParam = before + (isWholeSegment ? after.slice(1) : after)
            return [withParam, withoutParam];
        }

        return [];
    });
};

const isDynamicSegment = (segment: string): boolean => {
    return segment.startsWith('{') && segment.endsWith('}') && paramPattern.test(segment);
};

const getParamName = (segment: string): string => {
    const param = segment.match(paramPattern);
    return param ? param[1] : '';
};

const toPathfinder = (segments: Array<string>): string => {
    const replacePart = (str: string) => {
        return str && '.';
    };
    return segments.map(replacePart).join('/');
};

/**
 * Returns a human friendly text representation of the given route, such as GET /foo
 */
const toSignature = (route: NormalizedRoute): string => {
    return route.method + ' ' + (route.vhost || '') + route.path;
};

const fingerprintPath = (path: string): string => {
    return path.replace(paramsPattern, (param) => {
        return param.endsWith('*}') ? '#' : '?';
    });
};

const toConflictId = (route: NormalizedRoute): string => {
    return toSignature({
        ...route,
        path : fingerprintPath(route.path)
    });
}

const sortRoutes = (left: NormalizedRoute, right: NormalizedRoute): number => {
    const leftFirst = -1;
    const rightFirst = 1;
    const unchanged = 0;

    if (left.segments.filter(isDynamicSegment).length <
        right.segments.filter(isDynamicSegment).length) {
        return leftFirst;
    }
    if (left.segments.filter(isDynamicSegment).length >
        right.segments.filter(isDynamicSegment).length) {
        return rightFirst;
    }

    if (left.segments.length < right.segments.length) {
        return leftFirst;
    }
    if (left.segments.length > right.segments.length) {
        return rightFirst;
    }

    if (left.path < right.path) {
        return leftFirst;
    }
    if (left.path > right.path) {
        return rightFirst;
    }

    return unchanged;
};

interface RoutingTable {
    conflictIds: Map<string, NormalizedRoute>,
    list: Array<NormalizedRoute>,
    pathfinders: Map<string, Array<NormalizedRoute>>,
    wildcards: Array<NormalizedRoute>
}

/**
 * A router represents a collection of routes and determines which route will handle a given HTTP request.
 * Use `pogo.router()` to create a router instance.
 */
export default class Router {
    routes: RoutingTable;
    constructor(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler) {
        this.routes = {
            conflictIds : new Map(),
            list        : [],
            pathfinders : new Map(),
            wildcards   : []
        };
        if (route) {
            this.add(route, options, handler);
        }
    }
    add(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    add(route: RoutesListHasMethodAndPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    add(route: RoutesListHasHandlerAndMethod, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    add(route: RoutesListHasHandlerAndPath, options: RouteOptionsHasMethod, handler?: RouteHandler): this;
    add(route: RoutesListHasHandler, options: RouteOptionsHasMethodAndPath, handler?: RouteHandler): this;
    add(route: RoutesListHasPath, options: RouteOptionsHasHandlerAndMethod, handler?: RouteHandler): this;
    add(route: RoutesListHasPath, options: RouteOptionsHasMethod, handler: RouteHandler): this;
    add(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    add(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    add(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        if (route && typeof route === 'object' && Symbol.iterator in route) {
            for (const settings of route as Iterable<RoutesList>) {
                this.add(settings, options, handler);
            }
            return this;
        }
        if (route instanceof Router) {
            this.add(route.routes.list);
            return this;
        }

        const normalizedRoute = {
            ...(typeof route === 'string' ? { path : route } : route),
            ...(typeof options === 'function' ? { handler : options } : options),
            ...(handler ? { handler } : null)
        } as Route;

        if (typeof normalizedRoute.method === 'object' && Symbol.iterator in normalizedRoute.method) {
            for (const method of normalizedRoute.method as Iterable<string>) {
                this.add({
                    ...normalizedRoute,
                    method
                });
            }
            return this;
        }

        if (typeof normalizedRoute.path === 'object' && Symbol.iterator in normalizedRoute.path) {
            for (const path of normalizedRoute.path as Iterable<string>) {
                this.add({
                    ...normalizedRoute,
                    path
                });
            }
            return this;
        }

        const expandedPaths = expandPath(normalizedRoute.path);
        if (expandedPaths.length > 0) {
            this.add({
                ...normalizedRoute,
                path : expandedPaths
            });
            return this;
        }

        const record: NormalizedRoute = {
            ...normalizedRoute,
            method     : normalizedRoute.method.toUpperCase(),
            paramNames : Array.from(normalizedRoute.path.matchAll(paramsPattern), (match) => {
                return match[1];
            }),
            segments   : normalizedRoute.path.split('/'),
        };

        const conflictId = toConflictId(record);
        const existingRoute = this.routes.conflictIds.get(conflictId);
        if (existingRoute) {
            const newRoute = toSignature(record);
            const oldRoute = toSignature(existingRoute);
            throw new Error(`Route conflict: new route "${newRoute}" conflicts with existing route "${oldRoute}"`);
        }

        this.routes.conflictIds.set(conflictId, record);

        const hasWildcardParam = /\{\w+\*\}/u.test(record.path);
        if (hasWildcardParam) {
            this.routes.wildcards.push(record);
            this.routes.wildcards.sort(sortRoutes);
        }
        else {
            const pathfinder = toPathfinder(record.segments);
            const pathfinderRoutes = this.routes.pathfinders.get(pathfinder) ?? [];
            pathfinderRoutes.push(record);
            pathfinderRoutes.sort(sortRoutes);
            this.routes.pathfinders.set(pathfinder, pathfinderRoutes);
        }

        this.routes.list.push(record);
        this.routes.list.sort(sortRoutes);

        return this;
    }
    all(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    all(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    all(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    all(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    all(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    all(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    all(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : '*'
        };
        this.add(route, config, handler);
        return this;
    }
    delete(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    delete(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    delete(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    delete(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    delete(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    delete(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    delete(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'DELETE'
        };
        this.add(route, config, handler);
        return this;
    }
    get(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    get(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    get(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    get(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    get(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    get(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    get(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'GET'
        };
        this.add(route, config, handler);
        return this;
    }
    patch(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    patch(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    patch(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    patch(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    patch(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    patch(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    patch(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'PATCH'
        };
        this.add(route, config, handler);
        return this;
    }
    post(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    post(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    post(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    post(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    post(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    post(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    post(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'POST'
        };
        this.add(route, config, handler);
        return this;
    }
    put(route: RoutesListHasHandlerAndPath, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this;
    put(route: RoutesListHasHandler, options: RouteOptionsHasPath, handler?: RouteHandler): this;
    put(route: RoutesListHasPath, options: RouteOptionsHasHandler | RouteHandler, handler?: RouteHandler): this;
    put(route: RoutesListHasPath, options: RouteOptions, handler: RouteHandler): this;
    put(route: RoutesListHasMethod, options: RouteOptionsHasHandlerAndPath, handler?: RouteHandler): this;
    put(route: RoutesListHasMethod, options: RouteOptionsHasPath, handler: RouteHandler): this;
    put(route: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'PUT'
        };
        this.add(route, config, handler);
        return this;
    }
    lookup(method: string, path: string, host?: string): MatchedRoute | undefined {
        const pathSegments = path.split('/');
        const pathfinder = toPathfinder(pathSegments);

        const matchRoute = (list: Array<NormalizedRoute> = []): NormalizedRoute | undefined => {
            return list.find((route: NormalizedRoute) => {
                const isMethodMatch = route.method === method || route.method === '*';
                if (!isMethodMatch) {
                    return false;
                }
                const isHostMatch = !host || !route.vhost || route.vhost === host;
                if (!isHostMatch) {
                    return false;
                }
                const isStaticPath = route.paramNames.length === 0;
                if (isStaticPath) {
                    return route.path === path;
                }

                const matchesAllSegments = route.segments.every((routeSegment: string, index: number): boolean => {
                    return isDynamicSegment(routeSegment) || (routeSegment === pathSegments[index]);
                });

                const isPathMatch = matchesAllSegments && ((route.segments.length === pathSegments.length) || route.segments[route.segments.length - 1].endsWith('*}'));

                return isPathMatch;
            });
        }

        const candidates = this.routes.pathfinders.get(pathfinder);
        const wildcardRoutes = this.routes.wildcards;
        const route = matchRoute(candidates) || matchRoute(wildcardRoutes);

        return route && {
            ...route,
            params : route.segments.reduce((params: RequestParams, routeSegment: string, index: number) => {
                if (isDynamicSegment(routeSegment)) {
                    const name = getParamName(routeSegment);
                    params[name] = routeSegment.endsWith('*}') ? pathSegments.slice(index).join('/') : pathSegments[index];
                }
                return params;
            }, {})
        };
    }
}

export {
    toSignature
};
