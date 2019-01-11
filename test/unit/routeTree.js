/* eslint-env mocha */
'use strict';

const assert = require('assert');
const utils = require('./utils');
const RouteTree = require('../../src/routes/routeTree');

describe('RouteTree', function () {
    describe('#createRouteTree', function () {
        it('return an empty route tree when null is passed', function () {
            const root = RouteTree.create(null);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.equal(root.size(), 0);
        });

        it('return an empty route tree when no routes provided', function () {
            const root = RouteTree.create([]);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.equal(root.size(), 0);
        });

        it('return a route tree with only root node', function () {
            const route = utils.createRoute('/');
            const routes = [];
            routes.push(route);
            const root = RouteTree.create(routes);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.deepEqual(root.getRoute(), route);
            assert.equal(root.size(), 0);
        });

        it('return a route tree with multiple nodes', function () {
            const routes = utils.createTestRoutesWithoutMethods();
            const root = RouteTree.create(routes);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.notEqual(root.size(), 0);
        });
    });

    describe('#findRoute', function () {
        describe('routes with flexible methods', function () {
            it('return null if route does not exist', function () {
                const routes = utils.createTestRoutesWithoutMethods();
                const root = RouteTree.create(routes);

                const paths = [' ', '.', '/foo', 'foo/', '../', '?/', '//',
                    '/static', '/api/v1/users', '/api/users/3/friend',
                    '/api/users/2/friends/1'];

                for (let i in paths) {
                    const actual = RouteTree.findRoute(root, paths[i]);
                    assert.deepEqual(actual, null);
                }
            });

            it('find all routes', function () {
                const routes = utils.createTestRoutesWithoutMethods();
                const root = RouteTree.create(routes);

                const paths = ['/', 'index.html', 'static/img.png',
                    '/api/users/1', '/api/users/2', '/api/users/3/status',
                    '/api/users/5', '/api/users/any',
                    '/api/users/any/friends', '/api/users'];

                const expected = [
                    'Lorem Ipsum',
                    '<html><body>Lorem Ipsum</body></html>',
                    undefined,
                    { 'id': 1, 'name': 'user1' },
                    { 'id': 2, 'name': 'user2' },
                    { 'status': 'active' },
                    undefined,
                    { 'id': 1, 'name': 'user1' },
                    [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }],
                    [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }]
                ];

                const methods = [undefined, 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
                for (let i in paths) {
                    for (let j in methods) {
                        const actual = RouteTree.findRoute(root, paths[i], methods[j]);
                        assert.deepEqual(actual.response, expected[i]);
                    }
                }
            });
        });

        describe('routes with restricted methods', function () {
            it('return null if route exist but called with a different method', function () {
                const routes = utils.createTestRoutesWithMethods();
                const root = RouteTree.create(routes);

                const requests = [
                    ['/', 'POST'],
                    ['/api/users/1', 'DELETE'],
                    ['/api/users/3', 'POST'],
                    ['/api/users/any', 'POST']
                ];

                for (let i in requests) {
                    const actual = RouteTree.findRoute(root, requests[i][0], requests[i][1]);
                    assert.deepEqual(actual, null);
                }
            });

            it('find all routes', function () {
                const routes = utils.createTestRoutesWithMethods();
                const root = RouteTree.create(routes);

                const requests = [
                    ['/', 'GET'],
                    ['/api/users/1', 'POST'],
                    ['/api/users/1', 'GET'],
                    ['/api/users/1', 'PUT'],
                    ['/api/users/1', 'PATCH'],
                    ['/api/users/3', 'GET'],
                    ['/api/users/any', 'GET'],
                    ['/api/users', 'GET'],
                    ['/api/users', 'POST'],
                    ['api/users', 'DELETE']];

                const expected = [
                    'Lorem Ipsum',
                    { 'id': 1, 'name': 'user1' },
                    { 'id': 1, 'name': 'user1' },
                    { 'id': 1, 'name': 'user1', 'status': 'updated' },
                    { 'id': 1, 'name': 'user1', 'status': 'updated' },
                    { 'msg': 'user does not exist' },
                    { 'id': 1, 'name': 'user1' },
                    [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }],
                    { 'id': 3, 'name': 'user3' },
                    {}
                ];

                for (let i in requests) {
                    const actual = RouteTree.findRoute(root, requests[i][0], requests[i][1]);
                    assert.deepEqual(actual.response, expected[i]);
                }
            });
        });
    });
});
