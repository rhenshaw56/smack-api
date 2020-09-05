const _data = require('./data');

const validator = {};

validator.validateString = (data, requiredLength = 0) => typeof(data) === 'string'
  && data.trim().length > requiredLength
  ? data.trim()
  : false;

validator.validateBool = (data) => typeof(data) === 'boolean' && data === true ? true : false;

// verify if given token id is currently valid for a given user
validator.validateSession = (id, phone, cb) => {
  // Lookup session
  _data.read('auth', id, (err, data) => {
    if (!err && data) {
      // check token belongs to given user and has not expired
      if (data.phone === phone && data.expires > Date.now()) {
        cb(true)
      } else {
        cb(false);
      }
    } else {
      cb(false);
    }
  });
};


module.exports = validator;