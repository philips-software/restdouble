/* eslint-env mocha */
'use strict';

const http = require('http');
const assert = require('assert');
const async = require('async');
const fs = require('fs');
const path = require('path');

const server = require('../../src/server/server');

const fixturesDir = path.normalize(path.join(__dirname, '..', 'fixtures'));

describe('e2e tests', function () {
    describe('api description with flexible http methods', function () {
        before(() => {
            const params = {
                'api': path.join(fixturesDir, 'api.yaml'),
                'hooks': path.join(fixturesDir, 'hooks.js'),
            };
            server.start(params);
        });

        after(() => {
            server.stop();
        });

        describe('success scenarios', function () {
            it('recieve expected responses for matching routes', function (done) {
                const paths = ['/', '/index.htm', '/static/img.png', '/api/users/1', '/api/users/2',
                    '/api/users/3/status', '/api/users/5', '/api/users/:userid',
                    '/api/users/:userid/friends', '/api/users?offset=0&limit=2'];

                const expected = [
                    'Lorem Ipsum', '<html><body>Lorem Ipsum</body></html>',
                    fs.readFileSync(path.join(fixturesDir, 'test.png')).toString(),
                    '{"id":1,"name":"user1"}', '{"id":2,"name":"user2"}', 'active',
                    '{"msg":"user does not exist"}',
                    '{"id":1,"name":"user1"}',
                    '[{"id":3,"name":"user3"},{"id":4,"name":"user4"}]',
                    '[{"id":1,"name":"user1"},{"id":2,"name":"user2"}]'
                ];

                const tasks = paths.map((value) => {
                    return function (callback) {
                        call(value, 'GET', (data) => {
                            callback(null, data);
                        });
                    };
                });

                async.series(tasks, (_, results) => {
                    for (let i in results) {
                        assert.equal(results[i], expected[i]);
                    }
                    done();
                });
            });

            describe('failure scenarios', function () {
                it('receive "not found" messages for non-existing routes', function (done) {
                    const paths = ['/index.html', '/static/img.jpg', '/auth/user',
                        '/api/users/1/stat', '/api/user'
                    ];
                    const expected = paths.map((value) => {
                        return `No route exists for ${value}`;
                    });

                    const tasks = paths.map((value) => {
                        return function (callback) {
                            call(value, 'GET', (data) => {
                                callback(null, data);
                            });
                        };
                    });

                    async.series(tasks, (_, results) => {
                        for (let i in results) {
                            assert.equal(results[i], expected[i]);
                        }
                        done();
                    });
                });
            });
        });
    });

    describe('api description with http methods defined', function () {
        before(() => {
            const params = {
                'api': path.join(fixturesDir, 'api_methods.yaml')
            };
            server.start(params);
        });

        after(() => {
            server.stop();
        });

        describe('success scenarios', function () {
            it('recieve expected responses for matching routes', function (done) {
                const requests = [
                    ['/', 'GET'], ['/api/users/1', 'POST'], ['/api/users/1', 'GET'],
                    ['/api/users/1', 'PUT'], ['/api/users/1', 'PATCH'],
                    ['/api/users/3', 'GET'], ['/api/users/any', 'GET'],
                    ['/api/users', 'GET'], ['/api/users', 'POST'],
                    ['/api/users', 'DELETE']
                ];

                const expected = [
                    ['Lorem Ipsum', 200],
                    ['{"id":1,"name":"user1"}', 201],
                    ['{"id":1,"name":"user1"}', 200],
                    ['{"id":1,"name":"user1","status":"updated"}', 200],
                    ['{"id":1,"name":"user1","status":"updated"}', 200],
                    ['{"msg":"user does not exist"}', 400],
                    ['{"id":1,"name":"user1"}', 200],
                    ['[{"id":1,"name":"user1"},{"id":2,"name":"user2"}]', 200],
                    ['{"id":3,"name":"user3"}', 201],
                    ['', 204]
                ];

                const tasks = requests.map((item) => {
                    return function (callback) {
                        call(item[0], item[1], (data) => {
                            callback(null, data);
                        });
                    };
                });

                async.series(tasks, (_, results) => {
                    for (let i in results) {
                        assert.equal(results[i], expected[i][0]);
                    }
                    done();
                });
            });

            describe('failure scenarios', function () {
                it('receive "not found" messages for accessing existing routes with undefined methods', function (done) {
                    const paths = ['/api/users/1', '/api/users/any', '/api/users/3'];
                    const expected = paths.map((value) => {
                        return `No route exists for ${value}`;
                    });

                    const tasks = paths.map((value) => {
                        return function (callback) {
                            call(value, 'DELETE', (data) => {
                                callback(null, data);
                            });
                        };
                    });

                    async.series(tasks, (_, results) => {
                        for (let i in results) {
                            assert.equal(results[i], expected[i]);
                        }
                        done();
                    });
                });
            });
        });
    });
});

function call(url, method, callback) {
    const options = {
        port: 3000,
        path: url,
        method: method || 'GET',
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            callback(data);
        });
    });

    req.on('error', (err) => {
        console.error(err.message);
    });

    req.end();
}
