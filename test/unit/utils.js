'use strict';

var Route = require('../../src/routes/route');

function createRoute(path, response, status, file) {
    const obj = {};
    obj['path'] = path;
    obj['method'] = status || 200;
    obj['response'] = response;
    obj['file'] = file;

    return Route.createRoute(obj);
}

function createTestRoutes() {
    const routes = [];
    routes.push(createRoute('/', 'Lorem Ipsum'));
    routes.push(createRoute('/index.html', '<html><body>Lorem Ipsum</body></html>'));
    routes.push(createRoute('/static/img.png', undefined, 200, './fixtures/test.png'));
    routes.push(createRoute('/auth', { 'token': 'QxoXtkmYk5' }));

    routes.push(createRoute('/api/users/1', { 'id': 1, 'name': 'user1' }));
    routes.push(createRoute('/api/users/2', { 'id': 2, 'name': 'user2' }));
    routes.push(createRoute('/api/users/:userid', { 'id': 1, 'name': 'user1' }));
    routes.push(createRoute('/api/users/:userid/friends', [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }]));
    routes.push(createRoute('/api/users',
        [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }, { 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }]));
    routes.push(createRoute('/api/users?offset=0&size=2', [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }]));
    routes.push(createRoute('/api/users?offset=2&size=2', [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }]));
    routes.push(createRoute('/api/users/5', { 'msg': 'user does not exist' }, 404));

    return routes;
}

exports.createRoute = createRoute;
exports.createTestRoutes = createTestRoutes;
