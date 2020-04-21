import {
    React,
    ReactDOMServer,
    status,
    statusText
} from '../dependencies.ts';
import Response from './response.ts';
import { ResponseBody } from './types.ts';

const serialize = (source: Response | ResponseBody | Error): Response => {
    const response = Response.wrap(source);

    if (React.isValidElement(response.body)) {
        response.body = ReactDOMServer.renderToStaticMarkup(response.body);
    }
    if (typeof response.body === 'string') {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'text/html; charset=utf-8');
        }
    }
    else if (response.body === null && source !== undefined) {
        response.body = '';
    }
    else if (response.body instanceof Deno.File || response.body instanceof Deno.Buffer || response.body instanceof Uint8Array) {
        return response;
    }
    else if (['object', 'number', 'boolean'].includes(typeof response.body) && source !== undefined) {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'application/json; charset=utf-8');
        }
        response.body = JSON.stringify(response.body);
    }
    else {
        response.status = status.InternalServerError;
        response.headers.set('content-type', 'application/json; charset=utf-8');
        response.body = JSON.stringify({
            error   : statusText.get(status.InternalServerError),
            message : statusText.get(status.InternalServerError),
            status  : status.InternalServerError
        });
    }

    return response;
};

export default serialize;
