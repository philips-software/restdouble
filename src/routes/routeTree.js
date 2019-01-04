'use strict';

const parser = require('./parser');

const ROOT_SEGMENT = '/';
const EMPTY_SEARCH = '';

class TreeNode {
    constructor(segment) {
        this.segment = segment || ROOT_SEGMENT;
        this.routes = {}; // key: query (search) string, value: Route
        this.nodes = {}; // key: segment, value: TreeNode
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

    setRoute(route, search) {
        this.routes[search || EMPTY_SEARCH] = route;
        return route;
    }

    getRoute(search) {
        return this.routes[search] || this.routes[EMPTY_SEARCH];
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
            const route = routes[i];
            addRouteToTree(root, route);
        }
        return root;
    }

    static findRoute(root, path) {
        if (typeof (path) == 'undefined' || path == null) {
            return null;
        }
        if (path === '' || path === '/') {
            return root.getRoute();
        }

        var current = root;
        const query = parser.parsePath(path);
        const segments = query.segments;
        const search = query.search;

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

        return (index > 0) ? current.getRoute(search) : null;
    }
}

function addRouteToTree(root, route) {
    if (route.path === '/') {
        root.setRoute(route);
        return;
    }

    var current = root;
    const query = parser.parsePath(route.path);
    const segments = query.segments;
    const search = query.search;

    const len = segments.length;
    let index = 0;
    while (index < len) {
        const segment = segments[index];
        if (!current.has(segment)) {
            const node = new TreeNode(segment);
            current.addNode(node);
        }
        current = current.getNode(segment);
        index++;
    }

    current.setRoute(route, search);
}


module.exports = RouteTree;