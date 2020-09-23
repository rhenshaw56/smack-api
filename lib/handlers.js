const _users = require('./users');
const _auth = require('./auth');
const _checks = require('./checks');

const handlers = {};

handlers.ping = (data, cb) => {
  // callback http status code and a payload
  cb(200);
};



handlers.notFound = (data, cb) => {
  cb(404);
};

handlers.users = (data, cb) => {
  // callback http status code and a payload
  const supportedMethods = {
    'POST': 'post',
    'GET': 'get',
    'PUT': 'put',
    'DELETE': 'delete'
  };

  const method = supportedMethods[data.method];

  if (method) {
    handlers._users = _users;
    handlers._users[method](data, cb)  
  } else {
    cb(405);
  }
  

  // cb(200);


};

handlers.authenticate = (data, cb) => {
  // callback http status code and a payload
  const supportedMethods = {
    'POST': 'post',
    'GET': 'get',
    'PUT': 'put',
    'DELETE': 'delete'
  };

  const method = supportedMethods[data.method];

  if (method) {
    handlers._auth = _auth;
    handlers._auth[method](data, cb)  
  } else {
    cb(405);
  }
};

handlers.checks = (data, cb) => {
  // callback http status code and a payload
  const supportedMethods = {
    'POST': 'post',
    'GET': 'get',
    'PUT': 'put',
    'DELETE': 'delete'
  };

  const method = supportedMethods[data.method];

  if (method) {
    handlers._checks = _checks;
    handlers._checks[method](data, cb)  
  } else {
    cb(405);
  }
}

module.exports = handlers;