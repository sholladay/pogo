import { status, statusText } from '../dependencies.js';
import Toolkit from './toolkit.js';

const encoder = new TextEncoder();

const respond = (request, source) => {
    const response = source instanceof Toolkit ?
        source._response :
        {
            body    : source,
            headers : new Headers()
        };

    if (typeof response.body === 'string') {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        response.body = encoder.encode(response.body);
    }
    else if (response.body === null || (source instanceof Toolkit && response.body === undefined)) {
        response.body = encoder.encode('');
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
            message : 'An internal error occurred on the server'
        }));
    }

    return response;
};

respond.notFound = (request) => {
    const h = new Toolkit()
        .body({
            error   : statusText.get(status.NotFound),
            message : 'Page not found'
        })
        .code(status.NotFound);
    return respond(request, h);
};

respond.badImplementation = (request) => {
    const h = new Toolkit()
        .body({
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        })
        .code(status.InternalServerError);
    return respond(request, h);
};

export default respond;
