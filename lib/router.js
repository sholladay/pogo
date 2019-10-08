const isDynamicSegment = (segment) => {
    return segment.startsWith('{') && segment.endsWith('}');
};

const getParamName = (segment) => {
    return segment.slice(1, -1);
};

const sortRoutes = (left, right) => {
    const leftFirst = -1;
    const rightFirst = 1;

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

    if (left.path.length < right.path.length) {
        return leftFirst;
    }
    if (left.path.length > right.path.length) {
        return rightFirst;
    }
};

class Router {
    constructor() {
        this.routes = {};
    }
    add(route) {
        const method = route.method.toLowerCase();
        this.routes[method] = this.routes[method] || {
            static  : new Map(),
            dynamic : []
        };
        const table = this.routes[method];
        const segments = route.path.split('/').filter(Boolean);
        const isDynamic = segments.some(isDynamicSegment);
        const record = {
            ...route,
            segments
        };
        if (isDynamic) {
            table.dynamic.push(record);
            table.dynamic.sort(sortRoutes);
        }
        else {
            table.static.set(route.path, record);
        }
    }
    route(method, path) {
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
        const methodDynamic = (methodTable || {}).dynamic || [];
        const wildDynamic = (wildTable || {}).dynamic || [];
        const dynamicRoutes = [...methodDynamic, ...wildDynamic].sort(sortRoutes);
        const route = dynamicRoutes.find((route) => {
            const matchesRequest = (routeSegment, index) => {
                return routeSegment === segments[index] || isDynamicSegment(routeSegment);
            };
            return segments.length === route.segments.length && route.segments.every(matchesRequest);
        });
        return route && {
            ...route,
            params : route.segments.reduce((params, routeSegment, index) => {
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
