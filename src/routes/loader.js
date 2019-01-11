'use strict';

const yaml = require('js-yaml');
const fs = require('fs');
const Route = require('./route');

function loadRoutes(filePath) {
    try {
        const doc = yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
        const routes = [];

        for (let index in doc) {
            const route = Route.create(doc[index]);
            routes.push(route);
        }
        return routes;
    } catch (err) {
        console.error(`Failed to load ${filePath}`, err.message);
        return [];
    }
}

function defaultRoutes() {
    const route = Route.create({ 'response': 'RestDouble Service' });
    const routes = [];
    routes.push(route);
    return routes;
}

exports.loadRoutes = loadRoutes;
exports.defaultRoutes = defaultRoutes;
