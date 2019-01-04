'use strict';

function foo(_, response) {
    response.write('foo');
    response.end();
}

exports.foo = foo;
