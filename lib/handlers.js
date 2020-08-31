const _users = require('./users');

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

module.exports = handlers;