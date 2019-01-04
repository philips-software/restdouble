/* eslint-env mocha */
'use strict';

const assert = require('assert');
const utils = require('./utils');
const RouteTree = require('../../src/routes/routeTree');

describe('RouteTree', function () {
    var routes;

    beforeEach(function () {
        routes = utils.createTestRoutes();
    });

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
            const oneRouteList = [];
            oneRouteList.push(route);
            const root = RouteTree.create(oneRouteList);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.deepEqual(root.getRoute(), route);
            assert.equal(root.size(), 0);
        });

        it('return a route tree with multiple nodes', function () {
            const root = RouteTree.create(routes);

            assert.notEqual(root, undefined);
            assert.notEqual(root, null);

            assert.equal(root.segment, '/');
            assert.notEqual(root.size(), 0);
        });
    });

    describe('#findRoute', function () {
        it('return null if route does not exist', function () {
            const root = RouteTree.create(routes);

            const paths = [' ', '.', '/foo', 'foo/', '../', '?/', '//',
                '/api/v1', '/api/v1/users', '/api/users/3/friend',
                '/api/users/2/friends/1'];

            for (let i in paths) {
                const actual = RouteTree.findRoute(root, paths[i]);
                assert.deepEqual(actual, null);
            }
        });

        it('find all routes', function () {
            const root = RouteTree.create(routes);

            const paths = ['/', 'index.html', 'static/img.png', '/auth', '/auth?token=hour',
                '/api/users/1', '/api/users/2', '/api/users/3'];
            const expected = [
                'Lorem Ipsum',
                '<html><body>Lorem Ipsum</body></html>',
                undefined,
                { 'token': 'QxoXtkmYk5' },
                { 'token': 'QxoXtkmYk5' },
                { 'id': 1, 'name': 'user1' },
                { 'id': 2, 'name': 'user2' },
                { 'id': 1, 'name': 'user1' }
            ];

            for (let i in paths) {
                const actual = RouteTree.findRoute(root, paths[i]);
                assert.deepEqual(actual.response, expected[i]);
            }
        });
    });

});
