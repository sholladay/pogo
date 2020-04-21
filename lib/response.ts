import { cookie, status } from '../dependencies.ts';
import { Bang } from './bang.ts';
import { ResponseBody } from './types.ts';

interface ResponseOptions {
    body?: ResponseBody,
    headers?: HeadersInit,
    status?: number
};

interface CookieOptions extends Omit<cookie.Cookie, 'name'> {
    name?: cookie.Cookie['name']
}

export default class Response {
    body: ResponseBody;
    headers: Headers;
    status: number;
    permanent?: () => this;
    temporary?: () => this;
    rewritable?: (isRewritable: boolean) => this;
    constructor(options?: ResponseOptions) {
        this.body = options?.body ?? null;
        this.headers = new Headers(options?.headers);
        this.status = options?.status ?? status.OK;
    }
    static wrap(input: Response | ResponseBody | Error) {
        if (input instanceof Response) {
            return input;
        }
        if (input instanceof Error) {
            return Bang.wrap(input).response;
        }
        return new Response({ body : input });
    }
    code(statusCode: number) {
        this.status = statusCode;
        return this;
    }
    created(url?: string) {
        this.code(status.Created);
        if (url) {
            this.location(url);
        }
        return this;
    }
    header(name: string, value: string) {
        this.headers.set(name, value);
        return this;
    }
    location(url: string) {
        return this.header('Location', url);
    }
    redirect(url: string) {
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
        this.rewritable = (isRewritable: boolean) => {
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
    state(name: cookie.Cookie): this;
    state(name: string, value: string | CookieOptions): this;
    state(name: string | cookie.Cookie, value?: string | CookieOptions) {
        cookie.setCookie(this as object, {
            httpOnly : true,
            sameSite : 'Strict',
            secure   : true,
            ...(typeof name === 'object' ? name : { name }),
            ...(typeof value === 'object' ? value : { value: value ?? '' })
        });
        return this;
    }
    type(mediaType: string) {
        return this.header('Content-Type', mediaType);
    }
    unstate(name: string) {
        cookie.delCookie(this as object, name);
        return this;
    }
}
