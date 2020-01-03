import { cookie } from '../dependencies.js';
import Response from './response.js';

export default class Request {
    constructor(option) {
        this.raw = option.raw;
        this.route = option.route;
        this.method = this.raw.method;
        this.headers = this.raw.headers || new Headers({ host : 'localhost' });
        this.params = this.route.params;
        this.referrer = this.headers.get('referer') || '';
        this.response = new Response();
        this.server = option.server;
        this.state = cookie.getCookies(this);
        this.url = new URL(this.raw.url, 'http://' + this.headers.get('host'));
    }
    body(...args) {
        return this.raw.body(...args);
    }
    bodyStream(...args) {
        return this.raw.bodyStream(...args);
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
