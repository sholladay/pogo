const isDynamicSegment = (segment) => {
    return segment.startsWith('{') && segment.endsWith('}');
};

const getParamName = (segment) => {
    return segment.slice(1, -1);
};

const sortRoutes = (a, b) => {
    const aFirst = -1;
    const bFirst = 1;

    if (a.segments.filter(isDynamicSegment).length <
        b.segments.filter(isDynamicSegment).length) {
        return aFirst;
    }
    if (a.segments.filter(isDynamicSegment).length >
        b.segments.filter(isDynamicSegment).length) {
        return bFirst;
    }

    if (a.segments.length < b.segments.length) {
        return aFirst;
    }
    if (a.segments.length > b.segments.length) {
        return bFirst;
    }

    if (a.path.length < b.path.length) {
        return aFirst;
    }
    if (a.path.length > b.path.length) {
        return bFirst;
    }
}

class Router {
    constructor() {
        this.routes = {};
    }
    add(option, data) {
        const method = option.method.toLowerCase();
        this.routes[method] = this.routes[method] || { static : new Map(), dynamic : [] };
        const table = this.routes[method];
        const segments = option.path.split('/').filter(Boolean);
        const isDynamic = segments.some(isDynamicSegment);
        const record = {
            data,
            path : option.path,
            segments
        };
        if (isDynamic) {
            table.dynamic.push(record);
            table.dynamic.sort(sortRoutes);
        }
        else {
            table.static.set(option.path, record);
        }
    }
    route(method, path) {
        const methodTable = this.routes[method.toLowerCase()];
        const wildTable = this.routes['*'];
        if (methodTable && methodTable.static.has(path)) {
            return {
                data   : methodTable.static.get(path).data,
                params : {}
            }
        }
        if (wildTable && wildTable.static.has(path)) {
            return {
                data   : wildTable.static.get(path).data,
                params : {}
            }
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
            data   : route.data,
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
