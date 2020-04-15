import {
    NormalizedRoute,
    RequestParams,
    RouteHandler,
    RouteOptions,
    RoutesList
} from './types.ts';

const isDynamicSegment = (segment: string): boolean => {
    return segment.startsWith('{') && segment.endsWith('}');
};

const getParamName = (segment: string): string => {
    return segment.slice(1, -1);
};

const sortRoutes = (left: NormalizedRoute, right: NormalizedRoute): number => {
    const leftFirst = -1;
    const rightFirst = 1;
    const keepAsIs = 0;

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

    return keepAsIs;
};

interface RoutingTable {
    [method: string]: { static: Map<string, NormalizedRoute>, dynamic: Array<NormalizedRoute> }
}

class Router {
    routes: RoutingTable;
    constructor(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler) {
        this.routes = {};
        if (route || options) {
            this.add(route, options, handler);
        }
    }
    add(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler) {
        if (typeof handler !== 'function') {
            handler = typeof options === 'function' ? options : (options && options.handler);
        }
        if (route && typeof route[Symbol.iterator] === 'function' && typeof route !== 'string') {
            for (const settings of route) {
                this.add(settings, options, handler);
            }
            return;
        }
        if (route instanceof Router) {
            for (const table of Object.values(route.routes)) {
                this.add(table.dynamic);
                this.add(table.static.values());
            }
            return;
        }

        const normalizedRoute = {
            ...(typeof route === 'string' ? { path : route } : route),
            ...options,
            ...(handler ? { handler } : undefined)
        };

        if (normalizedRoute.method[Symbol.iterator] && typeof normalizedRoute.method !== 'string') {
            for (const method of normalizedRoute.method) {
                this.add({
                    ...normalizedRoute,
                    method
                });
            }
            return;
        }

        const method = normalizedRoute.method.toLowerCase();
        this.routes[method] = this.routes[method] || {
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
    }
    all(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : '*'
        };
        this.add(route, config, handler);
        return this;
    }
    delete(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'DELETE'
        };
        this.add(route, config, handler);
        return this;
    }
    get(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'GET'
        };
        this.add(route, config, handler);
        return this;
    }
    patch(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'PATCH'
        };
        this.add(route, config, handler);
        return this;
    }
    post(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'POST'
        };
        this.add(route, config, handler);
        return this;
    }
    put(route?: RoutesList, options?: RouteOptions | RouteHandler, handler?: RouteHandler): this {
        const config = {
            ...(typeof options === 'function' ? { handler : options } : options),
            method : 'PUT'
        };
        this.add(route, config, handler);
        return this;
    }
    lookup(method: string, path: string) {
        const methodTable = this.routes[method.toLowerCase()];
        const wildTable = this.routes['*'];
        if (methodTable && methodTable.static.has(path)) {
            return {
                ...methodTable.static.get(path),
                params : {}
            };
        }
        if (wildTable && wildTable.static.has(path)) {
            return {
                ...wildTable.static.get(path),
                params : {}
            };
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
        };
    }
}

export default Router;
