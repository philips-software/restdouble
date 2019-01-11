'use strict';

var Route = require('../../src/routes/route');

function createRoute(path, response, method, status, file) {
    const obj = {};
    obj['path'] = path;
    obj['response'] = response;
    obj['method'] = method;
    obj['status'] = status || 200;
    obj['file'] = file;

    return Route.create(obj);
}

function createTestRoutesWithoutMethods() {
    const routes = [];
    routes.push(createRoute('/', 'Lorem Ipsum'));
    routes.push(createRoute('/index.html', '<html><body>Lorem Ipsum</body></html>'));
    routes.push(createRoute('/static/img.png', undefined, undefined, 200, './fixtures/test.png'));
    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1' }));
    routes.push(createRoute('/api/users/2', { 'id': 2, 'name': 'user2' }));
    routes.push(createRoute('/api/users/3/status', { 'status': 'active' }));
    routes.push(createRoute('/api/users/5', undefined, undefined, 404));
    routes.push(createRoute('/api/users/:userid', { 'id': 1, 'name': 'user1' }));
    routes.push(createRoute('/api/users/:userid/friends', [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }]));
    routes.push(createRoute('/api/users?offset=0&limit=2', [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }]));
    return routes;
}

function createTestRoutesWithMethods() {
    const routes = [];
    routes.push(createRoute('/', 'Lorem Ipsum', 'GET'));
    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1' }, 'POST', 201));
    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1' }, 'GET'));
    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1', 'status': 'updated' }, 'PUT'));
    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1', 'status': 'updated' }, 'PATCH'));
    routes.push(createRoute('/api/users/3', { 'msg': 'user does not exist' }, 'GET', 404));
    routes.push(createRoute('/api/users/:userid', { 'id': 1, 'name': 'user1' }, 'GET'));
    routes.push(createRoute('/api/users', [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }]));
    routes.push(createRoute('/api/users', { 'id': 3, 'name': 'user3' }, 'POST', 201));
    routes.push(createRoute('/api/users', {}, 'DELETE', 204));
    return routes;
}

exports.createRoute = createRoute;
exports.createTestRoutesWithoutMethods = createTestRoutesWithoutMethods;
exports.createTestRoutesWithMethods = createTestRoutesWithMethods;
