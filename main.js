import Router from './lib/router.js';
import Server from './lib/server.js';

export default {
    server(...args) {
        return new Server(...args);
    },
    router(...args) {
        return new Router(...args);
    }
};
