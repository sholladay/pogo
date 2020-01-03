import Response from './response.js';

export default class Toolkit {
    response(body) {
        return new Response({ body });
    }
    redirect(...args) {
        return this.response().redirect(...args);
    }
}
