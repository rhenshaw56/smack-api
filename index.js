// Deps
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

const PORT = process.env.PORT;

const decoder = new StringDecoder('utf-8');


// server should respond to all requests with a string


var server = http.createServer((req, res) => {
  // GET url and parse it

  const parsedUrl = url.parse(req.url, true);

  // GET the path
  const path = parsedUrl.pathname;

  // Creates a resource with no trailing slashes
  const resource = path.replace(/^\/+|\/+$/g, '');

  // GET quesrystring as object
  const queryString = parsedUrl.query;


  // GET the HTTP Methhod
  const method = req.method;

  // GET http headers as object
  const headers = req.headers;

  // GET the payload as a buffer, if any
  let payload = '';
  req.on('data', (data) => {
    payload += decoder.write(data);
  });

  req.on('end', () => {
    payload += decoder.end();

    // select handler for request, use not found if none
    const handler = router[resource] ? router[resource] : handlers.notFound;

    const data = {
      resource,
      queryString,
      method,
      headers,
      payload
    };

    handler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      // Use the payload called back by the handler or default to empty object
      payload = typeof(payload) === 'object' ? payload : {};

      // stringify payload
      const payloadString = JSON.stringify(payload);

      // return response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });


    // LOGGING
    console.log(`${method} ${resource}`);
    console.log(JSON.stringify(headers, null, 2));
    console.log('PAYLOAD', JSON.stringify(payload, null, 2));

  });
});

// start the server and listen on port 3000

server.listen(PORT, () => {
  console.log(`Server started on ${process.env.NODE_ENV} and Listening on port ${PORT}`);
});

const handlers = {};

handlers.sample = (data, cb) => {
  // callback http status code and a payload
  cb(406, {'name': 'smaple handler'});
};

handlers.notFound = (data, cb) => {
  cb(404);
};



const router = {
  'sample': handlers.sample,
};
