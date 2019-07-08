# restdouble 

Run a fake REST service to use as a [test double](https://martinfowler.com/bliki/TestDouble.html) or as a backend for rapid frontend prototyping.  

**restdouble** allows to serve string, JSON, and binary data through easy configuration.

## Quick Start

### Install **restdouble** 

    npm install -g restdouble

### Define your API in YAML format
        
        # api.yaml
        - path: /
          status: 200
          response: My API
        - path: /static/img.png
          file: ./myfiles/img.png
        - path: /api/users/1
          method: GET
          response: {"id": 1, "name": "user1"}
        - path: /api/users/1
          method: PUT
          response: {"id": 1, "name": "user1", "status": "updated"}
        - path: /api/users
          response: [{"id": 1, "name": "user1"}, {"id": 2, "name": "user2"}] 

Each item defines a route, which can have the following keys: 

        path: REST resource defining the route (default: '/')
        method: HTTP method name (default: 'ANY')
        status: HTTP response code (default: 200)
        file: Path to a file to be served
        response: String or JSON object to be served
        hook: Name of the custom request handler method

See the [Section](#define-hook-methods) on defining hook methods for more information.

### Start Server
 
    restdouble start -a api.yaml
 
By default the server starts on **localhost:3000**. You can start the server on a different port by using the *-p* option. 

    restdouble start -a api.yaml -p 8888

### Access API

Now you can access all the routes defined in your API description. For instance, the curl command below:

    curl --request GET http://localhost:3000/api/users

returns: 

    [{  
      "id": 1,
      "name": "user1"
     },
     {  
      "id": 2,
      "name": "user2"
    }]


You can access a route using any HTTP method unless you restrict this behaviour by defining a HTTP method in the API description file. 


## Use URL Variables

You can define a URL variable starting a segment with a colon ':'. You can then substitue the URL variable with any string when making an HTTP request. 

    - path: /api/users/:userid/friends
      response: [{"id": 3, "name": "user3"}, {"id": 4, "name": "user4"}]

Note that if a request matches with multiple routes, the most specific one will be evaluated.


## Define Hook Methods

If you need more detailed control over an API route, you can define a hook method that will be invoked when a request matches with the associated route. A hook method will be passed a [request](https://nodejs.org/api/http.html#http_class_http_clientrequest) and a [response](https://nodejs.org/api/http.html#http_class_http_serverresponse) object respectively. The methods you define need to be exported in order to be invoked at runtime. 

Below, you can see an example:   

In your API description file, set your method names as values to the hook keys.

    # api.yaml
    - path: /api/auth
      method: GET
      hook: token
    - path: /api/users/:userid/status
      hook: status

Define and export functions in a JavaScript file.

    // hooks.js
    function token(request, response) {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.write(QxoXtkmYk5);
        response.end();
    }

    function status(request, response) {
        var authHeader = request.headers['Authorization'];
        if (authHeader !== 'Bearer QxoXtkmYk5') {
             response.writeHead(401);
        } else if (request.method === 'GET') {
             response.writeHead(200, { 'Content-Type': 'application/json' });
             response.write(JSON.stringify({ 'status': 'active' }));
        } 
        response.end();
    }

    exports.token = token;
    exports.status = status;
    

Then, start a server passing hooks file as a parameter.

    restdouble start -a api.yaml -j hooks.js

## Use Query Strings

If you need dynamic behavior based on query strings, you can use a hook method.    

    // hooks.js
    function getUsers(request, response) {
        var url = require('url');

        var query = url.parse(req.url, true).query;
        // now parameters can be accessed as properties of the 'query' object

        var data = [..];

        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify(data.slice(query.start, query.end)));
        response.end();
    } 

    exports.getUsers = getUsers;

## Command Line Interface

Usage:

    restdouble [options] 

Options:

    -v, --version       output the version number
    -a, --api [file]    give path to REST API description file
    -j, --hooks [file]  give path to hook methods file
    -H, --host [host]   set service host (default: "localhost")
    -p, --port [port]   set service port (default: 3000)
    -N, --nocors        disable CORS (default: enabled)
    -h, --help          output usage information

## Usage with JavaScript

You can use restdouble in scripts through two exposed methods: **start()** and **stop()**. 

To start the server:

    var server = require('restdouble').server;

    var params = {
      api: 'api.yaml',
      hooks: 'hooks.js',
    };

    server.start(params, ()=> {
      console.log('Server started.');
    });

You can set and pass the following parameters to the start method:

    api:    path to REST API description file
    hooks:  path to hook methods file
    host:   service host (default: "localhost")
    port:   service port (default: 3000)
    cors:   enable cors  (default: false)

To stop the server:

    server.stop(()=> {
      console.log('Server stopped.');
    });


## Docker

You can run restdouble as a Docker container.

To build a Docker image, at the root of the source tree, run:

    docker build . -t restdouble

All input files needs to be mounted to the **/usr/src/input/**  folder in the container. The API description file has to be named as **api.yaml**, and the hooks module has to be named as **hooks.js**. 

To run a container:

    docker run -p 3000:3000 -v /Users/me/myinput/:/usr/src/input/ restdouble

## License 
MIT