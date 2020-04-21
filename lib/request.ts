import { cookie, http } from '../dependencies.ts';
import Response from './response.ts';
import Server from './server.ts';
import { RequestParams, MatchedRoute } from './types.ts';

interface RequestOptions {
    raw: http.ServerRequest,
    route: MatchedRoute,
    server: Server
}

export default class Request {
    raw: http.ServerRequest;
    route: MatchedRoute;
    method: string;
    headers: Headers;
    params: RequestParams
    referrer: string;
    response: Response;
    server: Server;
    state: cookie.Cookies;
    url: URL;
    constructor(options: RequestOptions) {
        this.raw = options.raw;
        this.route = options.route;
        this.method = this.raw.method;
        this.headers = this.raw.headers || new Headers({ host : 'localhost' });
        this.params = this.route.params;
        this.referrer = this.headers.get('referer') || '';
        this.response = new Response();
        this.server = options.server;
        this.state = cookie.getCookies(this as any);
        this.url = new URL(this.raw.url, 'http://' + this.headers.get('host'));
    }
    get body() {
        return this.raw.body;
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
    get origin() {
        return this.url.origin;
    }
    get path() {
        return this.url.pathname;
    }
    get search() {
        return this.url.search;
    }
    get searchParams() {
        return this.url.searchParams;
    }
}
