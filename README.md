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
          response: {"id": 1, "name": "user1"}
        - path: /api/users
          response: [{"id": 1, "name": "user1"}, {"id": 2, "name": "user2"}] 

Each item defines a route, which can have the following keys: 

        path: REST resource defining the route (default: '/')
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

    curl --request GET http://localhost:3000/api/users/

returns: 

    [{  
      "id": 1,
      "name": "user1"
     },
     {  
      "id": 2,
      "name": "user2"
    }]


You can access a route using any HTTP method unless you customize this behavior by defining a hook method. See the relevant [section](#define-hook-methods) for an example.


## Use URL Variables

You can define a URL variable starting a segment with a colon ':'. 

    - path: /api/users/:userid/friends
      response: [{"id": 3, "name": "user3"}, {"id": 4, "name": "user4"}]

Note that if a request matches with multiple routes, the most specific one will be evaluated.


## Define Hook Methods

If you need more detailed control over an API route, you can define a hook method that will be invoked when a request matches with the associated route. A hook method will be passed a [request](https://nodejs.org/api/http.html#http_class_http_clientrequest) and a [response](https://nodejs.org/api/http.html#http_class_http_serverresponse) object respectively. The methods you define need to be exported in order to be invoked at runtime. 

Below, you can see an example:   

In your API description file, set your method names as values to the hook keys.

    # api.yaml
    - path: /api/users/:userid/status
      hook: status
    - path: /api/auth
      hook: token

Define and export functions in a JavaScript file.

    // hooks.js
    function status(request, response) {
        if (request.method === 'PUT') {
             response.writeHead(200, { 'Content-Type': 'application/json' };
             response.write(JSON.stringify({ 'status': 'active' }));
        } else if (request.method === 'GET') {
             response.writeHead(200, { 'Content-Type': 'application/json' };
             response.write(JSON.stringify({ 'status': 'inactive' }));
        } else {
             response.writeHead(405, { 'Content-Type': 'text/plain' });
        }
        response.end();
    }

    function token(request, response) {
        if (request.method !== 'GET') {
            response.writeHead(405, { 'Content-Type': 'text/plain' });
        } else {
            response.writeHead(200, { 'Content-Type': 'text/plain' });
            response.write(QxoXtkmYk5);
        }
        response.end();
    }

    exports.status = status;
    exports.token = token;


Then, start a server passing hooks file as a parameter.

    restdouble start -a api.yaml -j hooks.js

## Use Query Strings

You can define routes with static query strings. 

    - path: /api/users?offset=0&size=2
      response: [{"id": 1, "name": "user1"}, {"id": 2, "name": "user2"}]
    - path: /api/users?offset=2&size=2
      response: [{"id": 3, "name": "user3"}, {"id": 4, "name": "user4"}]


If you need dynamic behavior you can use a hook method.    

    // hooks.js
    function handleUsers(request, response) {
        var http = require('http'),
        url = require('url');

        var query = url.parse(req.url, true).query;
        // now parameters can be accessed as properties of the 'query' object
        // ... 
    } 

    exports.handleUsers = handleUsers;

## Command Line Interface

Usage:

    restdouble [options] 

Options:

    -v, --version       output the version number
    -a, --api [file]    give path to REST API description file
    -j, --hooks [file]  give path to hook methods file
    -H, --host [host]   set service host (default: "localhost")
    -p, --port [port]   set service port (default: 3000)
    -N, --nocors        disable CORS
    -h, --help          output usage information

## Docker

You can run restdouble as a Docker container.

To build a Docker image, at the root of the source tree, run:

    docker build . -t restdouble

All input files needs to be mounted to the **/usr/src/input/**  folder in the container. The API description file has to be named as **api.yaml**, and the hooks module has to be named as **hooks.js**. 

To run a container:

    docker run -p 3000:3000 -v /Users/me/myinput/:/usr/src/input/ restdouble

## License 
MIT