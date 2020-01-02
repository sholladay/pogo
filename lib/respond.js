import {
    React,
    ReactDOMServer,
    status,
    statusText
} from '../dependencies.js';
import Response from './response.js';

const encoder = new TextEncoder();

const respond = (source) => {
    const response = Response.wrap(source);

    if (React.isValidElement(response.body)) {
        response.body = ReactDOMServer.renderToStaticMarkup(response.body);
    }
    if (typeof response.body === 'string') {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        response.body = encoder.encode(response.body);
    }
    else if (response.body === null || (source instanceof Response && response.body === undefined)) {
        response.body = encoder.encode('');
    }
    else if (response.body instanceof Deno.File || response.body instanceof Deno.Buffer) {
        return response;
    }
    else if (['object', 'number', 'boolean'].includes(typeof response.body)) {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'application/json; charset=utf-8');
        }
        response.body = encoder.encode(JSON.stringify(response.body));
    }
    else {
        response.status = status.InternalServerError;
        response.headers.set('content-type', 'application/json; charset=utf-8');
        response.body = encoder.encode(JSON.stringify({
            error   : statusText.get(status.InternalServerError),
            message : statusText.get(status.InternalServerError),
            status  : status.InternalServerError
        }));
    }

    return response;
};

export default respond;
