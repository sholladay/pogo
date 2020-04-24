import {
    NormalizedRoute,
    RequestParams,
    Route,
    RouteHandler,
    RouteOptions,
    MatchedRoute
} from './types.ts';

export type RouteOptionsHasHandler = RouteOptions & Pick<Route, 'handler'>;
export type RouteOptionsHasMethod = RouteOptions & Pick<Route, 'method'>;
export type RouteOptionsHasPath = RouteOptions & Pick<Route, 'path'>;
export type RouteOptionsHasHandlerAndMethod = RouteOptions & Pick<Route, 'handler' | 'method'>;
export type RouteOptionsHasHandlerAndPath = RouteOptions & Pick<Route, 'handler' | 'path'>;
export type RouteOptionsHasMethodAndPath = RouteOptions & Pick<Route, 'method' | 'path'>;

export type RouteOptionsList = RouteOptions | Router | Iterable<RouteOptionsList>;
export type RoutesList = Route | Router | Iterable<RoutesList>;
export type RoutesListHasHandler = RouteOptionsHasHandler | Router | Iterable<RoutesListHasHandler>;
export type RoutesListHasMethod = RouteOptionsHasMethod | Router | Iterable<RoutesListHasMethod>;
export type RoutesListHasPath = RouteOptionsHasPath | Router | string | Iterable<RoutesListHasPath>;
export type RoutesListHasHandlerAndMethod = RouteOptionsHasHandlerAndMethod | Router | Iterable<RoutesListHasHandlerAndMethod>;
export type RoutesListHasHandlerAndPath = RouteOptionsHasHandlerAndPath | Router | Iterable<RoutesListHasHandlerAndPath>;
export type RoutesListHasMethodAndPath = RouteOptionsHasMethodAndPath | Router | Iterable<RoutesListHasMethodAndPath>;

const isDynamicSegment = (segment: string): boolean => {
    return segment.startsWith('{') && segment.endsWith('}');
};

const getParamName = (segment: string): string => {
    return segment.slice(1, -1);
};

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
    [method: string]: {
        static: Map<string, NormalizedRoute>,
        dynamic: Array<NormalizedRoute>
    }
}

class Router {
    routes: RoutingTable;
    constructor(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler) {
        this.routes = {};
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
            for (const table of Object.values(route.routes)) {
                this.add(table.dynamic);
                this.add(table.static.values());
            }
            return this;
        }

        const normalizedRoute = {
            ...(typeof route === 'string' ? { path : route } : route),
            ...(typeof options === 'function' ? { handler : options} : options),
            ...(handler ? { handler } : undefined)
        } as NormalizedRoute;

        if (typeof normalizedRoute.method === 'object' && Symbol.iterator in normalizedRoute.method) {
            for (const method of normalizedRoute.method as Iterable<string>) {
                this.add({
                    ...normalizedRoute,
                    method
                });
            }
            return this;
        }

        const method = normalizedRoute.method.toLowerCase();
        this.routes[method] = this.routes[method] ?? {
            static  : new Map(),
            dynamic : []
        };
        const table = this.routes[method];
        const segments = normalizedRoute.path.split('/').filter(Boolean);
        const isDynamic = segments.some(isDynamicSegment);
        const record = {
            ...normalizedRoute,
            segments
        };
        if (isDynamic) {
            table.dynamic.push(record);
            table.dynamic.sort(sortRoutes);
        }
        else {
            table.static.set(record.path, record);
            table.static = new Map([...table.static.entries()].sort((left, right) => {
                return sortRoutes(left[1], right[1]);
            }));
        }
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
    lookup(method: string, path: string): MatchedRoute | void {
        const methodTable = this.routes[method.toLowerCase()];
        const wildTable = this.routes['*'];
        if (!methodTable && !wildTable) {
            return;
        }
        if (methodTable?.static.has(path)) {
            return {
                ...methodTable.static.get(path),
                params : {}
            } as MatchedRoute;
        }
        if (wildTable?.static.has(path)) {
            return {
                ...wildTable.static.get(path),
                params : {}
            } as MatchedRoute;
        }
        const segments = path.split('/').filter(Boolean);
        const methodDynamic = methodTable?.dynamic ?? [];
        const wildDynamic = wildTable?.dynamic ?? [];
        const dynamicRoutes = [...methodDynamic, ...wildDynamic].sort(sortRoutes);
        const route = dynamicRoutes.find((route: NormalizedRoute) => {
            const matchesRequest = (routeSegment: string, index: number): boolean => {
                return routeSegment === segments[index] || isDynamicSegment(routeSegment);
            };
            return segments.length === route.segments.length && route.segments.every(matchesRequest);
        });

        return route && {
            ...route,
            params : route.segments.reduce((params: RequestParams, routeSegment: string, index: number) => {
                if (isDynamicSegment(routeSegment)) {
                    const name = getParamName(routeSegment);
                    params[name] = segments[index];
                }
                return params;
            }, {})
        } as MatchedRoute;
    }
}

export default Router;
