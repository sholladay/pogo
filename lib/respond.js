import { status, statusText } from '../dependencies.js';
import Response from './response.js';

const encoder = new TextEncoder();

const respond = (request, source) => {
    const response = Response.wrap(source);

    if (typeof response.body === 'string') {
        if (!response.headers.has('content-type')) {
            response.headers.set('content-type', 'text/html; charset=utf-8');
        }
        response.body = encoder.encode(response.body);
    }
    else if (response.body === null || (source instanceof Response && response.body === undefined)) {
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
    const response = new Response({
            error   : statusText.get(status.NotFound),
            message : 'Page not found'
        })
        .code(status.NotFound);
    return respond(request, response);
};

respond.badImplementation = (request) => {
    const response = new Response({
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        })
        .code(status.InternalServerError);
    return respond(request, response);
};

export default respond;
