import { status, statusText } from '../dependencies.js';

const respond = async (request, option) => {
    const config = { ...option };

    config.headers = new Headers(config.headers);
    if (!['string', 'object'].includes(typeof config.body)) {
        config.body = {
            error   : statusText.get(status.InternalServerError),
            message : 'An internal error occurred on the server'
        };
        config.status = status.InternalServerError;
    }

    if (typeof config.body === 'string') {
        config.body = new TextEncoder().encode(config.body);
        config.headers.set('Content-Type', 'text/html; charset=utf-8');
    }
    else if (typeof config.body === 'object') {
        config.body = new TextEncoder().encode(JSON.stringify(config.body));
        config.headers.set('Content-Type', 'application/json; charset=utf-8');
    }

    await request.respond(config);
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
