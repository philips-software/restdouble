'use strict';

const ANY_METHOD = 'ANY';

const httpMethods = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};

function resolve(method) {
    if (method) {
        return httpMethods[method.toUpperCase()];
    }
    return ANY_METHOD;
}

exports.resolve = resolve;
exports.ANY_METHOD = ANY_METHOD;
