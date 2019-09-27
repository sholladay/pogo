import Server from './lib/server.js';

export default {
    server(...args) {
        return new Server(...args);
    }
};
