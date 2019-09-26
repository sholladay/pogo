import { status } from '../dependencies.js';

export default class Response {
    constructor(body) {
        this.headers = new Headers();
        this.status = status.OK;
        this.body = body;
    }
    static wrap(result) {
        return result instanceof Response ? result : new Response(result);
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
    type(mediaType) {
        return this.header('Content-Type', mediaType);
    }
}
