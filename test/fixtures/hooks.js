'use strict';

function status(_, response) {
    response.write('active');
    response.end();
}

function paging(request, response) {
    var url = require('url');

    const data = [
        { 'id': 1, 'name': 'user1' },
        { 'id': 2, 'name': 'user2' },
        { 'id': 3, 'name': 'user3' },
        { 'id': 4, 'name': 'user4' },
        { 'id': 5, 'name': 'user5' },
        { 'id': 6, 'name': 'user6' }
    ];

    var query = url.parse(request.url, true).query;
    const offset = query.offset ? Number(query.offset) : 0;
    const limit = query.limit ? Number(query.limit) : data.length;
    const start = Math.min(Math.max(0, offset), data.length - 1);
    const end = Math.min(start + Math.max(0, limit), data.length);
    const slice = data.slice(start, end);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(slice));
    response.end();
}

exports.status = status;
exports.paging = paging;