import {
    React,
    ReactDOMServer,
    cookie,
    status,
    streams
 } from '../dependencies.ts';
import * as bang from './bang.ts';
import { ResponseBody } from './types.ts';

interface ResponseOptions {
    body?: ResponseBody,
    headers?: HeadersInit,
    status?: number
}

interface CookieOptions extends Omit<cookie.Cookie, 'name'> {
    name?: cookie.Cookie['name']
}

const hasReadableStream = (input: any): input is { readable: ReadableStream } => {
    return input?.readable instanceof ReadableStream;
};

const isReader = (input: any): input is Deno.Reader => {
    return typeof input?.read === 'function';
};

/**
 * A response represents an outgoing message that will be returned by your server for a corresponding request.
 * Use `h.response()` to create a response instance.
 */
export default class ServerResponse {
    body: ResponseBody;
    headers: Headers;
    status: number;
    permanent?: () => this;
    temporary?: () => this;
    rewritable?: (isRewritable?: boolean) => this;
    constructor(options?: ResponseOptions) {
        this.body = options?.body === undefined ? null : options?.body;
        this.headers = new Headers(options?.headers);
        this.status = options?.status ?? status.OK;
    }
    static wrap(input?: ServerResponse | ResponseBody | Error) {
        if (input instanceof ServerResponse) {
            return input;
        }
        if (input instanceof Error) {
            return bang.Bang.wrap(input).response;
        }
        return new ServerResponse({ body : input });
    }
    code(statusCode: number) {
        this.status = statusCode;
        return this;
    }
    created(url?: string | URL) {
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
    location(url: string | URL) {
        return this.header('Location', url.toString());
    }
    redirect(url: string | URL) {
        this.code(status.Found);
        this.location(url);
        const _isRewritable = () => {
            return [status.MovedPermanently, status.Found].includes(this.status);
        };
        const _isTemporary = () => {
            return [status.TemporaryRedirect, status.Found].includes(this.status);
        };
        this.permanent = () => {
            this.code(_isRewritable() ? status.MovedPermanently : status.PermanentRedirect);
            return this;
        };
        this.temporary = () => {
            this.code(_isRewritable() ? status.Found : status.TemporaryRedirect);
            return this;
        };
        this.rewritable = (isRewritable?: boolean) => {
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
        cookie.setCookie(this.headers, {
            httpOnly : true,
            sameSite : 'Strict',
            secure   : true,
            ...(typeof name === 'object' ? name : { name }),
            ...(typeof value === 'object' ? value : { value: value ?? '' })
        });
        return this;
    }
    toWeb(): Response {
        const defaultHeader = (name: string, value: string) => {
            if (!this.headers.has(name)) {
                this.headers.set(name, value);
            }
        };

        if (React.isValidElement(this.body)) {
            this.body = '<!DOCTYPE html>' + ReactDOMServer.renderToStaticMarkup(this.body);
        }
        /**
         * This is to support non-standard streams that, by convention, have a property
         * to access them as a web standard stream. Examples include Deno.stdin and
         * Deno.FsFile objects, such as those returned by Deno.open(). Note that
         * Deno will automatically close the resource when the stream is finished.
         */
        else if (hasReadableStream(this.body)) {
            this.body = this.body.readable;
        }
        else if (isReader(this.body)) {
            this.body = streams.readableStreamFromReader(this.body);
        }

        if (typeof this.body === 'string') {
            const mediaType = this.body ? 'text/html' : 'text/plain';
            defaultHeader('content-type', mediaType + '; charset=utf-8');
        }
        // Types that Response supports natively
        else if (
            this.body === null ||
            this.body === undefined ||
            this.body instanceof ArrayBuffer ||
            ArrayBuffer.isView(this.body) ||
            this.body instanceof Blob ||
            this.body instanceof FormData ||
            this.body instanceof ReadableStream ||
            this.body instanceof URLSearchParams
        ) {
            // No action needed
        }
        else if (
            typeof this.body === 'object' ||
            typeof this.body === 'number' ||
            typeof this.body === 'boolean'
        ) {
            defaultHeader('content-type', 'application/json; charset=utf-8');
            this.body = JSON.stringify(this.body);
        }
        else {
            throw bang.badImplementation('Unable to create response due to unsupported body type');
        }

        return new Response(this.body, {
            headers : this.headers,
            status  : this.status
        });
    }
    type(mediaType: string) {
        return this.header('Content-Type', mediaType);
    }
    unstate(name: string) {
        cookie.deleteCookie(this.headers, name);
        return this;
    }
}
