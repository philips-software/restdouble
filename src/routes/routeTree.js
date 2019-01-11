'use strict';

const parser = require('./parser');
const methods = require('./methods');

const ROOT_SEGMENT = '/';

class TreeNode {
    constructor(segment) {
        this.segment = segment || ROOT_SEGMENT;
        this.nodes = {}; // key: segment, value: TreeNode
        this.routes = {}; // key: http method, value: Route
    }

    has(segment) {
        return (segment in this.nodes);
    }

    addNode(node) {
        this.nodes[node.segment] = node;
        return node;
    }

    getNode(segment) {
        return this.nodes[segment];
    }

    setRoute(route) {
        const method = route.method;
        this.routes[method] = route;
        return route;
    }

    getRoute(method) {
        return this.routes[method] || this.routes[methods.ANY_METHOD];
    }

    size() {
        return Object.keys(this.nodes).length;
    }
}

class RouteTree {

    static create(routes) {
        const root = new TreeNode();
        if (!routes) {
            return root;
        }

        for (let i = 0, len = routes.length; i < len; i++) {
            addRouteToTree(root, routes[i]);
        }
        return root;
    }

    static findRoute(root, path, method) {
        if (typeof (path) === 'undefined' || path == null) {
            return null;
        }
        if (path === '' || path === '/') {
            return root.getRoute(method);
        }

        let current = root;
        const segments = parser.parsePath(path);
        const len = segments.length;
        let index = 0;
        while (index < len && current) {
            const segment = segments[index];

            if (current.has(segment)) {
                current = current.getNode(segment);
            } else if (current.has(parser.PATH_VARIABLE)) {
                current = current.getNode(parser.PATH_VARIABLE);
            } else {
                return null;
            }
            index++;
        }

        return (index > 0) ? current.getRoute(method) : null;
    }
}

function addRouteToTree(root, route) {
    if (route.path === ROOT_SEGMENT) {
        root.setRoute(route);
        return;
    }

    let current = root;
    const segments = parser.parsePath(route.path);
    const len = segments.length;
    let index = 0;
    while (index < len) {
        const segment = segments[index];

        if (!current.has(segment)) {
            current.addNode(new TreeNode(segment));
        }
        current = current.getNode(segment);
        index++;
    }

    current.setRoute(route);
}

module.exports = RouteTree;
