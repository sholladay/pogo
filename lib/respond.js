import { status, statusText } from '../dependencies.js';

const respond = async (request, option) => {
    const response = { ...option };

    response.headers = new Headers(response.headers);
    if (!['string', 'object'].includes(typeof response.body)) {
        response.body = {
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        };
        response.status = status.InternalServerError;
    }

    if (typeof response.body === 'string') {
        response.body = new TextEncoder().encode(response.body);
        response.headers.set('Content-Type', 'text/html; charset=utf-8');
    }
    else if (typeof response.body === 'object') {
        response.body = new TextEncoder().encode(JSON.stringify(response.body));
        response.headers.set('Content-Type', 'application/json; charset=utf-8');
    }

    await request.respond(response);
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
