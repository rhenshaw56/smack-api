const _data = require('./data');
const validator = require('./valdators');
const helpers = require('./helpers');
const handlers = require('./handlers');


const auth = {};

// Data (required) -> phone, password
// optional -> none
auth.post = (data, cb) => {
  const phone = validator.validateString(data.payload.phone, 10);
  const password = validator.validateString(data.payload.password, 6);
  if (phone && password) {
    // Look up user
    _data.read('users', phone, (err, userData) => {
      if (!err && userData) {
        // Hash and compare sent password to saved password
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          //  create new token with random name, set expiration to 1hour in futurre
          const tokenID = helpers.createRandomString(20);
          
          const expires = Date.now() + 10000 * 60 *60;

          const tokenObject = {
            phone,
            id: tokenID,
            expires,
          };

          // store token in auth data
          _data.create('auth', tokenID, tokenObject, (err) => {
            if(!err) {
              cb(200, tokenObject);
            } else {
              cb(500, {'Error': 'Could not create token'});
            }
          });


        } else {
          cb(400, { 'Error': 'Password did not match'});
        }

      } else {
        cb(400, {'Error': 'Could not find specified user'});
      }
    })

  } else {
    cb(400, { 'Error': 'Missing required fields' })
  }
};


// Data (required) -> id
// optional -> none
auth.get = (data, cb) => {
  const id = validator.validateString(data.queryString.id, 10);
  if (id) {
    // Lookup auth token
    _data.read('auth', id, (err, token) => {
      if (!err && token) {

        cb(200, token);
      }  else {
        cb(404, { 'Error': 'Session not found' });
      }
    });

  } else {
    cb(400, { 'Error': 'Missinng required field'});
  }
};

// Data (required) -> id, extend
// optional -> none
// @TODO let authed auth only access their data
auth.put = (data, cb) => {
  const id = validator.validateString(data.payload.id, 10);
  const extend = validator.validateBool(data.payload.extend);
  if (id && extend) {
    // Lookup auth token
    _data.read('auth', id, (err, token) => {
      if (!err && token) {
        // check to ensure that token is not expired
        if (token.expires > Date.now()) {
          // Set expiration an hour from now
          token.expires = Date.now() + 1000 * 60 * 60;

          // save new update
          _data.update('auth', id, token, (err) => {
            if (!err) {
              cb(200);
            } else {
              cb(500, { 'Error': 'Could not renew session'});
            }
          });
          
        } else {
          cb(400, { 'Error': 'Session expired'});
        }
      }  else {
        cb(400, { 'Error': 'Session does not exist' });
      }
    });

  } else {
    cb(400, { 'Error': 'Missing required field'});
  }

};

// Data (required) -> phone
// optional -> none
// @TODO let authed auth only access their data
// @TODO also clean up all associated data
auth.delete = (data, cb) => {
    // Check phone number is valid
    const id = validator.validateString(data.queryString.id, 10);

    if (id) {
      _data.read('auth', id, (err, data) => {
        if (!err && data) {
          // remove hashed password
          _data.delete('auth', id, (err) => {

            if (!err) {
              cb(200)
            } else {
              cb(500, { "Error": "Could not delete session"});
            }
          });
        }  else {
          cb(400, { "Error": "Session not found" });
        }
      });
    } else {
      cb(400, { "Error": "Missing required field" });
    }

};


module.exports = auth;