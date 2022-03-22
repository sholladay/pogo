import { cookie } from '../dependencies.ts';
import ServerResponse from './response.ts';
import Server from './server.ts';
import { RequestParams, MatchedRoute } from './types.ts';

interface RequestOptions {
    raw: Request,
    route: MatchedRoute,
    server: Server
}

/**
 * A request represents an incoming message that your server should respond to.
 * Pogo passes a request instance as the first argument to route handlers.
 */
export default class ServerRequest {
    raw: Request;
    route: MatchedRoute;
    response: Response;
    server: Server;
    state: Record<string, string>;
    url: URL;
    constructor(options: RequestOptions) {
        this.raw = options.raw;
        this.route = options.route;
        this.server = options.server;
        this.response = new ServerResponse();
        this.state = cookie.getCookies(this.headers);
        this.url = new URL(this.raw.url);
    }
    get body() {
        return this.raw.body;
    }
    get headers() {
        return this.raw.headers;
    }
    get host() {
        return this.url.host;
    }
    get hostname() {
        return this.url.hostname;
    }
    get href() {
        return this.url.href;
    }
    get method() {
        return this.raw.method;
    }
    get origin() {
        return this.url.origin;
    }
    get params() {
        return this.route.params;
    }
    get path() {
        return this.url.pathname;
    }
    get referrer() {
        return this.headers.get('referer') || '';
    }
    get search() {
        return this.url.search;
    }
    get searchParams() {
        return this.url.searchParams;
    }
    toString() {
        return this.method + ' ' + this.url.href;
    }
}
