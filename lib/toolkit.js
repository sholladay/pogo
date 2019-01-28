import { status } from '../dependencies.js';

export default class Toolkit {
    constructor() {
        this._response = {
            headers : new Headers(),
            status  : status.OK
        };
    }
    body(body) {
        this._response.body = body;
        return this;
    }
    code(statusCode) {
        this._response.status = statusCode;
        return this;
    }
    created(url) {
        this.code(status.Created);
        this.location(url);
        return this;
    }
    header(name, value) {
        this._response.headers.set(name, value);
        return this;
    }
    location(url) {
        this.header('Location', url);
        return this;
    }
    redirect(url) {
        const _isRewritable = () => {
            return [status.MovedPermanently, status.Found].includes(this._response.status);
        };
        const _isTemporary = () => {
            return [status.TemporaryRedirect, status.Found].includes(this._response.status);
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
    type(mimeType) {
        return this.header('Content-Type', mimeType);
    }
}
