import Response from './response.ts';

export default class Toolkit {
    response(body) {
        return new Response({ body });
    }
    redirect(...args) {
        return this.response().redirect(...args);
    }
}
