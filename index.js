// Deps
const http = require('http');
const url = require('url');

const PORT = 3000;


// server should respond to all requests with a string


var server = http.createServer((req, res) => {
  // GET url and parse it

  const parsedUrl = url.parse(req.url, true);

  // GET the path
  const path = parsedUrl.pathname;

  const resource = path.replace(/^\/+|\/+$/g, '');


  // GET the HTTP Methhod
  const method = req.method;


  // SEND the response
  res.end('Hello World\n');

  console.log(`Request recieved for resource: ${method} ${resource}`);


});

// start the server and listen on port 3000

server.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});
