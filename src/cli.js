#! /usr/bin/env node
'use strict';

const program = require('commander');
const server = require('./server/server');

program
    .version('0.0.4', '-v, --version')
    .option('-a, --api [file]', 'give path to REST API description file')
    .option('-j, --hooks [file]', 'give path to hook methods file')
    .option('-H, --host [host]', 'set service host', 'localhost')
    .option('-p, --port [port]', 'set service port', 3000)
    .option('-N, --nocors', 'disable CORS')
    .parse(process.argv);

const apiFile = program.api;
const hookFile = program.hooks;
const host = program.host;
const port = program.port;
const cors = !(program.nocors || false);

const params = {
    'api': apiFile,
    'host': host,
    'port': port,
    'hooks': hookFile,
    'cors': cors
};

console.log('Starting server..');
server.start(params);
