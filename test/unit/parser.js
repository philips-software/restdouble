/* eslint-env mocha */
'use strict';

const assert = require('assert');
const parser = require('../../src/routes/parser');

describe('parser', function () {
    describe('#parsePath', function () {
        it('return an empty array when path is undefined', function () {
            let path;
            const segments = parser.parsePath(path);

            assert.deepEqual(segments, []);
        });

        it('return an empty array when path is empty', function () {
            const path = '';
            const segments = parser.parsePath(path);

            assert.deepEqual(segments, []);
        });

        it('return an empty array when path is all white space', function () {
            const path = '      ';
            const segments = parser.parsePath(path);

            assert.deepEqual(segments, []);
        });

        it('return an empty array when path is a single slash', function () {
            const path = '/';
            const segments = parser.parsePath(path);

            assert.deepEqual(segments, []);
        });

        it('return segments as arrays', function () {
            const paths = ['api', '/api', '/api/', '//api', '/ api ',
                '/api/users/:id', '/api/users/::id', '/api/users/:id/status',
                '/api/users/3/friends?',
                '/api/users/3/friends?offset=0&size=10'
            ];

            const expected = [
                ['api'],
                ['api'],
                ['api'],
                ['api'],
                ['%20api'],
                ['api', 'users', ':ANY'],
                ['api', 'users', ':ANY'],
                ['api', 'users', ':ANY', 'status'],
                ['api', 'users', '3', 'friends'],
                ['api', 'users', '3', 'friends']
            ];

            for (let i in paths) {
                const segments = parser.parsePath(paths[i]);
                assert.deepEqual(segments, expected[i]);
            }
        });
    });
});