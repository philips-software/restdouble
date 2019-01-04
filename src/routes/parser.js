'use strict';

const url = require('url');

const PATH_VARIABLE_PREFIX = ':';
const PATH_VARIABLE_SEGMENT = ':ANY';

class Query {
    constructor(segments, search) {
        this.segments = segments; // path segments
        this.search = search; // query string
    }
}

function parsePath(path) {
    let parsed = {};
    try {
        parsed = url.parse(path, true);
    } catch (err) {
        console.error(err.message);
    }

    const pathname = parsed.pathname;
    const search = parsed.search || '';

    let splitted = [];
    if (pathname) {
        splitted = pathname.split('/');
    }

    const segments = [];
    for (let i = 0, len = splitted.length; i < len; i++) {
        const item = splitted[i];
        if (!isBlank(item)) {
            segments.push(getSegment(item));
        }
    }

    return new Query(segments, search);
}

function getSegment(segment) {
    if (segment.startsWith(PATH_VARIABLE_PREFIX)) {
        return PATH_VARIABLE_SEGMENT;
    }
    return segment;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

exports.parsePath = parsePath;
exports.PATH_VARIABLE = PATH_VARIABLE_SEGMENT;
