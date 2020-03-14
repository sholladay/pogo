import Router from './lib/router.ts';
import Server from './lib/server.ts';

export default {
    server(...args) {
        return new Server(...args);
    },
    router(...args) {
        return new Router(...args);
    }
};
