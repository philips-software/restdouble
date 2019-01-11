'use strict';

const path = require('path');
const fileSystem = require('fs');

const RouteTree = require('../routes/routeTree');

function notFound(request, response) {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.write(`No route exists for ${request.url}`);
    response.end();
}

function serveFile(route, response) {
    try {
        const filePath = path.join(route.file);
        const stat = fileSystem.statSync(filePath);

        response.writeHead(route.status, {
            'Content-Type': 'application/octect-stream',
            'Content-Length': stat.size
        });

        const readStream = fileSystem.createReadStream(filePath);
        readStream.pipe(response);
    } catch (err) {
        console.error(err.message);
        response.end();
    }
}

function serveJSON(route, response) {
    try {
        response.writeHead(route.status, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(route.response));
    } catch (err) {
        console.error(err.message);
    }
    response.end();
}

function serveText(route, response) {
    response.writeHead(route.status, { 'Content-Type': 'text/plain' });
    response.write(route.response);
    response.end();
}

function setCORSHeaders(response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Request-Method', '*');
    response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    response.setHeader('Access-Control-Allow-Headers', '*');
}

function serveRequest(tree, hooks, cors) {
    return function (request, response) {
        try {
            console.log(`${request.method} request received for ${request.url}`);
            if (cors) {
                setCORSHeaders(response);
            }

            const route = RouteTree.findRoute(tree, request.url, request.method);
            if (!route) {
                notFound(request, response);
            } else if (route.hook) {
                const hook = hooks[route.hook];
                hook(request, response);
            } else if (route.file) {
                serveFile(route, response);
            } else if (typeof (route.response) === 'object') {
                serveJSON(route, response);
            } else {
                serveText(route, response);
            }
        } catch (err) {
            console.error(err.message);
            response.end();
        }
    };
}

exports.serveRequest = serveRequest;
