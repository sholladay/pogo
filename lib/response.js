import { cookie, status } from '../dependencies.js';
import { Bang } from './bang.js';

export default class Response {
    constructor(option = {}) {
        this.headers = new Headers(option.headers);
        this.status = option.status || status.OK;
        this.body = option.body;
    }
    static wrap(input) {
        if (input instanceof Response) {
            return input;
        }
        if (input instanceof Error) {
            return Bang.wrap(input).response;
        }
        return new Response({ body : input });
    }
    code(statusCode) {
        this.status = statusCode;
        return this;
    }
    created(url) {
        this.code(status.Created);
        if (url) {
            this.location(url);
        }
        return this;
    }
    header(name, value) {
        this.headers.set(name, value);
        return this;
    }
    location(url) {
        return this.header('Location', url);
    }
    redirect(url) {
        const _isRewritable = () => {
            return [status.MovedPermanently, status.Found].includes(this.status);
        };
        const _isTemporary = () => {
            return [status.TemporaryRedirect, status.Found].includes(this.status);
        };
        this.code(status.Found);
        this.location(url);
        this.permanent = () => {
            this.code(_isRewritable() ? status.MovedPermanently : status.PermanentRedirect);
            return this;
        };
        this.temporary = () => {
            this.code(_isRewritable() ? status.Found : status.TemporaryRedirect);
            return this;
        };
        this.rewritable = (isRewritable) => {
            if (isRewritable === false) {
                this.code(_isTemporary() ? status.TemporaryRedirect : status.PermanentRedirect);
            }
            else {
                this.code(_isTemporary() ? status.Found : status.MovedPermanently);
            }
            return this;
        };
        return this;
    }
    state(name, value) {
        if (typeof name === 'object') {
            value = name;
            name = value.name;
        }
        if (typeof value === 'string') {
            value = { value };
        }
        cookie.setCookie(this, {
            httpOnly : true,
            sameSite : 'Strict',
            secure   : true,
            ...value,
            name
        });
        return this;
    }
    type(mediaType) {
        return this.header('Content-Type', mediaType);
    }
    unstate(name) {
        cookie.delCookie(this, name);
        return this;
    }
}
