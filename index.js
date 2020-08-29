// Deps
const http = require('http');

const PORT = 3000;


// server should respond to all requests with a string

var server = http.createServer((req, res) => {
  res.end('Hello World\n');
});

// start the server and listen on port 3000

server.listen(PORT, () => {
  console.log(`Server Listening on port ${PORT}`);
});
