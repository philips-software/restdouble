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
            const paths = ['/', '/index.htm', '/static/img.png', '/auth', '/api/users/1', '/api/users/2',
                '/api/users/:userid', '/api/users/:userid/friends', '/api/users?offset=0&size=2',
                '/api/users?offset=2&size=2', '/api/users/5', '/api/users/3', '/api/users/6',
                '/api/users', '/api/users?foo=bar'
            ];
            const expected = [
                'Lorem Ipsum', '<html><body>Lorem Ipsum</body></html>',
                fs.readFileSync(path.join(fixturesDir, 'test.png')).toString(), '{"token":"QxoXtkmYk5"}',
                '{"id":1,"name":"user1"}', '{"id":2,"name":"user2"}', '{"id":1,"name":"user1"}',
                '[{"id":3,"name":"user3"},{"id":4,"name":"user4"}]',
                '[{"id":1,"name":"user1"},{"id":2,"name":"user2"}]',
                '[{"id":3,"name":"user3"},{"id":4,"name":"user4"}]',
                '{"msg":"user does not exist"}', 'foo', '{"id":1,"name":"user1"}',
                '[{"id":1,"name":"user1"},{"id":2,"name":"user2"},{"id":3,"name":"user3"},{"id":4,"name":"user4"}]',
                '[{"id":1,"name":"user1"},{"id":2,"name":"user2"},{"id":3,"name":"user3"},{"id":4,"name":"user4"}]'
            ];

            const tasks = paths.map((value) => {
                return function (callback) {
                    get(value, (data) => {
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
                        get(value, (data) => {
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

function get(url, callback) {
    const options = {
        port: 3000,
        path: url,
        method: 'GET',
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
