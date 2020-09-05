// Deps
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');

const handlers = require('./lib/handlers');
const helpers = require('./lib/helpers');


const StringDecoder = require('string_decoder').StringDecoder;

const PORT = process.env.PORT;
const HttpPort = process.env.HttpPort;

const decoder = new StringDecoder('utf-8');


const routes = {
  'ping': handlers.ping,
  'users': handlers.users,
  'auth': handlers.authenticate
};


// server should respond to all requests with a string

const app = (req, res) => {
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
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();

    // select handler for request, use not found if none
    const handler = routes[resource] ? routes[resource] : handlers.notFound;

    const data = {
      resource,
      queryString,
      method,
      headers,
      payload: helpers.parseJSONToObject(buffer),
    };

    handler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

      console.log(typeof(payload) === 'object', payload, 'object');

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
    console.log(`${method} /${resource}`);
    console.log(JSON.stringify(headers, null, 2));
    console.log('PAYLOAD', JSON.stringify(buffer, null, 2));

  });
};

const httpServer = http.createServer(app);

// start the server and listen on port 3000

httpServer.listen(PORT, () => {
  console.log(`Server started on ${process.env.NODE_ENV} and Listening on port ${PORT}`);
});

const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem'),
};

const httpsServer = https.createServer(httpsServerOptions, app);

httpsServer.listen(HttpPort, () => {
  console.log(`Server started on ${process.env.NODE_ENV} and Listening on port ${HttpPort}`);
});

