import Response from './response.js';

export default class Toolkit {
    response(body) {
        const response = new Response();
        response.body = body;
        return response;
    }
    redirect(...args) {
        return this.response().redirect(...args);
    }
}
