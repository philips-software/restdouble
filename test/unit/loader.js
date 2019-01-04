/* eslint-env mocha */
'use strict';

const path = require('path');
const assert = require('assert');
const { loadRoutes, defaultRoutes } = require('../../src/routes/loader');

const fixturesDir = path.normalize(path.join(__dirname, '..', 'fixtures'));

describe('loader', function () {
    describe('#loadRoutes', function () {
        it('return an empty array when description file does not exist', function () {
            const fullpath = path.join(fixturesDir, 'na.yaml');
            const actual = loadRoutes(fullpath);
            const expected = [];

            assert.deepEqual(actual, expected);
        });

        it('return an empty array when description file is empty', function () {
            const fullpath = path.join(fixturesDir, 'empty.yaml');
            const actual = loadRoutes(fullpath);
            const expected = [];

            assert.deepEqual(actual, expected);
        });

        it('return an empty array when yaml syntax is incorrect', function () {
            const fullpath = path.join(fixturesDir, 'format_err.yaml');
            const actual = loadRoutes(fullpath);
            const expected = [];

            assert.deepEqual(actual, expected);
        });

        it('return routes parsing test api description file', function () {
            const fullpath = path.join(fixturesDir, 'api.yaml');
            const actual = loadRoutes(fullpath);
            const expected = [
                ['/', 'Lorem Ipsum', 200, undefined],
                ['/index.htm', '<html><body>Lorem Ipsum</body></html>', 200, undefined],
                ['/static/img.png', undefined, 200, './test/fixtures/test.png'],
                ['/auth', { 'token': 'QxoXtkmYk5' }, 200, undefined],
                ['/api/users/1', { 'id': 1, 'name': 'user1' }, 200, undefined],
                ['/api/users/2', { 'id': 2, 'name': 'user2' }, 200, undefined],
                ['/api/users/3', undefined, 200, undefined],
                ['/api/users/5', { 'msg': 'user does not exist' }, 404, undefined],
                ['/api/users/:userid', { 'id': 1, 'name': 'user1' }, 200, undefined],
                ['/api/users/:userid/friends', [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }], 200, undefined],
                ['/api/users',
                    [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }, { 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }], 200, undefined],
                ['/api/users?offset=0&size=2', [{ 'id': 1, 'name': 'user1' }, { 'id': 2, 'name': 'user2' }], 200, undefined],
                ['/api/users?offset=2&size=2', [{ 'id': 3, 'name': 'user3' }, { 'id': 4, 'name': 'user4' }], 200, undefined]
            ];

            assert.equal(actual.length, expected.length);

            for (let i in actual) {
                assert.equal(actual[i].path, expected[i][0]);
                assert.deepEqual(actual[i].response, expected[i][1]);
                assert.equal(actual[i].status, expected[i][2]);
                assert.equal(actual[i].file, expected[i][3]);
            }
        });
    });

    describe('#defaultRoutes', function () {
        it('return the default routes', function () {
            const actual = defaultRoutes()[0];

            assert.equal(actual['path'], '/');
            assert.equal(actual['response'], 'RestDouble Service');
            assert.equal(actual['status'], 200);
        });
    });
});
