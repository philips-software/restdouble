const http = require('http');
const fileSystem = require('fs');

const { loadRoutes, defaultRoutes } = require('../routes/loader');
const RouteTree = require('../routes/routeTree');
const { serveRequest } = require('./handler');

let server;

function createRouteTree(apiFile) {
    var routes = [];
    if (apiFile) {
        routes = loadRoutes(apiFile);
        if (routes.length === 0) {
            console.error(`No routes loaded from ${apiFile}, exiting restdouble..`);
            process.exit(1);
        }
    } else {
        routes = defaultRoutes();
    }

    return RouteTree.create(routes);
}

function loadModule(hookFile) {
    var hooks = {};
    try {
        const wrappedSrc = `(function(module, exports) {
        ${fileSystem.readFileSync(hookFile, 'utf8')}
      })(module, hooks);`;
        eval(wrappedSrc);
    } catch (err) {
        console.error('Hook methods cannot be loded', err.message);
    }

    return hooks;
}

function start(params) {
    const host = params.host || 'localhost';
    const port = Number(params.port) || 3000;
    const apiFile = params.api;
    const hookFile = params.hooks;
    const cors = params.cors;

    // create route tree
    const tree = createRouteTree(apiFile);

    // load hook methods if provided
    const hooks = hookFile ? loadModule(hookFile) : {};

    // start server
    server = http.createServer(serveRequest(tree, hooks, cors));
    server.listen(port, host, (err) => {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log(`Server is listening on ${host}:${port}`);
    });
}

function stop() {
    server.close();
}

exports.start = start;
exports.stop = stop;
