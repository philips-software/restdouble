'use strict';

const methods = require('./methods');

class Route {

    static create(obj) {
        const route = new Route();
        route.path = obj['path'] || '/';
        route.method = methods.resolve(obj['method']);
        route.status = obj['status'] || 200;
        route.file = obj['file'];
        route.response = obj['response'];
        route.hook = obj['hook'];
        return route;
    }
}

module.exports = Route;
