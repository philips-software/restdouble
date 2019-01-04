/* eslint-env mocha */
'use strict';

const assert = require('assert');
const parser = require('../../src/routes/parser');

describe('parser', function () {
    describe('#parsePath', function () {
        it('return an empty query object when path is undefined', function () {
            let path;
            const query = parser.parsePath(path);

            assert.deepEqual(query.segments, []);
            assert.equal(query.search, '');
        });

        it('return an empty query object when path is empty', function () {
            const path = '';
            const query = parser.parsePath(path);

            assert.deepEqual(query.segments, []);
            assert.equal(query.search, '');
        });

        it('return an empty query object when path is all white space', function () {
            const path = '      ';
            const query = parser.parsePath(path);

            assert.deepEqual(query.segments, []);
            assert.equal(query.search, '');
        });

        it('return an empty query object when path is a single slash', function () {
            const path = '/';
            const query = parser.parsePath(path);

            assert.deepEqual(query.segments, []);
            assert.equal(query.search, '');
        });

        it('return non-empty query objects', function () {
            const paths = ['api', '/api', '/api/', '//api', '/ api ',
                '/api/users/:id', '/api/users/::id', '/api/users/:id/status',
                '/api/users/3/friends?',
                '/api/users/3/friends?offset=2',
                '/api/users/3/friends?offset=0&size=10'
            ];
            const expected = [
                [['api']], [['api']], [['api']], [['api']], [['%20api']],
                [['api', 'users', ':ANY']], [['api', 'users', ':ANY']],
                [['api', 'users', ':ANY', 'status']],
                [['api', 'users', '3', 'friends'], '?'],
                [['api', 'users', '3', 'friends'], '?offset=2'],
                [['api', 'users', '3', 'friends'], '?offset=0&size=10']
            ];

            for (let i in paths) {
                const actual = parser.parsePath(paths[i]);
                assert.deepEqual(actual.segments, expected[i][0]);
                assert.equal(actual.search, expected[i][1] || '');
            }
        });
    });
});