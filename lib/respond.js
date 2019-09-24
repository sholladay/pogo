import { status, statusText } from '../dependencies.js';

const encoder = new TextEncoder();

const respond = (request, option) => {
    const response = { ...option };

    response.headers = new Headers(response.headers);

    if (typeof response.body === 'string') {
        response.headers.set('Content-Type', 'text/html; charset=utf-8');
        response.body = encoder.encode(response.body);
    }
    else if (response.body === null) {
        response.body = encoder.encode('');
    }
    else if (['object', 'number', 'boolean'].includes(typeof response.body)) {
        response.headers.set('Content-Type', 'application/json; charset=utf-8');
        response.body = encoder.encode(JSON.stringify(response.body));
    }
    else {
        response.status = status.InternalServerError;
        response.headers.set('Content-Type', 'application/json; charset=utf-8');
        response.body = encoder.encode(JSON.stringify({
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        }));
    }

    return response;
};

respond.notFound = (request, option) => {
    return respond(request, {
        body : {
            error   : statusText.get(status.NotFound),
            message : 'Page not found'
        },
        ...option,
        status : status.NotFound
    });
};

respond.badImplementation = (request, option) => {
    return respond(request, {
        body : {
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        },
        ...option,
        status : status.InternalServerError
    });
};

export default respond;
