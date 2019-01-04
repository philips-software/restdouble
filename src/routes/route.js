'use strict';

class Route {

    static createRoute(obj) {
        const route = new Route();
        route.path = obj['path'] || '/';
        route.status = obj['status'] || 200;
        route.file = obj['file'];
        route.response = obj['response'];
        route.hook = obj['hook'];
        return route;
    }
}

module.exports = Route;
